import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET(request:Request){const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.redirect(new URL("/",request.url));try{const ad=await prisma.advertisement.update({where:{id},data:{clicks:{increment:1}}});return NextResponse.redirect(ad.destinationUrl);}catch{return NextResponse.redirect(new URL("/",request.url));}}
