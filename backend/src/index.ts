import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from './db';
import { exec } from 'child_process';
import path from 'path';
import nodemailer from 'nodemailer';
import { sendOrderConfirmationWhatsApp, sendOrderStatusWhatsApp } from './services/whatsapp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gymmm-tank-secret-key-9988';

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Security: Helmet (HTTP headers) + Rate Limiting
// ----------------------------------------------------
app.use(helmet()); // Sets X-Frame-Options, X-Content-Type-Options, CSP, etc.

// Rate limiter for login — max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Rate limiter for registration — max 5 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this IP. Please try again after an hour.' },
});

// Rate limiter for placing orders — max 5 per 10 minutes per IP (prevents order flooding)
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders submitted. Please wait a few minutes.' },
});

// General API rate limiter — max 120 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Apply general limiter to all /api/v1 routes
app.use('/api/v1', apiLimiter);

// ----------------------------------------------------
// Email: Nodemailer transporter setup
// Uses real SMTP if EMAIL_USER + EMAIL_PASS are set in .env
// Falls back to Ethereal (fake test inbox) for development
// ----------------------------------------------------
let transporter: nodemailer.Transporter;
let testEmailAccount: { user: string; pass: string } | null = null;

const initEmailTransporter = async () => {
  // Priority 1: Resend HTTP API (if RESEND_API_KEY is set)
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Email system ready (Resend HTTP API)');
    return;
  }

  // Priority 2: Brevo (Sendinblue) SMTP — works from any cloud server, no domain needed, 300/day free
  if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,  // your Brevo login email
        pass: process.env.BREVO_SMTP_KEY,   // Brevo SMTP key (from Settings → SMTP & API)
      },
    });

    transporter.verify((error: Error | null) => {
      if (error) {
        console.error('❌ Brevo SMTP connection FAILED:', error.message);
      } else {
        console.log(`✅ Brevo SMTP connected successfully (${process.env.BREVO_SMTP_USER})`);
      }
    });

    console.log(`📧 Email transporter initialised (Brevo SMTP)`);
    return;
  }

  // Priority 3: Gmail SMTP (can be unreliable from cloud IPs)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
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

    transporter.verify((error: Error | null) => {
      if (error) {
        console.error('❌ Gmail SMTP connection FAILED:', error.message);
        console.error('   EMAIL_PASS must be a Gmail App Password (16-char), NOT your regular password.');
        console.error('   Generate one at: Google Account → Security → 2-Step Verification → App Passwords');
      } else {
        console.log(`✅ Gmail SMTP connected successfully (${process.env.EMAIL_USER})`);
      }
    });

    console.log(`📧 Email transporter initialised (Gmail SMTP as ${process.env.EMAIL_USER})`);
    return;
  }

  // Priority 4: Dev — auto-create Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  testEmailAccount = { user: testAccount.user, pass: testAccount.pass };
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('📧 Email transporter ready (Ethereal test mode)');
  console.log(`   ↳ Test inbox: https://ethereal.email/messages (login: ${testAccount.user})`);
};

