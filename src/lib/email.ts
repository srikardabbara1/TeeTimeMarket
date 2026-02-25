import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendTeeTimeMessageNotification({
  toEmail,
  toName,
  courseName,
  senderName,
  messageBody,
  inboxUrl,
}: {
  toEmail: string;
  toName: string | null;
  courseName: string;
  senderName: string | null;
  messageBody: string;
  inboxUrl: string;
}) {
  if (!resend) return { ok: false, error: "Email not configured" };

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `TeeTimeMarket: New message about ${courseName}`,
    html: `
      <p>Hi ${toName || "there"},</p>
      <p>You have a new message about your tee time listing: <strong>${courseName}</strong>.</p>
      <p><strong>From:</strong> ${senderName || "A buyer"}</p>
      <blockquote style="margin: 1em 0; padding: 0.5em 1em; background: #f5f5f5; border-left: 4px solid #059669;">${messageBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</blockquote>
      <p><a href="${inboxUrl}">View and reply in your inbox</a></p>
    `,
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function sendVerificationEmail({
  toEmail,
  verifyUrl,
}: {
  toEmail: string;
  verifyUrl: string;
}) {
  if (!resend) return { ok: false, error: "Email not configured" };

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Verify your email – TeeTimeMarket",
    html: `
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}" style="color: #059669; font-weight: 600;">Verify email</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });

  return error ? { ok: false, error } : { ok: true };
}
