import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/supabase/auth";

const allowedTypes=new Set(["image/jpeg","image/png","image/webp"]);
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};

export async function POST(req:NextRequest){
  const auth=await requireAdmin();
  if(!auth)return NextResponse.json({error:"Unauthorized"},{status:401});
  const form=await req.formData();
  const file=form.get("file");
  const altText=String(form.get("alt_text")||"").trim();
  if(!(file instanceof File)||!allowedTypes.has(file.type)||file.size>5*1024*1024||!altText)return NextResponse.json({error:"Use a JPG, PNG, or WebP image up to 5 MB and provide alt text."},{status:400});
  const path=`${crypto.randomUUID()}.${extensions[file.type]}`;
  const bytes=Buffer.from(await file.arrayBuffer());
  const {error:uploadError}=await auth.db.storage.from("gallery").upload(path,bytes,{contentType:file.type,upsert:false});
  if(uploadError)return NextResponse.json({error:"Image upload failed."},{status:500});
  const {data:{publicUrl}}=auth.db.storage.from("gallery").getPublicUrl(path);
  const {error:insertError}=await auth.db.from("gallery").insert({storage_path:path,image_url:publicUrl,alt_text:altText,caption_en:String(form.get("caption_en")||"").trim()||null,caption_es:String(form.get("caption_es")||"").trim()||null,published:form.get("published")==="true"});
  if(insertError){await auth.db.storage.from("gallery").remove([path]);return NextResponse.json({error:"Image metadata could not be saved."},{status:500});}
  return NextResponse.json({ok:true},{status:201});
}