// Centralized Email Sender Helper (handles both Resend HTTP API and Nodemailer fallback)
const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  if (process.env.RESEND_API_KEY) {
    try {
      // Free tier Resend accounts are restricted to sending from onboarding@resend.dev
      const from = process.env.RESEND_FROM || 'GYMMM TANK <onboarding@resend.dev>';
      
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`📧 Email sent successfully via Resend API: ${data.id}`);
      return data;
    } catch (err: any) {
      console.error('❌ Resend API Send Failed:', err.message);
      throw err;
    }
  } else if (transporter) {
    try {
      // Determine which sender address to use: Brevo, Gmail, or dev Ethereal
      const senderEmail = process.env.BREVO_SMTP_USER
        || process.env.EMAIL_USER
        || testEmailAccount?.user
        || 'noreply@gymmmtank.com';
      const driver = process.env.BREVO_SMTP_USER ? 'Brevo' : process.env.EMAIL_USER ? 'Gmail' : 'Ethereal';

      console.log(`📧 [${driver}] Sending to: ${to}`);
      const info = await transporter.sendMail({
        from: `"GYMMM TANK" <${senderEmail}>`,
        to,
        subject,
        html,
      });

      if (!process.env.EMAIL_USER && !process.env.BREVO_SMTP_USER) {
        console.log(`📧 Ethereal preview: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        console.log(`✅ [${driver}] Email sent to ${to} — MessageId: ${info.messageId}`);
      }
      return info;
    } catch (err: any) {
      console.error(`❌ SMTP send FAILED to ${to}:`);
      console.error(`   Code: ${err.code} | Response: ${err.response}`);
      console.error(`   Full error: ${err.message}`);
      throw err;
    }
  } else {
    throw new Error('No email sender configured. Set BREVO_SMTP_USER+BREVO_SMTP_KEY or EMAIL_USER+EMAIL_PASS in environment variables.');
  }
};

// Helper: format ₹ amounts
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Send order confirmation email to the customer
const sendOrderConfirmationEmail = async (order: any) => {
  try {
    const itemsHtml = (order.items || [])
      .map((item: any) => `
        <tr style="border-bottom: 1px solid #221c0e;">
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #ffffff; font-family: 'Montserrat', sans-serif;">${item.productName}</td>
          <td style="padding: 12px; font-size: 12px; color: #aaaaaa; font-family: 'Montserrat', sans-serif;">${item.flavor} · ${item.size}</td>
          <td style="padding: 12px; font-size: 13px; color: #ffffff; text-align: center; font-family: 'Montserrat', sans-serif;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #d4af37; text-align: right; font-family: 'Montserrat', sans-serif;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
      ).join('');

    const html = `
      <div style="background-color: #030303; padding: 40px 20px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; min-height: 100%;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0c; border: 1px solid #221c0e; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
          
          <!-- Branding Header -->
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); padding: 40px 32px; text-align: center; border-bottom: 2px solid #d4af37;">
            <img src="https://gymmm-tank.vercel.app/images/logo.png" alt="GYMMM TANK Logo" style="width: 80px; height: auto; margin-bottom: 16px; border: 2px solid #d4af37; border-radius: 50%; display: inline-block; background-color: #000;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">
              <span style="color: #d4af37;">GYMMM</span> TANK
            </h1>
            <p style="color: #888888; margin: 10px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Engineered for Mind, Muscle & Performance</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #ffffff; margin: 0 0 12px; font-size: 22px; font-weight: 700; border-left: 4px solid #d4af37; padding-left: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Order Confirmed! 💪
            </h2>
            <p style="color: #cccccc; margin: 0 0 28px; font-size: 14px; line-height: 1.6;">
              Hey <strong>${order.customerName}</strong>, your order <strong style="color: #d4af37;">#${order.id.slice(0, 8).toUpperCase()}</strong> has been locked in and is currently being prepped for shipment.
            </p>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <thead>
                <tr style="background-color: #121212; border-bottom: 2px solid #221c0e;">
                  <th style="padding: 12px; text-align: left; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">PRODUCT</th>
                  <th style="padding: 12px; text-align: left; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">VARIANT</th>
                  <th style="padding: 12px; text-align: center; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">QTY</th>
                  <th style="padding: 12px; text-align: right; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Order Summary Card -->
            <div style="background-color: #121212; border: 1px solid #221c0e; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #aaaaaa; padding: 6px 0;">Subtotal</td>
                  <td style="text-align: right; color: #ffffff; padding: 6px 0;">${formatINR(order.subtotal)}</td>
                </tr>
                ${order.savings > 0 ? `
                <tr>
                  <td style="color: #22c55e; padding: 6px 0;">Promo Discount</td>
                  <td style="text-align: right; color: #22c55e; padding: 6px 0;">-${formatINR(order.savings)}</td>
                </tr>
                ` : ''}
                ${order.coinsRedeemed > 0 ? `
                <tr>
                  <td style="color: #d4af37; padding: 6px 0;">Tank Coins Redeemed (${order.coinsRedeemed})</td>
                  <td style="text-align: right; color: #d4af37; padding: 6px 0;">-${formatINR(order.coinsRedeemed * 0.5)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 1px solid #221c0e;">
                  <td style="font-weight: 700; font-size: 16px; color: #ffffff; padding: 12px 0 0;">Total Paid</td>
                  <td style="text-align: right; font-weight: 700; font-size: 18px; color: #d4af37; padding: 12px 0 0;">${formatINR(order.total)}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping & Payment Details -->
            <div style="background: linear-gradient(135deg, #0e0e0e 0%, #161616 100%); border: 1px solid #221c0e; border-radius: 6px; padding: 24px; margin-bottom: 28px;">
              <h3 style="margin: 0 0 12px; font-size: 12px; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">Delivery & Payment Details</h3>
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">${order.customerName}</p>
              <p style="margin: 0 0 16px; color: #bbbbbb; font-size: 13px; line-height: 1.5;">
                ${order.address}, ${order.city}, ${order.state} - ${order.pincode}
              </p>
              <div style="border-top: 1px solid #221c0e; padding-top: 12px; font-size: 12px; color: #aaaaaa;">
                <span style="display: inline-block; margin-right: 20px;">Method: <strong style="color: #ffffff;">${order.paymentMethod}</strong></span>
                <span>Status: <strong style="color: #f59e0b;">${order.paymentStatus}</strong></span>
              </div>
            </div>

            <!-- Loyalty Reward Message -->
            ${order.coinsEarned > 0 ? `
            <div style="background-color: rgba(212,175,55,0.06); border: 1px dashed rgba(212,175,55,0.3); border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 28px;">
              <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 600;">
                🏆 You earned <strong style="font-size: 16px;">${order.coinsEarned}</strong> Tank Coins on this order!
              </p>
              <p style="margin: 4px 0 0; color: #888888; font-size: 11px;">Redeem them on your next purchase (1 Coin = ₹0.50)</p>
            </div>
            ` : ''}

            <!-- Help/Footer info -->
            <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
              Questions about your gear? Reach us at <a href="mailto:support@gymmmtank.com" style="color: #d4af37; text-decoration: none; font-weight: 600;">support@gymmmtank.com</a> or call 9350931316.
            </p>

          </div>

          <!-- Footer Banner -->
          <div style="background-color: #080808; padding: 24px 32px; text-align: center; border-top: 1px solid #1a1a1a;">
            <p style="color: #555555; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} GYMMM TANK Supplements. All rights reserved.
            </p>
            <p style="color: #333333; font-size: 9px; margin: 4px 0 0;">
              Engineered for athletes who demand maximum strength and recovery.
            </p>
          </div>

        </div>
      </div>`;

    await sendEmail({
      to: order.customerEmail,
      subject: `✅ Order Confirmed #${order.id.slice(0, 8).toUpperCase()} — GYMMM TANK`,
      html,
    });
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
    // Non-fatal: don't let email failure break the order response
  }
};

