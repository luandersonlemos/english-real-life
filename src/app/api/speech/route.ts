import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { isMotorEnabled } from "@/lib/motor-server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "word";
}

function audioPath(text: string): string {
  return path.join(process.cwd(), "public", "audio", `${slugify(text)}.mp3`);
}

function generateWithPython(text: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("python", ["scripts/tts.py", text, output], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONPATH: path.join(process.cwd(), "scripts") },
      stdio: "ignore",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tts failed (${code})`));
    });
  });
}

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim();
  if (!text || text.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const file = audioPath(text);

  try {
    if (!existsSync(file) && isMotorEnabled()) {
      await mkdir(path.dirname(file), { recursive: true });
      await generateWithPython(text, file);
    }

    if (!existsSync(file)) {
      return NextResponse.json({ ok: false, reason: "missing" }, { status: 404 });
    }

    const buffer = await readFile(file);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ ok: false }, { status: 400 });

  const url = new URL(request.url);
  url.searchParams.set("text", text);
  return GET(new Request(url.toString(), request));
}
