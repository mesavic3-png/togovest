import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

const roles=new Set(["USER","OWNER","AGENT","AGENCY_ADMIN","ADMIN"]);
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const session=await getServerSession(authOptions); const adminId=(session?.user as any)?.id as string|undefined;
  if(!adminId) return NextResponse.json({error:"Non authentifié"},{status:401});
  const admin=await prisma.user.findUnique({where:{id:adminId},select:{role:true}});
  if(!admin||admin.role!=="ADMIN") return NextResponse.json({error:"Accès refusé"},{status:403});
  const body=await req.json();
  if(params.id===adminId&&(body.isActive===false||body.role&&body.role!=="ADMIN")) return NextResponse.json({error:"Vous ne pouvez pas désactiver votre propre compte administrateur ni retirer votre propre rôle ADMIN."},{status:400});
  const data:any={};
  if(typeof body.isActive==="boolean") data.isActive=body.isActive;
  if(typeof body.role==="string"){if(!roles.has(body.role)) return NextResponse.json({error:"Rôle invalide"},{status:400});data.role=body.role;}
  if(Object.keys(data).length===0) return NextResponse.json({error:"Aucune modification valide"},{status:400});
  const user=await prisma.user.update({where:{id:params.id},data,select:{id:true,email:true,role:true,isActive:true}});
  return NextResponse.json({user});
}
