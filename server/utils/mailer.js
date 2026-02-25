const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────────────────────
// Uses Gmail. Set SMTP_USER and SMTP_PASS (App Password) in .env
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,   // Gmail App Password (16 chars, no spaces)
    },
});

// ── HTML Email Template ───────────────────────────────────────────────────────
const buildInviteHTML = ({ name, email, password, collegeName }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to CampusOps</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🎓 CampusOps</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">${collegeName || 'Faculty Management System'}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:40px 48px 24px;">
              <h2 style="margin:0 0 12px;color:#1e293b;font-size:22px;font-weight:600;">Welcome aboard, ${name.split(' ')[0]}! 👋</h2>
              <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">
                Your faculty account has been created on <strong>CampusOps</strong> by the admin. 
                Use the credentials below to log into the app and get started.
              </p>
            </td>
          </tr>

          <!-- Credentials Box -->
          <tr>
            <td style="padding:0 48px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">📧 Email / Username</p>
                    <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;font-family:monospace;">${email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🔑 Password</p>
                    <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:2px;">${password}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding:20px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#92400e;font-size:13px;">
                      ⚠️ <strong>Important:</strong> Please change your password after your first login to keep your account secure.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td style="padding:0 48px 32px;">
              <p style="color:#475569;font-size:14px;font-weight:600;margin:0 0 12px;">Getting started:</p>
              <table width="100%">
                ${[
        ['1', 'Download the <strong>CampusOps Faculty App</strong>'],
        ['2', 'Enter your email & password above'],
        ['3', 'Update your password from Settings'],
    ].map(([n, text]) => `
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="display:inline-block;width:24px;height:24px;background:#1e293b;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:10px;">${n}</span>
                    <span style="color:#475569;font-size:14px;">${text}</span>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                This email was sent by CampusOps Admin. If you did not expect this, please contact your administrator.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Main export ───────────────────────────────────────────────────────────────
const sendInviteEmail = async ({ name, email, password, collegeName }) => {
    // Silently skip if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️  SMTP not configured — skipping invite email for', email);
        return { sent: false, reason: 'SMTP not configured' };
    }

    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"CampusOps 🎓" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎓 Your CampusOps Faculty Account is Ready!',
        html: buildInviteHTML({ name, email, password, collegeName }),
    });

    console.log(`✅ Invite email sent → ${email}`);
    return { sent: true };
};

module.exports = { sendInviteEmail };
