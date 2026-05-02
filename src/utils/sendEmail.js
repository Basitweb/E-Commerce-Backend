import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  await resend.emails.send({
    from: "Your App <onboarding@resend.dev>",  // use this until you add a custom domain
    to: options.email,
    subject: options.subject,
    html: options.message,
  });
};