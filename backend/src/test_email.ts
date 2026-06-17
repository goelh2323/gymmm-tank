import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('=== EMAIL DIAGNOSTIC TEST ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*** (set)' : '(not set)');
console.log('BREVO_SMTP_KEY:', process.env.BREVO_SMTP_KEY ? '*** (set)' : '(not set)');
console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);

const testGmailSMTP = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n❌ Gmail SMTP credentials not set. Skipping.');
    return;
  }

  console.log('\nTesting Gmail SMTP connection...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await new Promise((resolve, reject) => {
      transporter.verify((err, success) => {
        if (err) reject(err);
        else resolve(success);
      });
    });
    console.log('✅ Gmail SMTP verification SUCCESSFUL!');

    console.log('Sending test email via Gmail SMTP...');
    const info = await transporter.sendMail({
      from: `"Power Tank Nutrition Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to self
      subject: '📧 SMTP Test Email',
      text: 'SMTP test successful!',
      html: '<b>SMTP test successful!</b>',
    });
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (err: any) {
    console.error('❌ Gmail SMTP Test FAILED:');
    console.error('Message:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.response) console.error('Response:', err.response);
  }
};

const testBrevoAPI = async () => {
  if (!process.env.BREVO_SMTP_KEY) {
    console.log('\n❌ BREVO_SMTP_KEY not set. Skipping.');
    return;
  }

  console.log('\nTesting Brevo REST HTTP API...');
  const senderEmail = process.env.BREVO_SMTP_USER || 'transformernutritionamb@gmail.com';
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_SMTP_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Power Tank Nutrition Test', email: senderEmail },
        to: [{ email: senderEmail }], // send to self
        subject: '📧 Brevo HTTP API Test Email',
        htmlContent: '<b>Brevo HTTP test successful!</b>',
      }),
    });

    const data = await res.json() as any;
    if (!res.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }
    console.log('✅ Brevo REST HTTP API Test SUCCESSFUL!');
    console.log('Message ID:', data.messageId);
  } catch (err: any) {
    console.error('❌ Brevo REST HTTP API Test FAILED:');
    console.error('Message:', err.message);
  }
};

const run = async () => {
  await testGmailSMTP();
  await testBrevoAPI();
};

run().then(() => console.log('\n=== DIAGNOSTICS END ==='));
