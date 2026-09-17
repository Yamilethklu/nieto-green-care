import { requireAdmin } from "@/lib/supabase/auth";
import { AdminLeadsPanel } from "@/components/admin/AdminLeadsPanel";

export const dynamic = "force-dynamic";
export default async function Page() {
  const auth = await requireAdmin();
  if (!auth) return null;
  const { data: leads } = await auth.db.from("leads").select("id,status,full_name,created_at,phone,property_address").order("created_at", { ascending: false });
  return <main className="admin-shell"><div className="admin-card"><p className="eyebrow">Operations</p><h1>Lead dashboard</h1><p>Review requests and keep scheduling capacity up to date.</p></div><AdminLeadsPanel leads={(leads || []) as never[]} /></main>;
}
