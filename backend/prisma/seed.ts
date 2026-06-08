import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing database records
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gymmmtank.com',
      name: 'Gymmm Tank Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Seeded admin user:', admin.email);

  // Seed Customer User
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@gymmmtank.com',
      name: 'John Doe',
      password: customerPassword,
      role: 'USER',
      coins: 350,
    },
  });
  console.log('Seeded customer user:', customer.email);

  // Seed Products
  const products = [
    {
      name: 'DOUBLE SHOT PRE-WORKOUT',
      description: 'Engineered for mind, muscle, and maximum performance. Formulated with L-Citrulline, Beta-Alanine, and Caffeine to power your workouts.',
      price: 2999.00,
      salePrice: 2499.00,
      image: '/images/pre_workout.png',
      category: 'Pre-workout',
      goal: 'Muscle Building',
      flavors: 'Sour Watermelon, Fruit Punch, Blue Raspberry',
      sizes: '30 Servings',
      stock: 12,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: '100% ISO WHEY TANK',
      description: 'Ultra-pure isolate whey protein powder. Fast-digesting protein to repair muscle tissues and accelerate post-workout recovery.',
      price: 5999.00,
      salePrice: 4999.00,
      image: '/images/whey_protein.png',
      category: 'Whey Protein',
      goal: 'Muscle Building',
      flavors: 'Double Chocolate, Vanilla Ice Cream, Café Latte',
      sizes: '1 kg, 2 kg',
      stock: 15,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      name: 'CREATINE CHARGE',
      description: '100% pure micronized creatine monohydrate. Promotes strength, power, and cellular hydration to increase muscular volume.',
      price: 1299.00,
      salePrice: 999.00,
      image: '/images/creatine.png',
      category: 'Coming Soon',
      goal: 'Muscle Building',
      flavors: 'Unflavored, Green Apple',
      sizes: '250g, 500g',
      stock: 0,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'EAA + BCAA RECOVERY FUEL',
      description: 'Essential and branched-chain amino acids in a premium ratio. Supports muscle recovery, reduces muscle soreness, and maintains hydration during intense training.',
      price: 1999.00,
      salePrice: 1599.00,
      image: '/images/eaa_bcaa.png',
      category: 'EAA + BCAA',
      goal: 'Recovery',
      flavors: 'Mango Shake, Pineapple Rush',
      sizes: '300g',
      stock: 22,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'SHRED TANK BURNER',
      description: 'Advanced thermogenic formula designed to boost energy, increase metabolism, and support healthy weight management.',
      price: 2499.00,
      salePrice: 1999.00,
      image: '/images/fat_burner.png',
      category: 'Coming Soon',
      goal: 'Weight Loss',
      flavors: 'Lemon Lime, Grape',
      sizes: '60 Capsules',
      stock: 0,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'PURE CITRULLINE MALATE',
      description: 'Maximizes muscular vasodilatation, delays muscle fatigue, and pumps nutrients. Serving size: 2g (Total 100 Servings).',
      price: 1499.00,
      salePrice: null,
      image: '/images/citrulline.png',
      category: 'Pre-workout',
      goal: 'Muscle Building',
      flavors: 'Unflavored, Orange Blast',
      sizes: '200g',
      stock: 15,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'MASSIVE MASS GAINER',
      description: 'Formulated with clean carbohydrates and premium protein source to pack on serious size and fuel massive muscle gains. 3kg Box.',
      price: 3499.00,
      salePrice: 2999.00,
      image: '/images/mass_gainer.png',
      category: 'Mass Gainer',
      goal: 'Muscle Building',
      flavors: 'Double Chocolate, Cookies & Cream',
      sizes: '3 kg',
      stock: 10,
      isBestSeller: false,
      isNewArrival: true,
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`Seeded database with ${products.length} products successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