// Send shipment notification email
const sendShipmentEmail = async (order: any) => {
  try {
    console.log(`📧 Dispatching Shipment Email for Order #${order.id} to ${order.customerEmail}...`);
    const html = `
      <div style="background-color: #030303; padding: 40px 20px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; min-height: 100%;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0c; border: 1px solid #221c0e; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.8); text-align: center;">
          
          <!-- Branding Header -->
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); padding: 40px 32px; border-bottom: 2px solid #d4af37;">
            <img src="https://gymmm-tank.vercel.app/images/logo.png" alt="GYMMM TANK Logo" style="width: 80px; height: auto; margin-bottom: 16px; border: 2px solid #d4af37; border-radius: 50%; display: inline-block; background-color: #000;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">
              <span style="color: #d4af37;">GYMMM</span> TANK
            </h1>
            <p style="color: #888888; margin: 10px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Engineered for Mind, Muscle & Performance</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <div style="font-size: 64px; margin-bottom: 20px;">🚀</div>
            <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37;">
              Your Order is Shipped!
            </h2>
            <p style="color: #cccccc; margin: 0 auto 28px; font-size: 14px; line-height: 1.6; max-width: 460px;">
              Hey <strong>${order.customerName}</strong>, your GYMMM TANK fuel has been loaded and dispatched! Your package is officially on its way.
            </p>

            <!-- Details Summary Card -->
            <div style="background-color: #121212; border: 1px solid #221c0e; border-radius: 8px; padding: 24px; display: inline-block; text-align: left; width: 100%; box-sizing: border-box; margin-bottom: 28px;">
              <p style="margin: 0 0 4px; color: #aaaaaa; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Tracking Details</p>
              <p style="margin: 0 0 16px; color: #ffffff; font-size: 15px; font-weight: 700;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
              
              <p style="margin: 0 0 4px; color: #aaaaaa; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Delivery Address</p>
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600;">${order.customerName}</p>
              <p style="margin: 0; color: #bbbbbb; font-size: 13px; line-height: 1.5;">
                ${order.address}, ${order.city}, ${order.state} - ${order.pincode}
              </p>
            </div>

            <!-- Action Info -->
            <div style="margin-bottom: 28px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f5d98a 50%, #d4af37 100%); padding: 14px 28px; border-radius: 4px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #000000; box-shadow: 0 4px 12px rgba(212,175,55,0.3);">
                Delivery In 3 - 5 Days
              </div>
            </div>

            <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0;">
              Need help? Contact support at <a href="mailto:support@gymmmtank.com" style="color: #d4af37; text-decoration: none; font-weight: 600;">support@gymmmtank.com</a> or call 9350931316.
            </p>

          </div>

          <!-- Footer Banner -->
          <div style="background-color: #080808; padding: 24px 32px; border-top: 1px solid #1a1a1a;">
            <p style="color: #555555; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} GYMMM TANK Supplements. All rights reserved.
            </p>
          </div>

        </div>
      </div>`;

    const result = await sendEmail({
      to: order.customerEmail,
      subject: `🚀 Your Order is Shipped! #${order.id.slice(0, 8).toUpperCase()} — GYMMM TANK`,
      html,
    });
    console.log(`📧 Shipment Email sent successfully for Order #${order.id}. Message ID: ${result?.messageId || result?.id}`);
  } catch (err: any) {
    console.error(`❌ Failed to send shipment email for Order #${order.id}:`, err.message);
  }
};

