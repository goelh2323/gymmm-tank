import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helper: produce a Date object for a specific month/day with a random hour
// so that orders don't all cluster at midnight.
// ---------------------------------------------------------------------------
function dateInMonth(year: number, month: number, day: number): Date {
  // month is 1-based (1 = January)
  return new Date(year, month - 1, day, Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 59));
}

// Convenience: random integer between min and max (inclusive)
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Product definitions
// ---------------------------------------------------------------------------
const PRODUCT_DEFS = [
  // idx 0
  {
    name: 'DOUBLE SHOT PRE-WORKOUT',
    description: 'Engineered for mind, muscle, and maximum performance. Formulated with L-Citrulline, Beta-Alanine, and Caffeine to power your workouts.',
    price: 2999.00,
    salePrice: 2499.00,
    image: '/images/pre_workout.webp',
    category: 'Pre-workout',
    goal: 'Muscle Building',
    flavors: 'Sour Watermelon, Fruit Punch, Blue Raspberry',
    sizes: '30 Servings',
    stock: 12,
    isBestSeller: true,
    isNewArrival: false,
    isHidden: false,
  },
  // idx 1
  {
    name: '100% ISO WHEY TANK',
    description: 'Ultra-pure isolate whey protein powder. Fast-digesting protein to repair muscle tissues and accelerate post-workout recovery.',
    price: 5999.00,
    salePrice: 4999.00,
    image: '/images/whey_protein.webp',
    category: 'Whey Protein',
    goal: 'Muscle Building',
    flavors: 'Double Chocolate, Vanilla Ice Cream, Café Latte',
    sizes: '1 kg, 2 kg',
    stock: 15,
    isBestSeller: true,
    isNewArrival: true,
    isHidden: false,
  },
  // idx 2 — intentionally 0 stock (shows in out-of-stock alert)
  {
    name: 'CREATINE CHARGE',
    description: '100% pure micronized creatine monohydrate. Promotes strength, power, and cellular hydration to increase muscular volume.',
    price: 1299.00,
    salePrice: 999.00,
    image: '/images/creatine.webp',
    category: 'Coming Soon',
    goal: 'Muscle Building',
    flavors: 'Unflavored, Green Apple',
    sizes: '250g, 500g',
    stock: 0,
    isBestSeller: false,
    isNewArrival: false,
    isHidden: false,
  },
  // idx 3 — very low stock (4 units)
  {
    name: 'EAA + BCAA RECOVERY FUEL',
    description: 'Essential and branched-chain amino acids in a premium ratio. Supports muscle recovery, reduces muscle soreness, and maintains hydration.',
    price: 1999.00,
    salePrice: 1599.00,
    image: '/images/eaa_bcaa.webp',
    category: 'EAA + BCAA',
    goal: 'Recovery',
    flavors: 'Mango Shake, Pineapple Rush',
    sizes: '300g',
    stock: 4,
    isBestSeller: false,
    isNewArrival: true,
    isHidden: false,
  },
  // idx 4
  {
    name: 'SHRED TANK BURNER',
    description: 'Advanced thermogenic formula designed to boost energy, increase metabolism, and support healthy weight management.',
    price: 2499.00,
    salePrice: 1999.00,
    image: '/images/fat_burner.webp',
    category: 'Coming Soon',
    goal: 'Weight Loss',
    flavors: 'Lemon Lime, Grape',
    sizes: '60 Capsules',
    stock: 0,
    isBestSeller: false,
    isNewArrival: false,
    isHidden: false,
  },
  // idx 5 — low stock (7 units)
  {
    name: 'PURE CITRULLINE MALATE',
    description: 'Maximizes muscular vasodilatation, delays muscle fatigue, and pumps nutrients. Serving size: 2g (Total 100 Servings).',
    price: 1499.00,
    salePrice: null,
    image: '/images/citrulline.webp',
    category: 'Pre-workout',
    goal: 'Muscle Building',
    flavors: 'Unflavored, Orange Blast',
    sizes: '200g',
    stock: 7,
    isBestSeller: false,
    isNewArrival: true,
    isHidden: false,
  },
  // idx 6
  {
    name: 'MASSIVE MASS GAINER',
    description: 'Formulated with clean carbohydrates and premium protein source to pack on serious size and fuel massive muscle gains. 3kg Box.',
    price: 3499.00,
    salePrice: 2999.00,
    image: '/images/mass_gainer.webp',
    category: 'Mass Gainer',
    goal: 'Muscle Building',
    flavors: 'Double Chocolate, Cookies & Cream',
    sizes: '3 kg',
    stock: 10,
    isBestSeller: false,
    isNewArrival: true,
    isHidden: false,
  },
];

