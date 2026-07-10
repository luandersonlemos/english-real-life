import { spawn } from "child_process";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const OUTPUT_DIR = path.join(ROOT, "output");

export function isMotorEnabled(): boolean {
  return process.env.VERCEL !== "1";
}

export function contentPath(...parts: string[]): string {
  return path.join(CONTENT_DIR, ...parts);
}

export function outputPath(...parts: string[]): string {
  return path.join(OUTPUT_DIR, ...parts);
}

export function runMotorCommand(command: string, extraArgs: string[] = []): void {
  if (!isMotorEnabled()) return;

  const child = spawn("python", ["-m", "ebrl", command, ...extraArgs], {
    cwd: ROOT,
    env: { ...process.env, PYTHONPATH: path.join(ROOT, "scripts") },
    stdio: "ignore",
    detached: true,
    windowsHide: true,
  });

  child.unref();
}

export async function readLatestDailyJson(): Promise<Record<string, unknown> | null> {
  if (!existsSync(OUTPUT_DIR)) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayPath = outputPath(`daily-${today}.json`);
  if (existsSync(todayPath)) {
    return JSON.parse(await readFile(todayPath, "utf-8")) as Record<string, unknown>;
  }

  const { readdir } = await import("fs/promises");
  const files = (await readdir(OUTPUT_DIR))
    .filter((name) => name.startsWith("daily-") && name.endsWith(".json"))
    .sort()
    .reverse();

  if (!files.length) return null;
  return JSON.parse(await readFile(outputPath(files[0]), "utf-8")) as Record<string, unknown>;
}