// Send delivery confirmation email
const sendDeliveryEmail = async (order: any) => {
  try {
    console.log(`📧 Dispatching Delivery Email for Order #${order.id} to ${order.customerEmail}...`);
    const itemsHtml = (order.items || [])
      .map((item: any) => `
        <tr style="border-bottom: 1px solid #221c0e;">
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #ffffff; font-family: 'Montserrat', sans-serif;">${item.productName}</td>
          <td style="padding: 12px; font-size: 12px; color: #aaaaaa; font-family: 'Montserrat', sans-serif;">${item.flavor} · ${item.size}</td>
          <td style="padding: 12px; font-size: 13px; color: #ffffff; text-align: center; font-family: 'Montserrat', sans-serif;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #d4af37; text-align: right; font-family: 'Montserrat', sans-serif;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
      ).join('');

    const html = `
      <div style="background-color: #030303; padding: 40px 20px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; min-height: 100%;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0c; border: 1px solid #221c0e; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.8); text-align: center;">
          
          <!-- Branding Header -->
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); padding: 40px 32px; border-bottom: 2px solid #d4af37;">
            <img src="https://gymmm-tank.vercel.app/images/logo.png" alt="GYMMM TANK Logo" style="width: 80px; height: auto; margin-bottom: 16px; border: 2px solid #d4af37; border-radius: 50%; display: inline-block; background-color: #000;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">
              <span style="color: #d4af37;">GYMMM</span> TANK
            </h1>
            <p style="color: #888888; margin: 10px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Engineered for Mind, Muscle & Performance</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
            <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37;">
              Order Delivered!
            </h2>
            <p style="color: #cccccc; margin: 0 auto 28px; font-size: 14px; line-height: 1.6; max-width: 460px;">
              Hey <strong>${order.customerName}</strong>, your GYMMM TANK order <strong style="color: #d4af37;">#${order.id.slice(0, 8).toUpperCase()}</strong> has been successfully delivered! Time to fuel up and crush those goals.
            </p>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; text-align: left;">
              <thead>
                <tr style="background-color: #121212; border-bottom: 2px solid #221c0e;">
                  <th style="padding: 12px; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">PRODUCT</th>
                  <th style="padding: 12px; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">VARIANT</th>
                  <th style="padding: 12px; text-align: center; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">QTY</th>
                  <th style="padding: 12px; text-align: right; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Share the Gains -->
            <div style="background-color: #121212; border: 1px solid #221c0e; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 28px;">
              <p style="margin: 0 0 10px; color: #d4af37; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Share Your Gains! 📸</p>
              <p style="margin: 0 0 16px; color: #cccccc; font-size: 13px; line-height: 1.5;">
                Snap a photo of your GYMMM TANK fuel, tag us on Instagram <strong style="color: #ffffff;">@gymmmtank</strong>, and use the hashtag <strong style="color: #d4af37;">#GYMMMTANK</strong> to get featured and earn exclusive rewards!
              </p>
              <a href="https://instagram.com/gymmmtank" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f5d98a 50%, #d4af37 100%); padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #000000; text-decoration: none; box-shadow: 0 4px 12px rgba(212,175,55,0.3);">
                Tag @gymmmtank
              </a>
            </div>

            <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0;">
              Need help or have questions about your supplements? Contact support at <a href="mailto:support@gymmmtank.com" style="color: #d4af37; text-decoration: none; font-weight: 600;">support@gymmmtank.com</a> or call 9350931316.
            </p>

          </div>

          <!-- Footer Banner -->
          <div style="background-color: #080808; padding: 24px 32px; border-top: 1px solid #1a1a1a;">
            <p style="color: #555555; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} GYMMM TANK Supplements. All rights reserved.
            </p>
          </div>

        </div>
      </div>`;

    const result = await sendEmail({
      to: order.customerEmail,
      subject: `📦 Your Order is Delivered! #${order.id.slice(0, 8).toUpperCase()} — GYMMM TANK`,
      html,
    });
    console.log(`📧 Delivery Email sent successfully for Order #${order.id}. Message ID: ${result?.messageId || result?.id}`);
  } catch (err: any) {
    console.error(`❌ Failed to send delivery email for Order #${order.id}:`, err.message);
  }
};

