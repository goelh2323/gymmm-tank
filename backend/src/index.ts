import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from './db';
import { exec } from 'child_process';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gymmm-tank-secret-key-9988';

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

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
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
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
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
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
app.post('/api/v1/orders', async (req: Request, res: Response) => {
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

    // Verify stock availability
    for (const item of orderData.items) {
      // Exclude the FREE Shaker Bottle from database stock checks since it's a promotional item
      if (item.productId === 'free-shaker-bottle') continue;

      const dbProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!dbProduct) {
        return res.status(404).json({ error: `Product ${item.productName} not found` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.productName}. Available: ${dbProduct.stock}` });
      }
    }

    // Deduct stock for actual inventory items
    for (const item of orderData.items) {
      if (item.productId === 'free-shaker-bottle') continue;

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Update loyalty points if logged in
    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        const newCoins = dbUser.coins - orderData.coinsRedeemed + orderData.coinsEarned;
        await prisma.user.update({
          where: { id: userId },
          data: {
            coins: Math.max(0, newCoins)
          }
        });
      }
    }

    // Save Order and OrderItems
    const createdOrder = await prisma.order.create({
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
          }))
        }
      },
      include: {
        items: true
      }
    });

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

// Fetch all orders (Admin only)
app.get('/api/v1/admin/orders', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// Update order fulfillment or payment status (Admin only)
app.put('/api/v1/admin/orders/:id/status', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fulfillment, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData: any = {};
    if (fulfillment) updateData.fulfillment = fulfillment; // PENDING, SHIPPED, DELIVERED
    if (paymentStatus) updateData.paymentStatus = paymentStatus; // PENDING, PAID

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    });

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

// Start the Express Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🏋️ GYMMM TANK Backend running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`========================================`);
});
