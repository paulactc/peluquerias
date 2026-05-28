const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail({ to, salonName, password }) {
  await transporter.sendMail({
    from:    `"${process.env.SMTP_FROM_NAME || 'Peluquería'}" <${process.env.SMTP_USER}>`,
    to,
    subject: `Bienvenido a Peluquería – Tus credenciales de acceso`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#7c3aed">Bienvenido, ${salonName}</h2>
        <p>Tu peluquería ha sido registrada en nuestra plataforma. Ya puedes acceder a tu panel de gestión.</p>
        <table style="background:#f5f3ff;border-radius:8px;padding:20px;width:100%">
          <tr><td><strong>Usuario (email):</strong></td><td>${to}</td></tr>
          <tr><td><strong>Contraseña:</strong></td><td style="font-size:18px;letter-spacing:2px">${password}</td></tr>
        </table>
        <p style="margin-top:20px">
          <a href="${process.env.FRONTEND_URL}/admin/login"
             style="background:#7c3aed;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none">
            Acceder al panel
          </a>
        </p>
        <p style="color:#888;font-size:12px;margin-top:24px">
          Te recomendamos cambiar tu contraseña desde el perfil una vez hayas iniciado sesión.
        </p>
      </div>
    `,
  });
}

module.exports = { sendWelcomeEmail };