// Send order cancellation email
const sendCancellationEmail = async (order: any) => {
  try {
    console.log(`📧 Dispatching Cancellation Email for Order #${order.id} to ${order.customerEmail}...`);
    const itemsHtml = (order.items || [])
      .map((item: any) => `
        <tr style="border-bottom: 1px solid #221c0e;">
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #ffffff; font-family: 'Montserrat', sans-serif;">${item.productName}</td>
          <td style="padding: 12px; font-size: 12px; color: #aaaaaa; font-family: 'Montserrat', sans-serif;">${item.flavor} · ${item.size}</td>
          <td style="padding: 12px; font-size: 13px; color: #ffffff; text-align: center; font-family: 'Montserrat', sans-serif;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #d4af37; text-align: right; font-family: 'Montserrat', sans-serif;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
      ).join('');

    const html = `
      <div style="background-color: #030303; padding: 40px 20px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; min-height: 100%;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0c; border: 1px solid #221c0e; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.8); text-align: center;">
          
          <!-- Branding Header -->
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); padding: 40px 32px; border-bottom: 2px solid #ef4444;">
            <img src="https://gymmm-tank.vercel.app/images/logo.png" alt="GYMMM TANK Logo" style="width: 80px; height: auto; margin-bottom: 16px; border: 2px solid #ef4444; border-radius: 50%; display: inline-block; background-color: #000;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">
              <span style="color: #ef4444;">GYMMM</span> TANK
            </h1>
            <p style="color: #888888; margin: 10px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Engineered for Mind, Muscle & Performance</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
            <h2 style="color: #ef4444; margin: 0 0 16px; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
              Order Cancelled
            </h2>
            <p style="color: #cccccc; margin: 0 auto 28px; font-size: 14px; line-height: 1.6; max-width: 460px;">
              Hey <strong>${order.customerName}</strong>, your GYMMM TANK order <strong style="color: #ef4444;">#${order.id.slice(0, 8).toUpperCase()}</strong> has been cancelled. Any loyalty points used or earned on this transaction have been adjusted.
            </p>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; text-align: left;">
              <thead>
                <tr style="background-color: #121212; border-bottom: 2px solid #ef4444;">
                  <th style="padding: 12px; font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">PRODUCT</th>
                  <th style="padding: 12px; font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">VARIANT</th>
                  <th style="padding: 12px; text-align: center; font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">QTY</th>
                  <th style="padding: 12px; text-align: right; font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0;">
              If you have any questions or require assistance, please contact support at <a href="mailto:support@gymmmtank.com" style="color: #ef4444; text-decoration: none; font-weight: 600;">support@gymmmtank.com</a> or call 9350931316.
            </p>

          </div>

          <!-- Footer Banner -->
          <div style="background-color: #080808; padding: 24px 32px; border-top: 1px solid #1a1a1a;">
            <p style="color: #555555; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} GYMMM TANK Supplements. All rights reserved.
            </p>
          </div>

        </div>
      </div>`;

    const result = await sendEmail({
      to: order.customerEmail,
      subject: `❌ Order Cancelled #${order.id.slice(0, 8).toUpperCase()} — GYMMM TANK`,
      html,
    });
    console.log(`📧 Cancellation Email sent successfully for Order #${order.id}. Message ID: ${result?.messageId || result?.id}`);
  } catch (err: any) {
    console.error(`❌ Failed to send cancellation email for Order #${order.id}:`, err.message);
  }
};

