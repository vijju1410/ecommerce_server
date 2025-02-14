const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email provider (Gmail, Outlook, etc.)
      auth: {
        user: "vijayprajapati1410@gmail.com", // Replace with your email
        pass: "dusp mltq yjdg ladb", // Replace with your app password (not your actual email password)
      },
    });

    const mailOptions = {
      from: '"ElectroHub" <vijayprajapati1410@gmail.com>',
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = sendEmail;
