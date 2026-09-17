import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {adminDb} from "@/lib/supabase/server";
import {calculatePrice} from "@/lib/pricing";
import type {Frequency,PricingRule} from "@/types";

const schema=z.object({service_id:z.string().uuid(),lawn_sqft:z.number().positive().max(5000000),frequency:z.enum(["one_time","weekly","biweekly","monthly"])});

export async function POST(req:NextRequest){
  const db=adminDb();
  if(!db)return NextResponse.json({estimate:null,custom:true},{status:200});
  let input:z.infer<typeof schema>;
  try{input=schema.parse(await req.json())}catch{return NextResponse.json({error:"Invalid quote details."},{status:400})}
  const {data:rules,error}=await db.from("pricing_rules").select("service_id,min_sqft,max_sqft,price,frequency,active").eq("service_id",input.service_id).eq("active",true);
  if(error)return NextResponse.json({error:"Unable to calculate estimate."},{status:500});
  const estimate=calculatePrice(input.service_id,input.lawn_sqft,input.frequency as Frequency,(rules||[]) as PricingRule[]);
  return NextResponse.json({estimate,custom:estimate===null});
}
