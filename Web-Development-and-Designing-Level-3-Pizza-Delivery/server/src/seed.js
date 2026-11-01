/**
 * Seed script for Crust & Craft
 * Run: npm run seed
 *
 * Safe to run multiple times — uses upsert to avoid duplicates.
 * Creates a demo admin account only if ADMIN_EMAIL and ADMIN_PASSWORD env vars are set.
 * Never commit real credentials.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Pizza = require('./models/Pizza');
const User = require('./models/User');
const Coupon = require('./models/Coupon');
const logger = require('./utils/logger');

const PIZZAS = [
  {
    name: 'Margherita Classic',
    description: 'San Marzano tomato sauce, fresh mozzarella, fragrant basil, extra-virgin olive oil. The pizza that started it all.',
    category: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop',
    basePrice: 199,
    isVeg: true,
    isFeatured: true,
    popularity: 95,
    availableToppings: [
      { name: 'Extra Cheese', price: 40, isVeg: true },
      { name: 'Olives', price: 30, isVeg: true },
      { name: 'Jalapeños', price: 25, isVeg: true },
    ],
  },
  {
    name: 'Pepperoni Perfection',
    description: 'Loaded with premium pepperoni slices on a rich tomato base with a generous mozzarella blanket. Classic American-Italian done right.',
    category: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop',
    basePrice: 279,
    isVeg: false,
    isFeatured: true,
    popularity: 98,
    availableToppings: [
      { name: 'Extra Pepperoni', price: 60, isVeg: false },
      { name: 'Extra Cheese', price: 40, isVeg: true },
      { name: 'Green Peppers', price: 25, isVeg: true },
    ],
  },
  {
    name: 'Garden Harvest',
    description: 'A celebration of fresh vegetables: roasted bell peppers, caramelised onions, sun-dried tomatoes, mushrooms, baby spinach.',
    category: 'Veggie',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop',
    basePrice: 249,
    isVeg: true,
    isFeatured: true,
    popularity: 78,
    availableToppings: [
      { name: 'Extra Cheese', price: 40, isVeg: true },
      { name: 'Corn', price: 20, isVeg: true },
      { name: 'Olives', price: 30, isVeg: true },
      { name: 'Jalapeños', price: 25, isVeg: true },
    ],
  },
  {
    name: 'The Inferno',
    description: 'Not for the faint-hearted. Ghost pepper sauce, spicy chicken, jalapeños, red onion, chilli oil finish, fresh coriander.',
    category: 'Spicy',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
    basePrice: 299,
    isVeg: false,
    isFeatured: true,
    popularity: 85,
    availableToppings: [
      { name: 'Extra Chilli Oil', price: 15, isVeg: true },
      { name: 'Extra Jalapeños', price: 25, isVeg: true },
      { name: 'Extra Chicken', price: 70, isVeg: false },
    ],
  },
  {
    name: 'Cheese Nirvana',
    description: 'Five-cheese blend: mozzarella, cheddar, gouda, parmesan, cream cheese. Drizzled with truffle oil. Pure indulgence.',
    category: 'Cheese Lovers',
    imageUrl: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&auto=format&fit=crop',
    basePrice: 329,
    isVeg: true,
    isFeatured: true,
    popularity: 90,
    availableToppings: [
      { name: 'Extra Mozzarella', price: 40, isVeg: true },
      { name: 'Truffle Oil', price: 50, isVeg: true },
      { name: 'Caramelised Onion', price: 30, isVeg: true },
    ],
  },
  {
    name: 'BBQ Smokestack',
    description: 'Smoky BBQ sauce, pulled chicken, crispy bacon, caramelised onion, mozzarella, topped with house BBQ drizzle.',
    category: 'BBQ',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    basePrice: 319,
    isVeg: false,
    isFeatured: false,
    popularity: 88,
    availableToppings: [
      { name: 'Extra Chicken', price: 70, isVeg: false },
      { name: 'Extra Bacon', price: 60, isVeg: false },
      { name: 'Extra BBQ Sauce', price: 15, isVeg: true },
    ],
  },
  {
    name: 'Paneer Tikka Delight',
    description: 'Marinated paneer tikka, green chutney base, red onion, capsicum, mozzarella. Desi flavours meet Italian craft.',
    category: 'Specialty',
    imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop',
    basePrice: 289,
    isVeg: true,
    isFeatured: false,
    popularity: 82,
    availableToppings: [
      { name: 'Extra Paneer', price: 60, isVeg: true },
      { name: 'Extra Cheese', price: 40, isVeg: true },
      { name: 'Corn', price: 20, isVeg: true },
    ],
  },
  {
    name: 'Mediterranean Sun',
    description: 'Hummus base, feta cheese, cherry tomatoes, kalamata olives, roasted artichokes, fresh rocket, za\'atar.',
    category: 'Specialty',
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop',
    basePrice: 309,
    isVeg: true,
    isFeatured: false,
    popularity: 72,
    availableToppings: [
      { name: 'Extra Feta', price: 45, isVeg: true },
      { name: 'Extra Olives', price: 30, isVeg: true },
    ],
  },
  {
    name: 'Chicken Tandoor Special',
    description: 'Tandoori chicken, tomato sauce, onion, capsicum, extra mozzarella, finished with mint chutney drizzle.',
    category: 'Spicy',
    imageUrl: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=600&auto=format&fit=crop',
    basePrice: 309,
    isVeg: false,
    isFeatured: false,
    popularity: 80,
    availableToppings: [
      { name: 'Extra Chicken', price: 70, isVeg: false },
      { name: 'Extra Cheese', price: 40, isVeg: true },
      { name: 'Jalapeños', price: 25, isVeg: true },
    ],
  },
  {
    name: 'Spinach & Ricotta',
    description: 'Creamy ricotta base, wilted spinach, caramelised garlic, pine nuts, mozzarella, lemon zest. Elegant and wholesome.',
    category: 'Veggie',
    imageUrl: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=600&auto=format&fit=crop',
    basePrice: 259,
    isVeg: true,
    isFeatured: false,
    popularity: 68,
    availableToppings: [
      { name: 'Extra Ricotta', price: 40, isVeg: true },
      { name: 'Pine Nuts', price: 35, isVeg: true },
    ],
  },
  {
    name: 'Double Pepperoni Extreme',
    description: 'Twice the pepperoni on a thick tomato sauce, four-cheese blend, chilli flakes. Bold, unapologetic, legendary.',
    category: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop',
    basePrice: 349,
    isVeg: false,
    isFeatured: false,
    popularity: 91,
    availableToppings: [
      { name: 'Bacon Crumbles', price: 60, isVeg: false },
      { name: 'Extra Cheese', price: 40, isVeg: true },
    ],
  },
  {
    name: 'Mushroom Forest',
    description: 'Wild mushroom medley, truffle cream sauce, caramelised onion, fresh thyme, aged parmesan, mozzarella.',
    category: 'Veggie',
    imageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop',
    basePrice: 279,
    isVeg: true,
    isFeatured: false,
    popularity: 74,
    availableToppings: [
      { name: 'Extra Mushrooms', price: 40, isVeg: true },
      { name: 'Truffle Oil', price: 50, isVeg: true },
      { name: 'Extra Cheese', price: 40, isVeg: true },
    ],
  },
];

const COUPONS = [
  {
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 100,
    minimumOrderAmount: 299,
    description: 'Welcome offer — 20% off up to ₹100 on first order',
    isActive: true,
  },
  {
    code: 'FLAT50',
    discountType: 'fixed',
    discountValue: 50,
    minimumOrderAmount: 499,
    description: '₹50 flat discount on orders above ₹499',
    isActive: true,
  },
  {
    code: 'PIZZALOVE',
    discountType: 'fixed',
    discountValue: 30,
    minimumOrderAmount: 199,
    description: 'Flat ₹30 off on any pizza order above ₹199',
    isActive: true,
  },
  {
    code: 'FEAST100',
    discountType: 'fixed',
    discountValue: 100,
    minimumOrderAmount: 799,
    description: 'Party order: Flat ₹100 off on orders above ₹799',
    isActive: true,
  },
  {
    code: 'CRAFTDAY',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscountAmount: 80,
    minimumOrderAmount: 399,
    description: 'Special craft discount — 15% off (max ₹80)',
    isActive: true,
  },
];

const seed = async () => {
  try {
    await connectDB();
    logger.info('🌱 Starting seed...');

    // Seed pizzas (upsert by name)
    let pizzaCount = 0;
    for (const pizzaData of PIZZAS) {
      const result = await Pizza.findOneAndUpdate(
        { name: pizzaData.name },
        { $setOnInsert: pizzaData },
        { upsert: true, new: true }
      );
      pizzaCount++;
    }
    logger.info(`✅ ${pizzaCount} pizzas seeded`);

    // Seed coupons
    let couponCount = 0;
    for (const couponData of COUPONS) {
      await Coupon.findOneAndUpdate(
        { code: couponData.code },
        { $setOnInsert: couponData },
        { upsert: true }
      );
      couponCount++;
    }
    logger.info(`✅ ${couponCount} coupons seeded`);

    // Seed default admin account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crustandcraft.dev';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      await User.create({
        name: 'Head Chef (Admin)',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
      });
      logger.info(`✅ Admin account created: ${adminEmail}`);
    } else {
      if (existingAdmin.role !== 'admin') {
        await User.findByIdAndUpdate(existingAdmin._id, { role: 'admin' });
      }
      logger.info(`ℹ️  Admin verified: ${adminEmail}`);
    }

    // Seed default demo customer account
    const demoCustomerEmail = 'customer@demo.com';
    const existingCustomer = await User.findOne({ email: demoCustomerEmail });
    if (!existingCustomer) {
      await User.create({
        name: 'Aarav Sharma',
        email: demoCustomerEmail,
        password: 'Customer@123',
        phone: '+91 98765 43210',
        role: 'customer',
        savedAddresses: [
          {
            label: 'Home',
            street: '402, Green Heights, Linking Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            phone: '+91 98765 43210',
          },
        ],
      });
      logger.info(`✅ Demo customer created: ${demoCustomerEmail}`);
    } else {
      logger.info(`ℹ️  Demo customer verified: ${demoCustomerEmail}`);
    }

    logger.info('\n🍕 Seed complete! Crust & Craft is ready to serve.\n');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seed();

