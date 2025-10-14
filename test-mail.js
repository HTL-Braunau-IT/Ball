// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// 
// dotenv.config();
// 
// console.log("🚀 Script starting...");
// console.log("📧 EMAIL_SERVER_USER:", process.env.EMAIL_SERVER_USER ? "✅ Set" : "❌ Missing");
// 
// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_SERVER_USER,
//     pass: process.env.EMAIL_SERVER_PASSWORD,
//   },
// });
// 
// async function testEmail() {
//   try {
//     console.log("Testing SMTP connection...");
//     await transporter.verify();
//     console.log("✅ SMTP connection successful");
//     
//     console.log("Sending test email...");
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to: "raphael.zwischelsberger@htl-braunau.at",
//       subject: "Test Email",
//       text: "This is a test email from your app",
//       html: "<p>Config für Mail senden funkt ;)/p>",
//     });
//     
//     console.log("✅ Email sent:", info.messageId);
//   } catch (error) {
//     console.error("❌ Email test failed:", error);
//   }
// }
// 
// testEmail();