import nodemailer from "nodemailer";

const isHtmlContent = (value = "") => /<[^>]+>/.test(String(value));

const toHtml = (body = "") => {
  if (isHtmlContent(body)) return body;
  return String(body)
    .split("\n")
    .map((line) => line.trimEnd())
    .join("<br/>");
};

const getTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const ensureMailConfig = () => {
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing mail configuration: ${missing.join(", ")}`);
  }
};

export const sendTemplateEmail = async ({ to, subject, body, metadata = {} }) => {
  ensureMailConfig();
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text: String(body || ""),
    html: toHtml(body),
    headers: {
      "X-App-Source": "dream-builders-ai-analysis",
      "X-Call-Id": String(metadata.callId || ""),
      "X-Triggered-By": String(metadata.triggeredBy || ""),
    },
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  };
};
