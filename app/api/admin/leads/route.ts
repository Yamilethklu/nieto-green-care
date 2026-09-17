import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!id || !["scheduled", "completed", "cancelled"].includes(status)) return NextResponse.json({ error: "Invalid lead update." }, { status: 400 });
  const { error } = await auth.db.from("leads").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Lead status could not be updated." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
