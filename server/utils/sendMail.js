const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc dùng SMTP riêng nếu bạn có
  auth: {
    user: "nhatnguyenhong45@gmail.com",
    pass: "qzupxnhcxwhrfazo" // dùng app password nếu là Gmail
  },
});

const sendVerificationEmail = async (toEmail, token,username) => {
      const verificationLink = `https://notesummerize.onrender.com/#/verify?token=${token}`;
      
      await transporter.sendMail({
        from: '"Hoang Huy" <your_email@gmail.com>',
        to: toEmail,
        subject: 'Xác thực đăng ký tài khoản',
        html: `
          <h3>Chào mừng bạn đến với ${username}!</h3>
          <p>Vui lòng xác thực tài khoản bằng cách nhấn vào link bên dưới:</p>
          <a href="${verificationLink}">Xác thực tài khoản</a>
        `
      });
    };
    module.exports = sendVerificationEmail;