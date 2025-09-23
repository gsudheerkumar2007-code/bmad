import { Product } from '../src/models/Product';
import { Category } from '../src/models/Category';

export const productSeeds = [
  // Electronics - Smartphones
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple iPhone with advanced camera system and A17 Pro chip. Features titanium design and Action Button.',
    price: 999.99,
    category: 'Smartphones',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 50
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features. Large 6.8" display.',
    price: 1199.99,
    category: 'Smartphones',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 30
  },
  {
    name: 'Google Pixel 8',
    description: 'Google Pixel phone with advanced AI photography and pure Android experience.',
    price: 699.99,
    category: 'Smartphones',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 25
  },

  // Electronics - Laptops
  {
    name: 'MacBook Pro 16-inch M3',
    description: 'Professional laptop with M3 chip, 16-inch Liquid Retina XDR display, and up to 22 hours battery life.',
    price: 2499.99,
    category: 'Laptops',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 15
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with 13.4" InfinityEdge display and Intel Core processors.',
    price: 1299.99,
    category: 'Laptops',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 20
  },

  // Electronics - Audio
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life.',
    price: 399.99,
    category: 'Audio',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 40
  },
  {
    name: 'AirPods Pro (2nd generation)',
    description: 'Apple AirPods Pro with active noise cancellation and spatial audio.',
    price: 249.99,
    category: 'Audio',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 60
  },

  // Clothing - Men's
  {
    name: 'Classic Blue Jeans',
    description: 'Comfortable straight-fit blue jeans made from premium denim.',
    price: 79.99,
    category: "Men's Clothing",
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 100
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Soft cotton t-shirt available in multiple colors. Perfect for casual wear.',
    price: 24.99,
    category: "Men's Clothing",
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 150
  },

  // Clothing - Women's
  {
    name: 'Summer Dress',
    description: 'Light and airy summer dress perfect for warm weather. Available in floral patterns.',
    price: 89.99,
    category: "Women's Clothing",
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 75
  },
  {
    name: 'Yoga Leggings',
    description: 'High-performance yoga leggings with moisture-wicking fabric.',
    price: 59.99,
    category: "Women's Clothing",
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 80
  },

  // Home & Garden - Kitchen
  {
    name: 'Stainless Steel Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe and 12-cup capacity.',
    price: 149.99,
    category: 'Kitchen',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 35
  },
  {
    name: 'Non-Stick Cookware Set',
    description: '10-piece non-stick cookware set with heat-resistant handles.',
    price: 199.99,
    category: 'Kitchen',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 25
  },

  // Sports & Outdoors - Fitness
  {
    name: 'Adjustable Dumbbells',
    description: 'Space-saving adjustable dumbbells with weight range from 5-50 lbs each.',
    price: 299.99,
    category: 'Fitness',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 20
  },
  {
    name: 'Yoga Mat',
    description: 'Premium non-slip yoga mat with extra cushioning for comfort.',
    price: 39.99,
    category: 'Fitness',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 90
  },

  // Books
  {
    name: 'The Great Gatsby',
    description: 'Classic American novel by F. Scott Fitzgerald. A timeless story of love and tragedy.',
    price: 12.99,
    category: 'Fiction',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 200
  },
  {
    name: 'Introduction to Machine Learning',
    description: 'Comprehensive guide to machine learning concepts and algorithms.',
    price: 89.99,
    category: 'Educational',
    images: [
      'assets/images/product-placeholder.svg'
    ],
    inventory: 45
  }
];

export async function seedProducts(): Promise<void> {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Get all categories to validate category names
    const categories = await Category.find({});
    const categoryNames = new Set(categories.map(cat => cat.name));

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of productSeeds) {
      // Validate category exists
      if (!categoryNames.has(productData.category)) {
        console.warn(`Skipping product "${productData.name}" - category "${productData.category}" not found`);
        skippedCount++;
        continue;
      }

      const product = new Product(productData);
      await product.save();
      createdCount++;
      console.log(`Created product: ${product.name} in category ${product.category}`);
    }

    console.log(`Successfully seeded ${createdCount} products`);
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} products due to missing categories`);
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}