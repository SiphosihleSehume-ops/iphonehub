import nodemailer from "nodemailer";

/**
 * Sends email one of two ways:
 *  - BREVO_API_KEY set -> Brevo's HTTPS API. Use this on hosts that block SMTP
 *    (Railway Free/Hobby/Trial) and it works on Vercel too.
 *  - otherwise         -> SMTP via SMTP_HOST / SMTP_USER / SMTP_PASS (Gmail etc.)
 */

export interface Mail {
  to: string;
  toName?: string;
  replyTo?: string;
  replyToName?: string;
  subject: string;
  text: string;
  html: string;
}

export function mailConfigured(): boolean {
  const { BREVO_API_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS, ORDER_RECEIVER_EMAIL } = process.env;
  return Boolean(ORDER_RECEIVER_EMAIL && (BREVO_API_KEY ? senderEmail() : SMTP_HOST && SMTP_USER && SMTP_PASS));
}

/** The address mail is sent from. For Brevo it must be a verified sender. */
function senderEmail(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || "";
}

let smtp: nodemailer.Transporter | undefined;
function smtpTransport() {
  if (!smtp) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    const port = Number(SMTP_PORT) || 465;
    smtp = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return smtp;
}

const brevoUrl = () => process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";

export async function sendMail(mail: Mail, fromName: string): Promise<void> {
  const from = senderEmail();

  if (process.env.BREVO_API_KEY) {
    const res = await fetch(brevoUrl(), {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: from },
        to: [{ email: mail.to, ...(mail.toName ? { name: mail.toName } : {}) }],
        ...(mail.replyTo
          ? { replyTo: { email: mail.replyTo, ...(mail.replyToName ? { name: mail.replyToName } : {}) } }
          : {}),
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      }),
    });
    if (!res.ok) {
      throw new Error(`Brevo responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return;
  }

  const addr = (name: string | undefined, email: string) => (name ? `"${name.replace(/"/g, "")}" <${email}>` : email);
  await smtpTransport().sendMail({
    from: addr(fromName, from),
    to: addr(mail.toName, mail.to),
    replyTo: mail.replyTo ? addr(mail.replyToName, mail.replyTo) : undefined,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
