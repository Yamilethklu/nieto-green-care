import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const serviceDate = typeof body?.service_date === "string" ? body.service_date : "";
  const capacity = Number(body?.capacity);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || !Number.isInteger(capacity) || capacity < 0) return NextResponse.json({ error: "Provide a valid date and non-negative capacity." }, { status: 400 });
  const { error } = await auth.db.from("schedule_capacity").upsert({ service_date: serviceDate, capacity, notes: typeof body?.notes === "string" ? body.notes.trim() || null : null, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Schedule capacity could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
