import "server-only";
import { Resend } from "resend";
import { env } from "./env";

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: env.resendFromEmail,
    to: email,
    subject: `Your NYU Off-Campus Housing verification code: ${code}`,
    text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
}
