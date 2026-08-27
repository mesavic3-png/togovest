import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function POST(request:Request){try{const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.json({ok:false},{status:400});await prisma.advertisement.update({where:{id},data:{impressions:{increment:1}}});return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false},{status:404});}}
