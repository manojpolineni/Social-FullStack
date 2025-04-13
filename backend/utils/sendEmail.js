import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Email Sender Function
const sendEmail = async (email, name, otp) => {
  try {
    // SMTP Transport Configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL, // Your Email
        pass: process.env.SMTP_PASSWORD, // App Password from Google
      },
    });

    // Compile EJS Template
    const templatePath = path.join(
      process.cwd(),
      "server/templates/emailTemplate.ejs"
    );
    const emailHTML = await ejs.renderFile(templatePath, { name, otp });

    // Email Options
    const mailOptions = {
      from: `"Your Company" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      html: emailHTML,
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default sendEmail;
