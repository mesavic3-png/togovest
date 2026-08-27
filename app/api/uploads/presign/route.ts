import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const fileName = String(body.fileName || "");
  const contentType = String(body.contentType || "");
  const fileSize = Number(body.fileSize || 0);
  const isImage = imageTypes.has(contentType);
  const isVideo = videoTypes.has(contentType);
  const maxSize = isVideo ? 80 * 1024 * 1024 : 10 * 1024 * 1024;

  if (!fileName || (!isImage && !isVideo) || fileSize <= 0 || fileSize > maxSize) {
    return NextResponse.json({ error: "Fichier invalide. Images JPG/PNG/WebP (10 Mo max) ou vidéo MP4/WebM/MOV (80 Mo max)." }, { status: 400 });
  }

  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (!endpoint || !bucket || !publicBaseUrl) {
    return NextResponse.json({ error: "Stockage média non configuré" }, { status: 500 });
  }

  const ext = fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || (isVideo ? "mp4" : "jpg");
  const folder = isVideo ? "property-videos" : "properties";
  const key = `${folder}/${(session.user as any).id}/${crypto.randomUUID()}.${ext.toLowerCase()}`;
  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );

  return NextResponse.json({ uploadUrl, publicUrl: `${publicBaseUrl.replace(/\/$/, "")}/${key}`, mediaType: isVideo ? "video" : "image" });
}
