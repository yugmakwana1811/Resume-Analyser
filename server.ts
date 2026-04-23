import "dotenv/config";
import crypto from "crypto";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import {
  analyzeResume,
  generateCoverLetter,
  generateInterviewResponse,
  generateJobDescription,
  generateRoadmap,
  improveResume,
  matchJob,
} from "./server/ai.ts";

interface MulterRequest extends express.Request {
  file?: any;
}

type SessionRole = "SEEKER" | "RECRUITER";

type AuthPayload = {
  id: string;
  email: string;
  role: SessionRole;
  profileId?: string | null;
  recruiterId?: string | null;
};

type SessionPayload = AuthPayload & {
  exp: number;
};

interface AuthenticatedRequest extends express.Request {
  auth?: AuthPayload | null;
}

type AppRuntime = "dev" | "node" | "vercel";

const DEFAULT_DATABASE_URL = process.env.VERCEL ? "file:/tmp/applyiq.db" : "file:./dev.db";
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

function resolveSqliteFilePath(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("ApplyIQ currently expects a SQLite DATABASE_URL.");
  }

  const rawPath = databaseUrl.slice("file:".length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

const DATABASE_FILE_PATH = resolveSqliteFilePath(DATABASE_URL);
const adapter = new PrismaBetterSqlite3({
  url: DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const PORT = Number(process.env.PORT ?? 3000);
const APP_STATUSES = ["PENDING", "SHORTLISTED", "REJECTED"] as const;
const SESSION_COOKIE_NAME = "applyiq_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_SECRET = process.env.SESSION_SECRET || "applyiq-dev-session-secret";
const ALLOWED_RESUME_TYPES = new Set(["application/pdf", "text/plain"]);
const appPromises = new Map<AppRuntime, Promise<express.Express>>();
let databaseInitialized = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function serializeJsonField(value: unknown) {
  return value === undefined ? undefined : JSON.stringify(value);
}

function ensureApplicationHistory<T extends { id: string; appliedAt: Date; status: string; statusHistory?: any[] }>(application: T) {
  if (application.statusHistory && application.statusHistory.length > 0) {
    return application;
  }

  return {
    ...application,
    statusHistory: [
      {
        id: `${application.id}-initial`,
        status: application.status,
        note: "Application submitted",
        changedAt: application.appliedAt,
      },
    ],
  };
}

function displayCandidateName(application: any) {
  return (
    application.user?.profile?.name ||
    application.user?.email?.split("@")[0] ||
    "Applicant"
  );
}

function buildAuthPayload(user: {
  id: string;
  email: string;
  role: string;
  profile?: { id: string } | null;
  recruiter?: { id: string } | null;
}): AuthPayload {
  return {
    id: user.id,
    email: user.email,
    role: user.role === "RECRUITER" ? "RECRUITER" : "SEEKER",
    profileId: user.profile?.id ?? null,
    recruiterId: user.recruiter?.id ?? null,
  };
}

function parseCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) return {} as Record<string, string>;

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, segment) => {
    const [rawName, ...rawValue] = segment.trim().split("=");
    if (!rawName || rawValue.length === 0) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function signSessionValue(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function createSessionToken(user: AuthPayload) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Date.now() + SESSION_TTL_MS,
    } satisfies SessionPayload),
    "utf8",
  ).toString("base64url");
  const signature = signSessionValue(payload);
  return `${payload}.${signature}`;
}

function parseSessionToken(token?: string): AuthPayload | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = signSessionValue(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      role: parsed.role,
      profileId: parsed.profileId ?? null,
      recruiterId: parsed.recruiterId ?? null,
    };
  } catch {
    return null;
  }
}

function readAuthFromRequest(req: express.Request) {
  const cookies = parseCookieHeader(req.headers.cookie);
  return parseSessionToken(cookies[SESSION_COOKIE_NAME]);
}

