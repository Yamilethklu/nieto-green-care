import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/supabase/server";
import { calculatePrice } from "@/lib/pricing";
import type { PricingRule } from "@/types";

const querySchema = z.object({
  service: z.string().uuid(),
  frequency: z.enum(["one_time", "weekly", "biweekly", "monthly"]),
  sqft: z.coerce.number().positive().max(5_000_000),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid availability request" }, { status: 400 });
  const db = adminDb();
  if (!db) return NextResponse.json({ fullDates: [], estimatedPrice: null });
  const { service, frequency, sqft } = parsed.data;
  const [{ data: capacity }, { data: rules }] = await Promise.all([
    db.from("schedule_capacity").select("service_date").eq("full", true).gte("service_date", new Date().toISOString().slice(0, 10)),
    db.from("pricing_rules").select("service_id,min_sqft,max_sqft,price,frequency,active").eq("service_id", service).eq("frequency", frequency).eq("active", true),
  ]);
  return NextResponse.json({
    fullDates: (capacity || []).map(item => item.service_date),
    estimatedPrice: calculatePrice(service, sqft, frequency, (rules || []) as PricingRule[]),
  }, { headers: { "Cache-Control": "private, max-age=60" } });
}
