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
  // If RESEND_API_KEY is defined, we skip Nodemailer SMTP initialization (use Resend HTTP API)
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Email system ready (Resend HTTP API)');
    return;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production: use real Gmail SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Email transporter ready (Gmail SMTP)');
  } else {
    // Development: auto-create Ethereal test account (emails captured at ethereal.email)
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
  }
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
    const info = await transporter.sendMail({
      from: `"GYMMM TANK" <${process.env.EMAIL_USER || testEmailAccount?.user || 'noreply@gymmmtank.com'}>`,
      to,
      subject,
      html,
    });

    if (!process.env.EMAIL_USER) {
      console.log(`📧 SMTP Email preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } else {
    throw new Error('No email sender is configured (missing RESEND_API_KEY or EMAIL_USER/EMAIL_PASS)');
  }
};

// Helper: format ₹ amounts
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Send order confirmation email to the customer
const sendOrderConfirmationEmail = async (order: any) => {
  try {
    const itemsHtml = (order.items || [])
      .map((item: any) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#666;">${item.flavor} | ${item.size}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
      ).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a2e);padding:32px;text-align:center;">
          <h1 style="color:#d4af37;margin:0;font-size:28px;letter-spacing:2px;">GYMMM TANK</h1>
          <p style="color:#888;margin:8px 0 0;font-size:12px;letter-spacing:3px;">ORDER CONFIRMED</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a2e;margin:0 0 8px;">Thank you, ${order.customerName}! 💪</h2>
          <p style="color:#555;margin:0 0 24px;">Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been placed successfully and is being processed.</p>
          
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#f8f4e8;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#333;">PRODUCT</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#333;">VARIANT</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#333;">QTY</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#333;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background:#f8f9ff;border-left:4px solid #d4af37;padding:16px 20px;margin-bottom:24px;">
            <table style="width:100%;">
              <tr><td style="color:#555;padding:3px 0;">Subtotal</td><td style="text-align:right;color:#333;">${formatINR(order.subtotal)}</td></tr>
              ${order.savings > 0 ? `<tr><td style="color:#22c55e;padding:3px 0;">Savings</td><td style="text-align:right;color:#22c55e;">-${formatINR(order.savings)}</td></tr>` : ''}
              ${order.coinsRedeemed > 0 ? `<tr><td style="color:#d4af37;padding:3px 0;">Tank Coins Redeemed</td><td style="text-align:right;color:#d4af37;">-${order.coinsRedeemed} coins</td></tr>` : ''}
              <tr><td style="font-weight:700;font-size:16px;padding:8px 0 0;color:#1a1a2e;">Total</td><td style="text-align:right;font-weight:700;font-size:16px;color:#d4af37;padding-top:8px;">${formatINR(order.total)}</td></tr>
            </table>
          </div>

          <div style="background:#0a0a0a;color:#fff;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#d4af37;letter-spacing:2px;font-weight:700;">DELIVERY DETAILS</p>
            <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${order.address}, ${order.city}, ${order.state} — ${order.pincode}</p>
            <p style="margin:4px 0 0;color:#888;font-size:13px;">Payment: ${order.paymentMethod} · Status: <span style="color:#f59e0b;">${order.paymentStatus}</span></p>
          </div>

          ${order.coinsEarned > 0 ? `<p style="color:#d4af37;font-weight:600;">🏆 You earned <strong>${order.coinsEarned} Tank Coins</strong> on this order!</p>` : ''}
          <p style="color:#888;font-size:13px;">Questions? Contact us at <a href="mailto:support@gymmmtank.com" style="color:#d4af37;">support@gymmmtank.com</a> or call 9350931316</p>
        </div>
        <div style="background:#0a0a0a;padding:16px;text-align:center;">
          <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} GYMMM TANK Supplements · Engineered for Mind, Muscle & Performance</p>
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
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a2e);padding:32px;text-align:center;">
          <h1 style="color:#d4af37;margin:0;font-size:28px;letter-spacing:2px;">GYMMM TANK</h1>
          <p style="color:#888;margin:8px 0 0;font-size:12px;letter-spacing:3px;">YOUR ORDER IS ON ITS WAY!</p>
        </div>
        <div style="padding:32px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">🚀</div>
          <h2 style="color:#1a1a2e;margin:0 0 12px;">It's Shipped, ${order.customerName}!</h2>
          <p style="color:#555;max-width:400px;margin:0 auto 24px;line-height:1.6;">
            Your GYMMM TANK order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been dispatched and is on its way to you. Estimated delivery: <strong>3-5 business days</strong>.
          </p>
          <div style="background:#f8f4e8;border:2px solid #d4af37;border-radius:12px;padding:20px;display:inline-block;">
            <p style="margin:0 0 4px;color:#888;font-size:12px;">DELIVERY ADDRESS</p>
            <p style="margin:0;font-weight:600;color:#1a1a2e;">${order.address}, ${order.city}</p>
            <p style="margin:2px 0 0;color:#555;">${order.state} — ${order.pincode}</p>
          </div>
          <p style="color:#888;margin:24px 0 0;font-size:13px;">Need help? <a href="mailto:support@gymmmtank.com" style="color:#d4af37;">support@gymmmtank.com</a> | 9350931316</p>
        </div>
        <div style="background:#0a0a0a;padding:16px;text-align:center;">
          <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} GYMMM TANK Supplements · Engineered for Mind, Muscle & Performance</p>
        </div>
      </div>`;

    await sendEmail({
      to: order.customerEmail,
      subject: `🚀 Your Order is Shipped! #${order.id.slice(0, 8).toUpperCase()} — GYMMM TANK`,
      html,
    });
  } catch (err) {
    console.error('Failed to send shipment email:', err);
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
