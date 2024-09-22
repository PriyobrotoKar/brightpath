import nodemailer, { SendMailOptions } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail({ from, ...opts }: SendMailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      ...opts,
    });
  } catch (error) {
    console.log(error);
  }
}