// Initialize email transporter on startup
initEmailTransporter().catch(console.error);

// Extend Express request interface to include decoded user details
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ----------------------------------------------------
// Authentication Middleware
// ----------------------------------------------------
const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

// ----------------------------------------------------
// Zod Schema Validation
// ----------------------------------------------------
const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number({ required_error: 'Price is required' }).positive('Price must be greater than zero'),
  salePrice: z.number().positive('Sale price must be greater than zero').nullable().optional(),
  image: z.string().min(1, 'Image URL or reference is required'),
  category: z.string().min(1, 'Category is required'),
  goal: z.string().min(1, 'Goal is required'),
  flavors: z.string().min(1, 'Flavors list is required (comma-separated)'),
  sizes: z.string().min(1, 'Sizes list is required (comma-separated)'),
  stock: z.number({ required_error: 'Stock is required' }).int().nonnegative('Stock cannot be negative'),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isHidden: z.boolean().default(false),
});

const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  flavor: z.string().min(1, 'Flavor is required'),
  size: z.string().min(1, 'Size is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: z.number().nonnegative('Price cannot be negative'),
});

const CheckoutSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 digits'),
  paymentMethod: z.string(), // COD, UPI, CARD
  paymentStatus: z.string().default('PENDING'),
  subtotal: z.number(),
  savings: z.number(),
  total: z.number(),
  promoCode: z.string().nullable().optional(),
  coinsRedeemed: z.number().int().nonnegative().default(0),
  coinsEarned: z.number().int().nonnegative().default(0),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
});

// ----------------------------------------------------
// 0. Base Status Routes
// ----------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    message: '🏋️ Welcome to the GYMMM TANK API Server!',
    documentation: 'Navigate to /api/v1 for API endpoints status.'
  });
});

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: '🏋️ GYMMM TANK API v1 is fully operational!',
    endpointsCount: 14,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 1. Auth Route: Login
