import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(){const session=await getServerSession(authOptions);const userId=(session?.user as any)?.id as string|undefined;if(!userId)return false;const user=await prisma.user.findUnique({where:{id:userId},select:{role:true}});return user?.role==="ADMIN";}
function optionalDate(value:unknown){if(!value)return null;const d=new Date(String(value));return Number.isNaN(d.getTime())?null:d;}

export async function POST(request:Request){
  try{
    if(!(await requireAdmin()))return NextResponse.json({error:"Accès administrateur requis."},{status:403});
    const body=await request.json(); const advertiserName=String(body.advertiserName||"").trim(); const title=String(body.title||"").trim(); const destinationUrl=String(body.destinationUrl||"").trim(); const placement=String(body.placement||""); const status=String(body.status||"DRAFT");
    if(!advertiserName||!title||!destinationUrl)return NextResponse.json({error:"Annonceur, titre et lien sont requis."},{status:400});
    if(!["HOME_BANNER","SEARCH_INLINE","PREMIUM"].includes(placement))return NextResponse.json({error:"Emplacement invalide."},{status:400});
    if(!["DRAFT","SCHEDULED","ACTIVE","PAUSED","ENDED"].includes(status))return NextResponse.json({error:"Statut invalide."},{status:400});
    const startsAt=optionalDate(body.startsAt),endsAt=optionalDate(body.endsAt); if(startsAt&&endsAt&&endsAt<=startsAt)return NextResponse.json({error:"La fin doit être après le début."},{status:400});
    const ad=await prisma.advertisement.create({data:{advertiserName,title,description:body.description?String(body.description).trim():null,imageUrl:body.imageUrl?String(body.imageUrl).trim():null,destinationUrl,placement:placement as any,status:status as any,startsAt,endsAt}});
    return NextResponse.json(ad,{status:201});
  }catch(error){console.error(error);return NextResponse.json({error:"Impossible de créer la campagne."},{status:500});}
}

export async function PATCH(request:Request){
  try{
    if(!(await requireAdmin()))return NextResponse.json({error:"Accès administrateur requis."},{status:403});
    const body=await request.json(); const id=String(body.id||""); const kind=String(body.kind||"advertisement"); if(!id)return NextResponse.json({error:"Identifiant requis."},{status:400});
    if(kind==="request"){const status=String(body.status||"");if(!["NEW","CONTACTED","APPROVED","REJECTED"].includes(status))return NextResponse.json({error:"Statut invalide."},{status:400});return NextResponse.json(await prisma.advertisingRequest.update({where:{id},data:{status:status as any}}));}
    const status=String(body.status||"");if(!["DRAFT","SCHEDULED","ACTIVE","PAUSED","ENDED"].includes(status))return NextResponse.json({error:"Statut invalide."},{status:400});return NextResponse.json(await prisma.advertisement.update({where:{id},data:{status:status as any}}));
  }catch(error){console.error(error);return NextResponse.json({error:"Impossible de modifier l’élément."},{status:500});}
}
