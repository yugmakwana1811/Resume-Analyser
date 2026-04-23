async function postJson<T = any>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data as T;
}

export const aiService = {
  analyzeResume(resumeText: string): Promise<any> {
    return postJson("/api/ai/resume/analyze", { resumeText });
  },

  improveResume(resumeData: any): Promise<any> {
    return postJson("/api/ai/resume/improve", { resumeData });
  },

  matchJob(userId: string, jobId: string, force = false): Promise<any> {
    return postJson("/api/jobs/" + jobId + "/match", { userId, force });
  },

  generateRoadmap(targetRole: string, currentProfile: any): Promise<any> {
    return postJson("/api/ai/roadmap", { targetRole, currentProfile });
  },

  async generateCoverLetter(userId: string, jobId: string, instructions = "") {
    const result = await postJson<{ coverLetter: string }>("/api/jobs/" + jobId + "/cover-letter", {
      userId,
      instructions,
    });

    return result;
  },

  async generateInterviewResponse(job: any, profile: any, history: { role: string; text: string }[]) {
    const result = await postJson<{ text: string }>("/api/ai/interview-response", {
      job,
      profile,
      history,
    });

    return result.text;
  },

  async generateJobDescription(title: string, company: string, type: string) {
    const result = await postJson<{ description: string }>("/api/ai/job-description", {
      title,
      company,
      type,
    });

    return result.description;
  },
};
