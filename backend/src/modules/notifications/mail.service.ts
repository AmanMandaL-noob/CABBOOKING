import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return transporter;
}

export async function sendMail(params: { to: string; subject: string; text: string; html?: string }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[MAIL DEV MODE] to=${params.to} subject="${params.subject}" body="${params.text}"`);
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html
  });
}