// ---------------------------------------------------------------------------
// Customer profiles
// ---------------------------------------------------------------------------
const CUSTOMER_PROFILES = [
  { name: 'John Doe',     email: 'john.doe@gmail.com',      city: 'Mumbai',    state: 'Maharashtra' },
  { name: 'Priya Sharma', email: 'priya.sharma@gmail.com',  city: 'Delhi',     state: 'Delhi' },
  { name: 'Arjun Mehta',  email: 'arjun.mehta@gmail.com',   city: 'Bangalore', state: 'Karnataka' },
  { name: 'Sneha Kapoor', email: 'sneha.kapoor@yahoo.com',  city: 'Pune',      state: 'Maharashtra' },
  { name: 'Rahul Singh',  email: 'rahul.singh@hotmail.com', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Divya Nair',   email: 'divya.nair@gmail.com',    city: 'Chennai',   state: 'Tamil Nadu' },
  { name: 'Vikram Patel', email: 'vikram.patel@gmail.com',  city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Meera Joshi',  email: 'meera.joshi@gmail.com',   city: 'Kolkata',   state: 'West Bengal' },
  { name: 'Rohan Gupta',  email: 'rohan.gupta@outlook.com', city: 'Jaipur',    state: 'Rajasthan' },
  { name: 'Anjali Verma', email: 'anjali.verma@gmail.com',  city: 'Lucknow',   state: 'Uttar Pradesh' },
];

// ---------------------------------------------------------------------------
// Order templates: each template maps to a real set of order items.
// productIdx refers to PRODUCT_DEFS indices above.
// ---------------------------------------------------------------------------
type OrderTemplate = {
  items: { productIdx: number; flavor: string; size: string; qty: number }[];
};

const ORDER_TEMPLATES: OrderTemplate[] = [
  // 0 — Whey only (2kg)
  { items: [{ productIdx: 1, flavor: 'Double Chocolate', size: '2 kg', qty: 1 }] },
  // 1 — Pre-workout + BCAA stack
  { items: [{ productIdx: 0, flavor: 'Sour Watermelon', size: '30 Servings', qty: 1 }, { productIdx: 3, flavor: 'Mango Shake', size: '300g', qty: 1 }] },
  // 2 — Whey + Citrulline
  { items: [{ productIdx: 1, flavor: 'Vanilla Ice Cream', size: '1 kg', qty: 1 }, { productIdx: 5, flavor: 'Unflavored', size: '200g', qty: 1 }] },
  // 3 — Pre-workout bulk
  { items: [{ productIdx: 0, flavor: 'Fruit Punch', size: '30 Servings', qty: 2 }] },
  // 4 — Mass gainer
  { items: [{ productIdx: 6, flavor: 'Double Chocolate', size: '3 kg', qty: 1 }] },
  // 5 — Mass gainer + BCAA
  { items: [{ productIdx: 6, flavor: 'Cookies & Cream', size: '3 kg', qty: 1 }, { productIdx: 3, flavor: 'Pineapple Rush', size: '300g', qty: 2 }] },
  // 6 — Whey bulk (2x 2kg)
  { items: [{ productIdx: 1, flavor: 'Café Latte', size: '2 kg', qty: 2 }] },
  // 7 — BCAA bulk
  { items: [{ productIdx: 3, flavor: 'Mango Shake', size: '300g', qty: 3 }] },
  // 8 — Pre-workout + Citrulline
  { items: [{ productIdx: 0, flavor: 'Blue Raspberry', size: '30 Servings', qty: 1 }, { productIdx: 5, flavor: 'Orange Blast', size: '200g', qty: 1 }] },
  // 9 — Whey + Mass gainer
  { items: [{ productIdx: 1, flavor: 'Double Chocolate', size: '1 kg', qty: 1 }, { productIdx: 6, flavor: 'Double Chocolate', size: '3 kg', qty: 1 }] },
  // 10 — Pre-workout 3-pack
  { items: [{ productIdx: 0, flavor: 'Sour Watermelon', size: '30 Servings', qty: 3 }] },
  // 11 — Citrulline solo
  { items: [{ productIdx: 5, flavor: 'Unflavored', size: '200g', qty: 2 }] },
  // 12 — Full stack (whey + pre + bcaa)
  { items: [{ productIdx: 1, flavor: 'Vanilla Ice Cream', size: '2 kg', qty: 1 }, { productIdx: 0, flavor: 'Fruit Punch', size: '30 Servings', qty: 1 }, { productIdx: 3, flavor: 'Pineapple Rush', size: '300g', qty: 1 }] },
  // 13 — Mass gainer large
  { items: [{ productIdx: 6, flavor: 'Cookies & Cream', size: '3 kg', qty: 2 }] },
  // 14 — Whey 1kg entry order
  { items: [{ productIdx: 1, flavor: 'Double Chocolate', size: '1 kg', qty: 1 }] },
];

async function main() {
  console.log('🧹 Cleaning existing database records...');

  // Delete in dependency order to avoid FK violations
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});

  // -------------------------------------------------------------------------
  // 1. Admin user
  // -------------------------------------------------------------------------
  const hashedAdminPw = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@powertanknutrition.com',
      name: 'Power Tank Nutrition Admin',
      password: hashedAdminPw,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  // -------------------------------------------------------------------------
  // 2. Customer users (10 profiles)
  // -------------------------------------------------------------------------
  const customerPw = await bcrypt.hash('customer123', 10);
  const customerUsers: Array<{ id: string; profile: typeof CUSTOMER_PROFILES[0] }> = [];
  for (const profile of CUSTOMER_PROFILES) {
    const u = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        password: customerPw,
        role: 'USER',
        coins: rand(50, 500),
      },
    });
    customerUsers.push({ id: u.id, profile });
  }
  console.log(`✅ ${customerUsers.length} customer users seeded`);

  // -------------------------------------------------------------------------
  // 3. Products
  // -------------------------------------------------------------------------
  const createdProducts: Array<{ id: string; price: number; salePrice: number | null; name: string }> = [];
  for (const def of PRODUCT_DEFS) {
    const p = await prisma.product.create({ data: def });
    createdProducts.push(p);
  }
  console.log(`✅ ${createdProducts.length} products seeded`);

  // -------------------------------------------------------------------------
  // 4. Orders — spread across Jan–Jul 2026 with a growth curve
  //
  // Month counts:
  //   Jan: 8   (slow start, brand new)
  //   Feb: 12  (word-of-mouth begins)
  //   Mar: 16  (pre-summer fitness rush)
  //   Apr: 18  (peak)
  //   May: 16  (sustained)
  //   Jun: 14  (slight dip)
  //   Jul: 10  (partial month)
  //   TOTAL: 94 orders
  //
  // Customers are rotated with a bias so some customers appear in multiple
  // months — this makes the "repeat customer" metric meaningful.
  // -------------------------------------------------------------------------

  const monthSchedule = [
    { year: 2026, month: 1, count: 8 },
    { year: 2026, month: 2, count: 12 },
    { year: 2026, month: 3, count: 16 },
    { year: 2026, month: 4, count: 18 },
    { year: 2026, month: 5, count: 16 },
    { year: 2026, month: 6, count: 14 },
    { year: 2026, month: 7, count: 10 },
  ];

  // Days in each month (Jan=31, Feb=28, Mar=31, ...)
  const maxDays = [0, 31, 28, 31, 30, 31, 30, 31];

  const paymentMethods = ['COD', 'UPI', 'UPI', 'CARD', 'COD'];
  // Weighted: DELIVERED is most common for older orders
  const fulfillmentOptions = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PENDING'];
  const promoCodes = ['TANK10', 'POWERUP', null, null, null]; // ~40% get a code

  let templateCursor = 0;
  let customerCursor = 0;
  let ordersCreated = 0;

  for (const { year, month, count } of monthSchedule) {
    for (let i = 0; i < count; i++) {
      const customerIdx = customerCursor % customerUsers.length;
      const templateIdx = templateCursor % ORDER_TEMPLATES.length;
      const cu = customerUsers[customerIdx];
      const template = ORDER_TEMPLATES[templateIdx];

      // Random day in month, random hour
      const day = rand(1, maxDays[month]);
      const orderDate = dateInMonth(year, month, day);

      // Older months mostly PAID; current month (Jul) has more PENDING
      const paidChance = month <= 6 ? 0.95 : 0.70;
      const paymentStatus = Math.random() < paidChance ? 'PAID' : 'PENDING';
      const fulfillment = paymentStatus === 'PENDING'
        ? 'PENDING'
        : fulfillmentOptions[rand(0, fulfillmentOptions.length - 1)];

      // Build order items and compute totals
      let subtotal = 0;
      const itemsData = template.items.map(item => {
        const prod = createdProducts[item.productIdx];
        const unitPrice = prod.salePrice ?? prod.price;
        subtotal += unitPrice * item.qty;
        return {
          productId: prod.id,
          productName: prod.name,
          flavor: item.flavor,
          size: item.size,
          quantity: item.qty,
          price: unitPrice,
        };
      });

      // Optional promo code — 10% discount
      const promoCode = promoCodes[rand(0, promoCodes.length - 1)];
      const savings = promoCode ? Math.round(subtotal * 0.10) : 0;
      const total = subtotal - savings;
      const coinsEarned = Math.floor(total / 100); // 1 coin per ₹100

      await prisma.order.create({
        data: {
          userId: cu.id,
          customerName: cu.profile.name,
          customerEmail: cu.profile.email,
          customerPhone: `9${rand(100000000, 999999999)}`,
          address: `${rand(1, 999)} ${['MG Road', 'Park Street', 'Link Road', 'Brigade Road', 'FC Road'][rand(0, 4)]}`,
          city: cu.profile.city,
          state: cu.profile.state,
          pincode: `${rand(100000, 999999)}`,
          paymentMethod: paymentMethods[rand(0, paymentMethods.length - 1)],
          paymentStatus,
          fulfillment,
          subtotal,
          savings,
          total,
          promoCode,
          coinsRedeemed: 0,
          coinsEarned,
          // Force the createdAt so analytics queries see the correct month
          createdAt: orderDate,
          updatedAt: orderDate,
          items: { create: itemsData },
        },
      });

      ordersCreated++;
      templateCursor++;
      // Advance customer cursor every 3 orders — some customers repeat
      if (i % 3 === 0) customerCursor++;
    }
  }

  console.log(`✅ ${ordersCreated} orders created across Jan–Jul 2026`);
  console.log('\n🏋️  Database ready for analytics!');
  console.log('   📊 7-month revenue trend available');
  console.log('   👥 10 customers — multiple repeat buyers');
  console.log('   📉 3 products with low/zero stock for alert testing');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
