import { NextResponse } from "next/server";
import { isMotorEnabled, readLatestDailyJson } from "@/lib/motor-server";

export async function GET() {
  if (!isMotorEnabled()) {
    return NextResponse.json({ ok: false, reason: "motor-disabled" });
  }

  try {
    const plan = await readLatestDailyJson();
    if (!plan) {
      return NextResponse.json({ ok: false, reason: "not-generated" });
    }
    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
