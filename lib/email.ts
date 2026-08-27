const RESEND_ENDPOINT = "https://api.resend.com/emails";

function appUrl() {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  return response.ok;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emailLayout(title: string, message: string, action: string, url: string, expiry: string) {
  return `
    <div style="background:#f4f1e8;padding:32px;font-family:Arial,sans-serif;color:#17332d">
      <div style="max-width:560px;margin:auto;background:#fff;border-radius:24px;padding:32px">
        <strong style="font-size:20px">TOGOVEST.</strong>
        <h1 style="font-size:26px;margin:28px 0 12px">${title}</h1>
        <p style="line-height:1.65;color:#52645f">${message}</p>
        <a href="${url}" style="display:inline-block;margin:18px 0;background:#173f35;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:bold">${action}</a>
        <p style="font-size:13px;line-height:1.5;color:#7a8985">Ce lien expire dans ${expiry}. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
      </div>
    </div>`;
}

export function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl()}/verifier-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    email,
    "Vérifiez votre adresse email TOGOVEST",
    emailLayout(
      "Confirmez votre adresse email",
      "Merci d’avoir créé votre compte TOGOVEST. Confirmez votre adresse pour accéder à votre espace.",
      "Vérifier mon email",
      url,
      "24 heures",
    ),
  );
}

export function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
  return sendEmail(
    email,
    "Réinitialisez votre mot de passe TOGOVEST",
    emailLayout(
      "Réinitialisation du mot de passe",
      "Une demande de changement de mot de passe a été reçue pour votre compte TOGOVEST.",
      "Choisir un nouveau mot de passe",
      url,
      "1 heure",
    ),
  );
}

export function sendInquiryNotificationEmail({
  to,
  propertyId,
  propertyTitle,
  senderName,
  senderEmail,
  senderPhone,
  message,
}: {
  to: string;
  propertyId: string;
  propertyTitle: string;
  senderName?: string | null;
  senderEmail?: string | null;
  senderPhone?: string | null;
  message: string;
}) {
  const url = `${appUrl()}/biens/${encodeURIComponent(propertyId)}`;
  const safeTitle = escapeHtml(propertyTitle);
  const safeName = escapeHtml(senderName || "Visiteur TOGOVEST");
  const safeEmail = senderEmail ? escapeHtml(senderEmail) : "Non fourni";
  const safePhone = senderPhone ? escapeHtml(senderPhone) : "Non fourni";
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  return sendEmail(
    to,
    `Nouvelle demande pour ${propertyTitle}`,
    `<div style="background:#f4f1e8;padding:32px;font-family:Arial,sans-serif;color:#17332d">
      <div style="max-width:620px;margin:auto;background:#fff;border-radius:24px;padding:32px">
        <strong style="font-size:20px">TOGOVEST.</strong>
        <h1 style="font-size:26px;margin:28px 0 12px">Nouvelle demande sur votre annonce</h1>
        <p style="line-height:1.65;color:#52645f"><strong>Bien :</strong> ${safeTitle}</p>
        <p style="line-height:1.65;color:#52645f"><strong>Nom :</strong> ${safeName}<br/><strong>Email :</strong> ${safeEmail}<br/><strong>Téléphone :</strong> ${safePhone}</p>
        <div style="margin:20px 0;padding:18px;border-radius:16px;background:#f4f1e8;line-height:1.65">${safeMessage}</div>
        <a href="${url}" style="display:inline-block;background:#173f35;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:bold">Voir l’annonce</a>
      </div>
    </div>`,
  );
}
