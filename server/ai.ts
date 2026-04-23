import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

type ChatMessage = { role: string; text: string };

const COMMON_SKILLS = [
  "react",
  "typescript",
  "javascript",
  "node.js",
  "node",
  "python",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "figma",
  "product",
  "design",
  "marketing",
  "communication",
  "leadership",
  "testing",
  "analytics",
  "llm",
  "ai",
  "machine learning",
];

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function profileSummary(profileData: any) {
  const skills = parseJson<string[]>(profileData?.skills, [])
    .filter(Boolean)
    .join(", ");
  const experience = parseJson<any[]>(profileData?.experience, [])
    .map((item) => `${item.title ?? "Role"} at ${item.company ?? "Company"}`)
    .join("; ");

  return [
    sanitizeText(profileData?.name),
    sanitizeText(profileData?.headline),
    sanitizeText(profileData?.bio),
    skills,
    experience,
    sanitizeText(profileData?.resume?.content),
  ]
    .filter(Boolean)
    .join("\n");
}

function detectSkills(text: string) {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter((skill) => lower.includes(skill));
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function mockMatch(profileData: any, jobData: any) {
  const profileText = profileSummary(profileData);
  const jobText = `${sanitizeText(jobData?.title)}\n${sanitizeText(jobData?.description)}\n${sanitizeText(jobData?.requirements)}`;
  const profileSkills = new Set(detectSkills(profileText));
  const jobSkills = detectSkills(jobText);
  const matchedSkills = jobSkills.filter((skill) => profileSkills.has(skill));
  const uniqueJobSkills = [...new Set(jobSkills)];
  const missingKeywords = uniqueJobSkills.filter((skill) => !profileSkills.has(skill)).slice(0, 5);
  const overlap = uniqueJobSkills.length === 0 ? 0.65 : matchedSkills.length / uniqueJobSkills.length;
  const score = Math.max(48, Math.min(96, Math.round(overlap * 45 + 48)));

  return {
    score,
    reasoning:
      matchedSkills.length > 0
        ? `Strong overlap in ${matchedSkills.slice(0, 3).join(", ")}.`
        : "Your transferable experience aligns, but the role would benefit from a few more explicit keywords.",
    missingKeywords,
    fitAnalysis: `${sanitizeText(profileData?.name) || "This candidate"} appears well aligned for ${
      sanitizeText(jobData?.title) || "the role"
    }. Highlighting ${matchedSkills.slice(0, 3).join(", ") || "recent impact, domain experience, and measurable outcomes"} should improve the application further.`,
  };
}

function mockResumeAnalysis(resumeText: string) {
  const normalized = resumeText.replace(/\s+/g, " ").trim();
  const sentences = normalized.split(/[.!?]\s+/).filter(Boolean);
  const skills = detectSkills(normalized);
  const atsScore = Math.max(58, Math.min(92, 60 + skills.length * 4));

  return {
    name: "Candidate",
    headline: sentences[0] || "Professional resume summary",
    skills: skills.length > 0 ? skills.map(titleCase) : ["Communication", "Problem Solving"],
    experience: sentences.slice(0, 3).map((sentence, index) => ({
      title: index === 0 ? "Recent Experience" : `Role ${index + 1}`,
      company: "Previous Employer",
      period: "Recent",
      description: sentence,
    })),
    education: [],
    atsScore,
    improvements: [
      "Add more measurable results to your most recent experience.",
      "Mirror the most important job keywords in your summary and skills section.",
      "Keep bullet points concise and outcome-focused for better ATS readability.",
    ],
  };
}

function mockResumeImprovements(resumeData: any) {
  const experience = Array.isArray(resumeData?.experience) ? resumeData.experience : [];

  return {
    suggestedHeadline: sanitizeText(resumeData?.headline) || "Outcome-driven professional with measurable impact",
    improvedBullets: experience.slice(0, 3).map((item: any, index: number) => ({
      original: sanitizeText(item?.description) || `Existing bullet ${index + 1}`,
      improved: `Led ${sanitizeText(item?.title) || "cross-functional initiatives"} with clear ownership, measurable delivery, and stakeholder alignment.`,
      reason: "This version emphasizes ownership, execution, and concrete impact.",
    })),
    missingSkills: ["Stakeholder Communication", "Metrics Reporting", "Process Optimization"],
  };
}

function mockRoadmap(targetRole: string, currentProfile: any) {
  const currentHeadline = sanitizeText(currentProfile?.headline) || "your current profile";

  return {
    steps: [
      {
        milestone: "Strengthen Core Story",
        description: `Refine ${currentHeadline} into a narrative that clearly points toward ${targetRole}.`,
        skillsToLearn: ["Positioning", "Resume storytelling"],
        duration: "2 weeks",
      },
      {
        milestone: "Close Skill Gaps",
        description: `Identify the top skills repeatedly requested for ${targetRole} and build proof through projects or certifications.`,
        skillsToLearn: ["Portfolio building", "Role-specific tooling"],
        duration: "4-6 weeks",
      },
      {
        milestone: "Interview Readiness",
        description: "Practice role-specific questions and prepare concise achievement stories with metrics.",
        skillsToLearn: ["Interview prep", "STAR storytelling"],
        duration: "2 weeks",
      },
    ],
    totalEstimatedTime: "8-10 weeks",
  };
}

function mockCoverLetter(profileData: any, jobData: any, instructions?: string) {
  const name = sanitizeText(profileData?.name) || "Candidate";
  const jobTitle = sanitizeText(jobData?.title) || "the role";
  const company = sanitizeText(jobData?.company) || "your team";
  const headline = sanitizeText(profileData?.headline) || "a results-oriented professional";
  const instructionsLine = sanitizeText(instructions)
    ? `I have also tailored this application to reflect ${sanitizeText(instructions)}.`
    : "";

  return {
    coverLetter: `Dear Hiring Team,

I'm excited to apply for the ${jobTitle} position at ${company}. I'm ${name}, ${headline}, and I believe my background is a strong match for the impact you need in this role.

Across my recent work, I have focused on delivering practical results, collaborating across teams, and translating complex requirements into reliable execution. ${instructionsLine}

What stands out to me about ${company} is the opportunity to contribute meaningfully while continuing to grow. I would welcome the chance to bring thoughtful execution, clear communication, and a strong ownership mindset to your team.

Thank you for your time and consideration.

Sincerely,
${name}`,
  };
}

function mockInterviewResponse(job: any, history: ChatMessage[]) {
  const userMessages = history.filter((message) => message.role === "user");

  if (userMessages.length === 0) {
    return `Welcome. Let's begin with a quick overview: what makes you a strong fit for the ${sanitizeText(job?.title)} role at ${sanitizeText(job?.company)}?`;
  }

  return "Thanks for that answer. Can you walk me through a specific project where you handled ambiguity, made tradeoffs, and delivered a measurable result?";
}

function mockJobDescription(title: string, company: string, type: string) {
  return `${company} is hiring a ${title} (${type.replaceAll("_", " ")}) to help us deliver thoughtful, high-impact work.

What you'll do:
- Own meaningful projects from planning through delivery.
- Collaborate across product, design, and engineering or business partners.
- Improve systems, processes, and customer outcomes through clear execution.

What we're looking for:
- Strong communication and ownership.
- Relevant domain experience and comfort working in fast-moving environments.
- A track record of shipping work with measurable impact.`;
}

async function withFallback<T>(runner: () => Promise<T>, fallback: () => T) {
  if (!ai) return fallback();

  try {
    return await runner();
  } catch (error) {
    console.error("AI fallback triggered:", error);
    return fallback();
  }
}

export async function analyzeResume(resumeText: string) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this resume text and extract structured data: ${resumeText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              headline: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                },
              },
              atsScore: { type: Type.NUMBER },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "skills", "atsScore"],
          },
        },
      });

      return parseJson(response.text, mockResumeAnalysis(resumeText));
    },
    () => mockResumeAnalysis(resumeText),
  );
}