// ----------------------------------------------------
app.post('/api/v1/auth/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user in SQLite
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ----------------------------------------------------
// 1b. Customer Auth Routes (Register, Profile, Profile Update)
// ----------------------------------------------------
app.post('/api/v1/auth/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        coins: 0,
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        coins: user.coins
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.get('/api/v1/auth/profile', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        coins: user.coins
      }
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

app.put('/api/v1/auth/profile/update', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken by another user' });
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        coins: updatedUser.coins
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// ----------------------------------------------------
// 2. Public Storefront Product Routes
// ----------------------------------------------------

// Get all products with optional filters
app.get('/api/v1/products', async (req: Request, res: Response) => {
  try {
    const { goal, category, search, showHidden } = req.query;

    const whereClause: any = {};

    // By default, do not show hidden items to public users
    if (showHidden !== 'true') {
      whereClause.isHidden = false;
    }

    if (goal) {
      whereClause.goal = String(goal);
    }

    if (category) {
      whereClause.category = String(category);
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// Get a single product
app.get('/api/v1/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ error: 'Could not fetch product' });
  }
});

// ----------------------------------------------------
// 2b. Orders API Endpoints
// ----------------------------------------------------

// Place an order
app.post('/api/v1/orders', orderLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = CheckoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ error: errors });
    }

    const orderData = parseResult.data;
    
    // Check if token exists in header to link order to a user
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
        userId = decoded.id;
      } catch (err) {
        // Fallback as guest order
      }
    }

    // Verify stock availability BEFORE opening transaction (read-only checks)
    for (const item of orderData.items) {
      if (item.productId === 'free-shaker-bottle') continue;
      const dbProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!dbProduct) {
        return res.status(404).json({ error: `Product ${item.productName} not found` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.productName}. Available: ${dbProduct.stock}` });
      }
    }

    // --- ATOMIC TRANSACTION: stock decrement + coin update + order creation ---
    // If any step fails, ALL changes roll back — no orphaned state.
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Deduct stock for each real inventory item
      for (const item of orderData.items) {
        if (item.productId === 'free-shaker-bottle') continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 2. Update loyalty coins if the customer is logged in
      if (userId) {
        const dbUser = await tx.user.findUnique({ where: { id: userId } });
        if (dbUser) {
          const newCoins = dbUser.coins - orderData.coinsRedeemed + orderData.coinsEarned;
          await tx.user.update({
            where: { id: userId },
            data: { coins: Math.max(0, newCoins) },
          });
        }
      }

      // 3. Create the order + all line items together
      const order = await tx.order.create({
        data: {
          userId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          address: orderData.address,
          city: orderData.city,
          state: orderData.state,
          pincode: orderData.pincode,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          subtotal: orderData.subtotal,
          savings: orderData.savings,
          total: orderData.total,
          promoCode: orderData.promoCode || null,
          coinsRedeemed: orderData.coinsRedeemed,
          coinsEarned: orderData.coinsEarned,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              flavor: item.flavor,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      return order;
    });
    // --- END TRANSACTION ---

    // Send order confirmation email (fire-and-forget — non-blocking)
    sendOrderConfirmationEmail(createdOrder).catch(() => {});
    sendOrderConfirmationWhatsApp(createdOrder).catch(() => {});

    res.status(201).json({
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Could not place order' });
  }
});

// Fetch past orders for logged in customer
app.get('/api/v1/auth/orders', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ error: 'Could not fetch order history' });
  }
});

// ----------------------------------------------------
// 3. Admin Product & Order Routes (Protected)
// ----------------------------------------------------

// Add a new product
app.post('/api/v1/admin/products', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Validate request data
    const parseResult = ProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ error: errors });
    }

    const newProduct = await prisma.product.create({
      data: parseResult.data,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Could not create product' });
  }
});

// Update an existing product
app.put('/api/v1/admin/products/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate update data
    const parseResult = ProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ error: errors });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: parseResult.data,
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Could not update product' });
  }
});

// Delete a product
app.delete('/api/v1/admin/products/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Could not delete product' });
  }
});

// Fetch all orders with cursor-based pagination (Admin only)
// Usage: GET /api/v1/admin/orders?limit=15&cursorId=<lastOrderId>
app.get('/api/v1/admin/orders', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 15, 50); // max 50 per page
    const cursorId = req.query.cursorId as string | undefined;

    const orders = await prisma.order.findMany({
      take: limit + 1, // Fetch one extra to determine if there is a next page
      ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = orders.length > limit;
    const pageOrders = hasNextPage ? orders.slice(0, limit) : orders;
    const nextCursor = hasNextPage ? pageOrders[pageOrders.length - 1].id : null;

    res.json({
      orders: pageOrders,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// Fetch all registered users (Admin only)
app.get('/api/v1/admin/users', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        coins: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// Update order fulfillment or payment status (Admin only)
app.put('/api/v1/admin/orders/:id/status', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fulfillment, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData: any = {};
    if (fulfillment) updateData.fulfillment = fulfillment; // PENDING, SHIPPED, DELIVERED, CANCELLED
    if (paymentStatus) updateData.paymentStatus = paymentStatus; // PENDING, PAID

    // If order is cancelled and wasn't cancelled before, increment product stock
    if (fulfillment === 'CANCELLED' && existingOrder.fulfillment !== 'CANCELLED') {
      for (const item of existingOrder.items) {
        if (item.productId !== 'free-shaker-bottle') {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // Send shipment email when admin marks order as SHIPPED (fire-and-forget)
    if (fulfillment === 'SHIPPED' && existingOrder.fulfillment !== 'SHIPPED') {
      sendShipmentEmail(updatedOrder).catch(() => {});
      sendOrderStatusWhatsApp(updatedOrder, 'SHIPPED').catch(() => {});
    }

    // Send delivery email when admin marks order as DELIVERED (fire-and-forget)
    if (fulfillment === 'DELIVERED' && existingOrder.fulfillment !== 'DELIVERED') {
      sendDeliveryEmail(updatedOrder).catch(() => {});
      sendOrderStatusWhatsApp(updatedOrder, 'DELIVERED').catch(() => {});
    }

    // Send cancellation email when admin marks order as CANCELLED (fire-and-forget)
    if (fulfillment === 'CANCELLED' && existingOrder.fulfillment !== 'CANCELLED') {
      sendCancellationEmail(updatedOrder).catch(() => {});
      sendOrderStatusWhatsApp(updatedOrder, 'CANCELLED').catch(() => {});
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Could not update order status' });
  }
});

// Reset & Seed Database (Super helpful helper for admins to reset state)
app.post('/api/v1/admin/seed', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  const seedScriptPath = path.join(__dirname, '../prisma/seed.ts');
  const command = `npx ts-node "${seedScriptPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Re-seeding execution error: ${error.message}`);
      return res.status(500).json({ error: 'Database seed failed to execute' });
    }
    console.log(`Re-seeding stdout: ${stdout}`);
    if (stderr) {
      console.error(`Re-seeding stderr: ${stderr}`);
    }
    res.json({ message: 'Database reset and seeded successfully' });
  });
});

// Diagnostic Endpoint: test email SMTP/Resend API settings
app.get('/api/v1/test-email', async (req: Request, res: Response) => {
  try {
    const toAddress = (req.query.to as string) || 'transformernutritionamb@gmail.com';
    const result = await sendEmail({
      to: toAddress,
      subject: '🧪 GYMMM TANK Email Diagnostic Test',
      html: `<h3>If you receive this, your email configuration is working perfectly!</h3>
             <p><strong>Active Driver:</strong> ${process.env.RESEND_API_KEY ? 'Resend HTTP API' : 'Nodemailer SMTP'}</p>
             <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`,
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      driver: process.env.RESEND_API_KEY ? 'Resend API' : 'Nodemailer SMTP',
      result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown Email error',
      stack: err.stack,
      driver: process.env.RESEND_API_KEY ? 'Resend API' : 'Nodemailer SMTP',
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not Set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not Set',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not Set',
    });
  }
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🏋️ GYMMM TANK Backend running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`========================================`);
});