function setSessionCookie(res: express.Response, user: AuthPayload) {
  res.cookie(SESSION_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function clearSessionCookie(res: express.Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function requireAuth(req: AuthenticatedRequest, res: express.Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }

  return req.auth;
}

function requireSameUser(req: AuthenticatedRequest, res: express.Response, userId: string) {
  const auth = requireAuth(req, res);
  if (!auth) return null;

  if (auth.id !== userId) {
    res.status(403).json({ error: "You do not have access to this resource." });
    return null;
  }

  return auth;
}

function requireRecruiter(req: AuthenticatedRequest, res: express.Response, recruiterId?: string | null) {
  const auth = requireAuth(req, res);
  if (!auth) return null;

  if (auth.role !== "RECRUITER" || !auth.recruiterId || (recruiterId && auth.recruiterId !== recruiterId)) {
    res.status(403).json({ error: "Recruiter access is required for this action." });
    return null;
  }

  return auth;
}

async function ensureLegacyCompatibility() {
  const jobColumns = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info("Job")`);
  if (jobColumns.length > 0 && !jobColumns.some((column) => column.name === "viewCount")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Job" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0`,
    );
  }

  const applicationColumns = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info("Application")`);
  if (
    applicationColumns.length > 0 &&
    !applicationColumns.some((column) => column.name === "updatedAt")
  ) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Application" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ApplicationStatusHistory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "applicationId" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "note" TEXT,
      "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ApplicationStatusHistory_applicationId_fkey"
        FOREIGN KEY ("applicationId") REFERENCES "Application" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM "Match"
    WHERE rowid NOT IN (
      SELECT MIN(rowid)
      FROM "Match"
      GROUP BY "userId", "jobId"
    )
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM "Application"
    WHERE rowid NOT IN (
      SELECT MIN(rowid)
      FROM "Application"
      GROUP BY "userId", "jobId"
    )
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Match_userId_jobId_key" ON "Match"("userId", "jobId")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Application_userId_jobId_key" ON "Application"("userId", "jobId")`,
  );
}

async function seedSampleJobs() {
  const jobCount = await prisma.job.count();

  if (jobCount > 0) return;

  await prisma.job.createMany({
    data: [
      {
        title: "Senior Full Stack Engineer",
        company: "GlobalTech Solutions",
        description:
          "Looking for an expert in React, Node.js and distributed systems to lead our core platform team.",
        category: "Engineering",
        type: "FULL_TIME",
        location: "San Francisco / Remote",
        salary: "$140k - $180k",
        experienceLevel: "SENIOR",
        workMode: "REMOTE",
        companySize: "ENTERPRISE",
        viewCount: 37,
      },
      {
        title: "Product Designer",
        company: "CreativeFlow",
        description:
          "Design intuitive interfaces for our next-generation creative tools. Proficiency in Figma and motion design required.",
        category: "Design",
        type: "FULL_TIME",
        location: "Brooklyn, NY / Remote",
        salary: "$110k - $150k",
        experienceLevel: "MID_LEVEL",
        workMode: "HYBRID",
        companySize: "MID_SIZE",
        viewCount: 24,
      },
      {
        title: "AI Research Intern",
        company: "NeuralMind Labs",
        description:
          "Great opportunity for grad students to work on cutting-edge LLM alignment and evaluation pipelines.",
        category: "Engineering",
        type: "INTERNSHIP",
        location: "Palo Alto, CA",
        salary: "$45/hr",
        experienceLevel: "ENTRY",
        workMode: "ONSITE",
        companySize: "STARTUP",
        viewCount: 18,
      },
      {
        title: "Growth Marketing Manager",
        company: "SaaS Launchpad",
        description:
          "Help us scale our user base to 1M+ using data-driven experimentation and performance marketing.",
        category: "Marketing",
        type: "FULL_TIME",
        location: "Remote",
        salary: "$90k - $130k",
        experienceLevel: "MID_LEVEL",
        workMode: "REMOTE",
        companySize: "MID_SIZE",
        viewCount: 29,
      },
    ],
  });

  console.log("Sample jobs seeded.");
}

function resolveInitSqlPath() {
  const candidates = [
    path.resolve(process.cwd(), "prisma/init.sql"),
    path.resolve(__dirname, "prisma/init.sql"),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) {
    throw new Error("Could not locate prisma/init.sql for database initialization.");
  }

  return match;
}

async function initializeDatabase() {
  if (databaseInitialized) return;

  mkdirSync(path.dirname(DATABASE_FILE_PATH), { recursive: true });

  const bootstrapDb = new Database(DATABASE_FILE_PATH);
  bootstrapDb.pragma("foreign_keys = ON");
  bootstrapDb.exec(readFileSync(resolveInitSqlPath(), "utf8"));
  bootstrapDb.close();

  await ensureLegacyCompatibility();
  databaseInitialized = true;
}

