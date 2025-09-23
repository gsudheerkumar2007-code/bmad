import mongoose from 'mongoose';
import { seedCategories } from './categories';
import { seedProducts } from './products';

async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function runSeeds(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    await connectDatabase();

    // Seed categories first (products depend on categories)
    console.log('\n--- Seeding Categories ---');
    await seedCategories();

    console.log('\n--- Seeding Products ---');
    await seedProducts();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function clearDatabase(): Promise<void> {
  try {
    console.log('Clearing database...');

    await connectDatabase();

    // Clear in reverse dependency order
    const { Product } = await import('../src/models/Product');
    const { Category } = await import('../src/models/Category');

    await Product.deleteMany({});
    console.log('Cleared products');

    await Category.deleteMany({});
    console.log('Cleared categories');

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'seed':
    runSeeds();
    break;
  case 'clear':
    clearDatabase();
    break;
  case 'reset':
    clearDatabase().then(() => {
      setTimeout(() => runSeeds(), 1000);
    });
    break;
  default:
    console.log('Usage:');
    console.log('  npm run seed        - Seed the database with sample data');
    console.log('  npm run seed:clear  - Clear all seeded data');
    console.log('  npm run seed:reset  - Clear and re-seed the database');
    process.exit(1);
}