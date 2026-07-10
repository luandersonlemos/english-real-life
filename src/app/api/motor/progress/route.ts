import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import type { UserProgress } from "@/types";
import {
  contentPath,
  isMotorEnabled,
  runMotorCommand,
} from "@/lib/motor-server";

export async function POST(request: Request) {
  if (!isMotorEnabled()) {
    return NextResponse.json({ ok: false, reason: "motor-disabled" });
  }

  try {
    const progress = (await request.json()) as UserProgress;
    await mkdir(contentPath(), { recursive: true });
    await writeFile(contentPath("progress.json"), JSON.stringify(progress, null, 2), "utf-8");
    runMotorCommand("daily");
    runMotorCommand("journal");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  if (!isMotorEnabled()) {
    return NextResponse.json({ ok: false, reason: "motor-disabled" });
  }

  try {
    const { readFile } = await import("fs/promises");
    const { existsSync } = await import("fs");
    const file = contentPath("progress.json");
    if (!existsSync(file)) {
      return NextResponse.json({ ok: false, reason: "missing" });
    }
    const progress = JSON.parse(await readFile(file, "utf-8"));
    return NextResponse.json({ ok: true, progress });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