async function createAppInternal(runtime: AppRuntime) {
  const app = express();

  await initializeDatabase();
  app.use(express.json({ limit: "2mb" }));
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).auth = readAuthFromRequest(req);
    next();
  });

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req: AuthenticatedRequest, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      if (String(password).length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
      }

      const normalizedRole: SessionRole = role === "RECRUITER" ? "RECRUITER" : "SEEKER";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: normalizedRole,
          profile: normalizedRole === "SEEKER" ? { create: {} } : undefined,
          recruiter: normalizedRole === "RECRUITER" ? { create: {} } : undefined,
        },
        include: {
          profile: true,
          recruiter: true,
        },
      });

      const authPayload = buildAuthPayload(user);
      setSessionCookie(res, authPayload);
      res.status(201).json(authPayload);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (_req: AuthenticatedRequest, res) => {
    try {
      const { email, password } = _req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, recruiter: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const authPayload = buildAuthPayload(user);
      setSessionCookie(res, authPayload);
      res.json(authPayload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const user = await prisma.user.findUnique({
        where: { id: auth.id },
        include: { profile: true, recruiter: true },
      });

      if (!user) {
        clearSessionCookie(res);
        return res.status(401).json({ error: "Session is no longer valid." });
      }

      const authPayload = buildAuthPayload(user);
      setSessionCookie(res, authPayload);
      res.json(authPayload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ loggedOut: true });
  });

  // --- PROFILE ROUTES ---
  app.get("/api/profile/:userId", async (req: AuthenticatedRequest, res) => {
    try {
      const canViewResume = req.auth?.id === req.params.userId;
      const profile = await prisma.profile.findUnique({
        where: { userId: req.params.userId },
        include: { resume: canViewResume },
      });

      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      const { name, headline, bio, skills, education, experience, projects, achievements } = req.body;
      const profile = await prisma.profile.upsert({
        where: { userId: req.params.userId },
        update: {
          ...(name !== undefined ? { name } : {}),
          ...(headline !== undefined ? { headline } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(skills !== undefined ? { skills: serializeJsonField(skills) } : {}),
          ...(education !== undefined ? { education: serializeJsonField(education) } : {}),
          ...(experience !== undefined ? { experience: serializeJsonField(experience) } : {}),
          ...(projects !== undefined ? { projects: serializeJsonField(projects) } : {}),
          ...(achievements !== undefined ? { achievements: serializeJsonField(achievements) } : {}),
        },
        create: {
          userId: req.params.userId,
          name,
          headline,
          bio,
          skills: serializeJsonField(skills),
          education: serializeJsonField(education),
          experience: serializeJsonField(experience),
          projects: serializeJsonField(projects),
          achievements: serializeJsonField(achievements),
        },
      });

      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- RESUME ROUTES ---
  app.post("/api/resume/upload", upload.single("resume"), async (req: MulterRequest, res) => {
    const auth = requireAuth(req as AuthenticatedRequest, res);
    if (!auth) return;

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { profileId } = req.body;
      if (!profileId) {
        return res.status(400).json({ error: "profileId is required" });
      }

      if (!ALLOWED_RESUME_TYPES.has(req.file.mimetype)) {
        return res.status(400).json({ error: "Only PDF and TXT resumes are supported." });
      }

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
      });
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      if (profile.userId !== auth.id) {
        return res.status(403).json({ error: "You can only upload a resume for your own profile." });
      }

      let content = "";

      if (req.file.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        content = data.text;
        await parser.destroy();
      } else {
        content = req.file.buffer.toString();
      }

      const resume = await prisma.resume.upsert({
        where: { profileId },
        update: { content },
        create: { profileId, content },
      });

      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- JOB ROUTES ---
  app.get("/api/jobs", async (req, res) => {
    try {
      const { query, category, requirements, experienceLevel, workMode, companySize, recruiterId } = req.query;
      const jobs = await prisma.job.findMany({
        where: {
          recruiterId: recruiterId ? String(recruiterId) : undefined,
          OR: query
            ? [
                { title: { contains: String(query) } },
                { description: { contains: String(query) } },
                { company: { contains: String(query) } },
              ]
            : undefined,
          category: category ? String(category) : undefined,
          requirements: requirements ? { contains: String(requirements) } : undefined,
          experienceLevel: experienceLevel ? String(experienceLevel) : undefined,
          workMode: workMode ? String(workMode) : undefined,
          companySize: companySize ? String(companySize) : undefined,
        },
        orderBy: { createdAt: "desc" },
        include: {
          recruiter: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/recruiters/:recruiterId/jobs", async (req: AuthenticatedRequest, res) => {
    if (!requireRecruiter(req, res, req.params.recruiterId)) return;

    try {
      const jobs = await prisma.job.findMany({
        where: { recruiterId: req.params.recruiterId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs", async (req: AuthenticatedRequest, res) => {
    const auth = requireRecruiter(req, res);
    if (!auth) return;

    try {
      const {
        title,
        company,
        description,
        requirements,
        location,
        salary,
        type,
        category,
        experienceLevel,
        workMode,
        companySize,
      } = req.body;

      if (!title || !company || !description) {
        return res.status(400).json({ error: "Title, company, and description are required." });
      }

      const job = await prisma.job.create({
        data: {
          title,
          company,
          description,
          requirements,
          location,
          salary,
          type,
          category,
          experienceLevel,
          workMode,
          companySize,
          recruiterId: auth.recruiterId!,
        },
      });

      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/jobs/:jobId", async (req: AuthenticatedRequest, res) => {
    try {
      const { jobId } = req.params;
      const existingJob = await prisma.job.findUnique({ where: { id: jobId } });

      if (!existingJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (!requireRecruiter(req, res, existingJob.recruiterId)) return;

      await prisma.$transaction([
        prisma.applicationStatusHistory.deleteMany({
          where: {
            application: {
              jobId,
            },
          },
        }),
        prisma.application.deleteMany({ where: { jobId } }),
        prisma.match.deleteMany({ where: { jobId } }),
        prisma.savedJob.deleteMany({ where: { jobId } }),
        prisma.jobFeedback.deleteMany({ where: { jobId } }),
        prisma.job.delete({ where: { id: jobId } }),
      ]);

      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:jobId/view", async (req, res) => {
    try {
      const job = await prisma.job.update({
        where: { id: req.params.jobId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          id: true,
          viewCount: true,
        },
      });

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:jobId/feedback", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { rating, comment, issueType } = req.body;
      const feedback = await prisma.jobFeedback.create({
        data: {
          userId: auth.id,
          jobId: req.params.jobId,
          rating: Number(rating),
          comment,
          issueType,
        },
      });

      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- COMPANY ROUTES ---
  app.get("/api/companies", async (_req, res) => {
    try {
      const companies = await prisma.recruiter.findMany({
        where: { companyName: { not: null } },
      });

      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await prisma.recruiter.findUnique({
        where: { id: req.params.id },
        include: { jobs: true },
      });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- RECRUITER DASHBOARD ROUTES ---
  app.get("/api/recruiters/:recruiterId/overview", async (req: AuthenticatedRequest, res) => {
    if (!requireRecruiter(req, res, req.params.recruiterId)) return;

    try {
      const recruiterId = req.params.recruiterId;
      const [activeJobs, totalApplicants, shortlisted, pending, rejected, totalViews, recentApplications] =
        await prisma.$transaction([
          prisma.job.count({ where: { recruiterId } }),
          prisma.application.count({ where: { job: { recruiterId } } }),
          prisma.application.count({ where: { job: { recruiterId }, status: "SHORTLISTED" } }),
          prisma.application.count({ where: { job: { recruiterId }, status: "PENDING" } }),
          prisma.application.count({ where: { job: { recruiterId }, status: "REJECTED" } }),
          prisma.job.aggregate({
            where: { recruiterId },
            _sum: { viewCount: true },
          }),
          prisma.application.findMany({
            where: { job: { recruiterId } },
            orderBy: { appliedAt: "desc" },
            take: 5,
            include: {
              job: true,
              user: {
                include: {
                  profile: true,
                },
              },
            },
          }),
        ]);

      const matchKeys = recentApplications.map((application) => ({
        userId: application.userId,
        jobId: application.jobId,
      }));

      const matches = matchKeys.length
        ? await prisma.match.findMany({
            where: {
              OR: matchKeys,
            },
            select: {
              userId: true,
              jobId: true,
              score: true,
            },
          })
        : [];

      const matchMap = new Map(matches.map((match) => [`${match.userId}:${match.jobId}`, match.score]));

      res.json({
        stats: {
          activeJobs,
          totalApplicants,
          shortlisted,
          totalViews: totalViews._sum.viewCount ?? 0,
        },
        pipeline: [
          { label: "Pending", count: pending },
          { label: "Shortlisted", count: shortlisted },
          { label: "Rejected", count: rejected },
        ],
        recentActivity: recentApplications.map((application) => ({
          id: application.id,
          candidateName: displayCandidateName(application),
          jobTitle: application.job.title,
          company: application.job.company,
          appliedAt: application.appliedAt,
          status: application.status,
          matchScore: matchMap.get(`${application.userId}:${application.jobId}`) ?? null,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/recruiters/:recruiterId/applications", async (req: AuthenticatedRequest, res) => {
    if (!requireRecruiter(req, res, req.params.recruiterId)) return;

    try {
      const applications = await prisma.application.findMany({
        where: {
          job: {
            recruiterId: req.params.recruiterId,
          },
        },
        orderBy: { appliedAt: "desc" },
        include: {
          job: true,
          user: {
            include: {
              profile: true,
            },
          },
          statusHistory: {
            orderBy: {
              changedAt: "desc",
            },
          },
        },
      });

      res.json(applications.map(ensureApplicationHistory));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- PREFERENCES ROUTES ---
  app.get("/api/preferences/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      let preference = await prisma.jobPreference.findUnique({
        where: { userId: req.params.userId },
      });

      if (!preference) {
        preference = await prisma.jobPreference.create({
          data: { userId: req.params.userId },
        });
      }

      res.json(preference);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/preferences/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      const { keywords, categories, workModes, experienceLevels, emailAlerts, inAppAlerts } = req.body;
      const preference = await prisma.jobPreference.upsert({
        where: { userId: req.params.userId },
        update: {
          keywords: JSON.stringify(keywords || []),
          categories: JSON.stringify(categories || []),
          workModes: JSON.stringify(workModes || []),
          experienceLevels: JSON.stringify(experienceLevels || []),
          emailAlerts,
          inAppAlerts,
        },
        create: {
          userId: req.params.userId,
          keywords: JSON.stringify(keywords || []),
          categories: JSON.stringify(categories || []),
          workModes: JSON.stringify(workModes || []),
          experienceLevels: JSON.stringify(experienceLevels || []),
          emailAlerts,
          inAppAlerts,
        },
      });

      res.json(preference);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- APPLICATION ROUTES ---
  app.post("/api/applications", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { jobId, coverLetter } = req.body;
      const userId = auth.id;
      const existingApplication = await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      if (existingApplication) {
        return res.status(409).json({ error: "You have already applied to this job." });
      }

      const application = await prisma.application.create({
        data: {
          userId,
          jobId,
          coverLetter,
          statusHistory: {
            create: {
              status: "PENDING",
              note: "Application submitted",
            },
          },
        },
        include: {
          job: true,
          statusHistory: {
            orderBy: {
              changedAt: "desc",
            },
          },
        },
      });

      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      const applications = await prisma.application.findMany({
        where: { userId: req.params.userId },
        include: {
          job: true,
          statusHistory: {
            orderBy: {
              changedAt: "desc",
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      res.json(applications.map(ensureApplicationHistory));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/applications/:applicationId/status", async (req: AuthenticatedRequest, res) => {
    const auth = requireRecruiter(req, res);
    if (!auth) return;

    try {
      const { status, note } = req.body;
      const normalizedStatus = String(status).toUpperCase();

      if (!APP_STATUSES.includes(normalizedStatus as (typeof APP_STATUSES)[number])) {
        return res.status(400).json({ error: "Unsupported application status." });
      }

      const current = await prisma.application.findUnique({
        where: { id: req.params.applicationId },
        include: {
          job: {
            select: {
              recruiterId: true,
            },
          },
        },
      });

      if (!current) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (current.job.recruiterId !== auth.recruiterId) {
        return res.status(403).json({ error: "You can only update applications for your own listings." });
      }

      const application = await prisma.$transaction(async (tx) => {
        const updated =
          current.status === normalizedStatus
            ? current
            : await tx.application.update({
                where: { id: req.params.applicationId },
                data: { status: normalizedStatus },
              });

        if (current.status !== normalizedStatus) {
          await tx.applicationStatusHistory.create({
            data: {
              applicationId: req.params.applicationId,
              status: normalizedStatus,
              note: note || `Status updated to ${normalizedStatus.toLowerCase()}.`,
            },
          });
        }

        return tx.application.findUnique({
          where: { id: updated.id },
          include: {
            job: true,
            user: {
              include: {
                profile: true,
              },
            },
            statusHistory: {
              orderBy: {
                changedAt: "desc",
              },
            },
          },
        });
      });

      res.json(application ? ensureApplicationHistory(application) : null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- MATCH ROUTES ---
  app.get("/api/matches/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      const matches = await prisma.match.findMany({
        where: { userId: req.params.userId },
        include: { job: true },
        orderBy: { score: "desc" },
      });

      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:jobId/match", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { force } = req.body;
      const userId = auth.id;
      const jobId = req.params.jobId;
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: { resume: true },
      });
      const job = await prisma.job.findUnique({ where: { id: jobId } });

      if (!profile || !job) {
        return res.status(404).json({ error: "Profile or job not found" });
      }

      if (!force) {
        const existingMatch = await prisma.match.findUnique({
          where: {
            userId_jobId: {
              userId,
              jobId,
            },
          },
        });

        if (existingMatch) {
          return res.json({
            id: existingMatch.id,
            score: existingMatch.score,
            reasoning: existingMatch.reasoning,
            missingKeywords: [],
            fitAnalysis: existingMatch.reasoning || "Previously generated AI match score.",
          });
        }
      }

      const result = await matchJob(profile, job);
      const match = await prisma.match.upsert({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
        update: {
          score: result.score,
          reasoning: result.reasoning,
        },
        create: {
          userId,
          jobId,
          score: result.score,
          reasoning: result.reasoning,
        },
      });

      res.json({
        id: match.id,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:jobId/cover-letter", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { instructions } = req.body;
      const profile = await prisma.profile.findUnique({
        where: { userId: auth.id },
        include: { resume: true },
      });
      const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });

      if (!profile || !job) {
        return res.status(404).json({ error: "Profile or job not found" });
      }

      const result = await generateCoverLetter(profile, job, instructions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- SAVED JOB ROUTES ---
  app.post("/api/saved-jobs", async (req: AuthenticatedRequest, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { jobId } = req.body;
      const userId = auth.id;
      const existing = await prisma.savedJob.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      if (existing) {
        await prisma.savedJob.delete({
          where: { id: existing.id },
        });
        return res.json({ saved: false });
      }

      await prisma.savedJob.create({
        data: { userId, jobId },
      });

      res.json({ saved: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/saved-jobs/:userId", async (req: AuthenticatedRequest, res) => {
    if (!requireSameUser(req, res, req.params.userId)) return;

    try {
      const savedJobs = await prisma.savedJob.findMany({
        where: { userId: req.params.userId },
        include: { job: true },
        orderBy: { createdAt: "desc" },
      });

      res.json(savedJobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- AI ROUTES ---
  app.post("/api/ai/resume/analyze", async (req, res) => {
    try {
      const { resumeText } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "resumeText is required" });
      }

      res.json(await analyzeResume(String(resumeText)));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/resume/improve", async (req, res) => {
    try {
      res.json(await improveResume(req.body.resumeData));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/roadmap", async (req, res) => {
    try {
      const { targetRole, currentProfile } = req.body;
      if (!targetRole) {
        return res.status(400).json({ error: "targetRole is required" });
      }

      res.json(await generateRoadmap(String(targetRole), currentProfile));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/interview-response", async (req, res) => {
    try {
      const { job, profile, history } = req.body;
      res.json({
        text: await generateInterviewResponse(job, profile, Array.isArray(history) ? history : []),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/job-description", async (req, res) => {
    try {
      const { title, company, type } = req.body;
      if (!title || !company || !type) {
        return res.status(400).json({ error: "title, company, and type are required" });
      }

      res.json({
        description: await generateJobDescription(String(title), String(company), String(type)),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Resume files must be 5 MB or smaller." });
    }

    if (error) {
      return res.status(400).json({ error: error.message || "Request failed." });
    }

    next();
  });

  // --- VITE MIDDLEWARE ---
  if (runtime === "dev") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else if (runtime === "node") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  await seedSampleJobs();

  return app;
}

export async function createApp(runtime: AppRuntime = process.env.VERCEL
  ? "vercel"
  : process.env.NODE_ENV === "production"
    ? "node"
    : "dev") {
  const existing = appPromises.get(runtime);
  if (existing) {
    return existing;
  }

  const created = createAppInternal(runtime);
  appPromises.set(runtime, created);
  return created;
}

export async function startServer() {
  const runtime: AppRuntime = process.env.NODE_ENV === "production" ? "node" : "dev";
  const app = await createApp(runtime);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}
