import { createHash, randomBytes } from "crypto";
import { AuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL: Record<AuthTokenType, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};
const REQUEST_COOLDOWN_MS = 60 * 1000;

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, type: AuthTokenType) {
  const recent = await prisma.authToken.findFirst({
    where: {
      userId,
      type,
      createdAt: { gt: new Date(Date.now() - REQUEST_COOLDOWN_MS) },
    },
  });
  if (recent) return null;

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashAuthToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL[type]);

  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, type } }),
    prisma.authToken.create({ data: { userId, type, tokenHash, expiresAt } }),
    prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);

  return token;
}

export async function consumeAuthToken(token: string, type: AuthTokenType) {
  const tokenHash = hashAuthToken(token);
  const record = await prisma.authToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.type !== type || record.expiresAt <= new Date()) {
    if (record) await prisma.authToken.delete({ where: { id: record.id } });
    return null;
  }

  return record;
}
