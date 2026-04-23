import { createApp } from "../server.ts";

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: any, res: any) {
  appPromise ??= createApp("vercel");
  const app = await appPromise;
  return app(req, res);
}
