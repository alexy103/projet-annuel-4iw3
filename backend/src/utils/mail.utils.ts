import nodemailer from "nodemailer";
import {AppError} from "../types";

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
} as any;

const transporter = nodemailer.createTransport(smtpConfig);

const adminEmail = process.env.ADMIN_EMAIL;
if(!adminEmail) throw new AppError("Server Error", 500);

export async function sendTempPasswordEmail(
  email: string,
  tempPassword: string,
) {
  const mailOptions = {
    from: '"Admin" <' + adminEmail + '>',
    to: email,
    subject: "Mot de passe temporaire",
    html: `
      <h2>Bonjour !</h2>
      <p>Votre mot de passe temporaire est :</p>
      <h3 style="color: #007bff">${tempPassword}</h3>
      <p><strong>⚠️ Important :</strong> Changez-le lors de votre première connexion.</p>
      <p>Ce mot de passe expire dans 24h.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendFinalPasswordEmail(
  email: string,
  finalPassword: string,
) {
  const mailOptions = {
    from: '"Admin" <' + adminEmail + '>',
    to: email,
    subject: "Mot de passe définitif",
    html: `
      <h2>Bonjour !</h2>
      <p>Votre mot de passe définitif est :</p>
      <h3 style="color: #007bff">${finalPassword}</h3>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  const mailOptions = {
    from: '"Admin" <' + adminEmail + '>',
    to: email,
    subject: "Code de vérification",
    html: `
      <h2>Bonjour !</h2>
      <p>Voci votre code de vérification afin de valider votre email :</p>
      <h1 style="font-size: 3em; color: #007bff">${code}</h1>
      <p>Ce code expire dans 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