export async function improveResume(resumeData: any) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Suggest improvements and rewrites for this resume data to make it more professional and ATS-friendly: ${JSON.stringify(
          resumeData,
        )}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedHeadline: { type: Type.STRING },
              improvedBullets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    improved: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      });

      return parseJson(response.text, mockResumeImprovements(resumeData));
    },
    () => mockResumeImprovements(resumeData),
  );
}

export async function matchJob(profileData: any, jobData: any) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Score the match between this user profile and job description.
Profile: ${JSON.stringify(profileData)}
Job: ${JSON.stringify(jobData)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Match score from 0 to 100" },
              reasoning: { type: Type.STRING },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              fitAnalysis: { type: Type.STRING },
            },
            required: ["score", "reasoning"],
          },
        },
      });

      return parseJson(response.text, mockMatch(profileData, jobData));
    },
    () => mockMatch(profileData, jobData),
  );
}

export async function generateRoadmap(targetRole: string, currentProfile: any) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a career roadmap to become a ${targetRole} starting from this profile: ${JSON.stringify(
          currentProfile,
        )}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    milestone: { type: Type.STRING },
                    description: { type: Type.STRING },
                    skillsToLearn: { type: Type.ARRAY, items: { type: Type.STRING } },
                    duration: { type: Type.STRING },
                  },
                },
              },
              totalEstimatedTime: { type: Type.STRING },
            },
          },
        },
      });

      return parseJson(response.text, mockRoadmap(targetRole, currentProfile));
    },
    () => mockRoadmap(targetRole, currentProfile),
  );
}

export async function generateCoverLetter(profileData: any, jobData: any, instructions?: string) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a professional cover letter for this job and user profile.
Profile: ${JSON.stringify(profileData)}
Job: ${JSON.stringify(jobData)}
Specific instructions or keywords to incorporate: ${sanitizeText(instructions) || "None provided"}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coverLetter: { type: Type.STRING },
            },
          },
        },
      });

      return parseJson(response.text, mockCoverLetter(profileData, jobData, instructions));
    },
    () => mockCoverLetter(profileData, jobData, instructions),
  );
}

export async function generateInterviewResponse(job: any, profile: any, history: ChatMessage[]) {
  return withFallback(
    async () => {
      const contents = history.map((message) => ({
        role: message.role === "model" ? "model" : "user",
        parts: [{ text: message.text }],
      }));

      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents as any,
        config: {
          systemInstruction: `You are an expert technical and behavioral interviewer hiring for the role of ${sanitizeText(
            job?.title,
          )} at ${sanitizeText(job?.company)}.
The candidate's profile is: ${JSON.stringify(profile)}.
Your goal is to conduct a realistic mock interview. Ask one question at a time. Do not break character.`,
        },
      });

      return response.text || mockInterviewResponse(job, history);
    },
    () => mockInterviewResponse(job, history),
  );
}

export async function generateJobDescription(title: string, company: string, type: string) {
  return withFallback(
    async () => {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a professional, attractive job description for a ${type} ${title} role at ${company}. Keep it structured. Do not use markdown symbols. Keep it under 200 words.`,
      });

      return response.text || mockJobDescription(title, company, type);
    },
    () => mockJobDescription(title, company, type),
  );
}
