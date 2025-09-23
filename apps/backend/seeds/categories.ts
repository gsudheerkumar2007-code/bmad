import { Category } from '../src/models/Category';

export const categorySeeds = [
  // Root categories
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    parent: null
  },
  {
    name: 'Clothing',
    description: 'Apparel and accessories',
    parent: null
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    parent: null
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    parent: null
  },
  {
    name: 'Books',
    description: 'Books and educational materials',
    parent: null
  }
];

export const subcategorySeeds = [
  // Electronics subcategories
  {
    name: 'Smartphones',
    description: 'Mobile phones and accessories',
    parentName: 'Electronics'
  },
  {
    name: 'Laptops',
    description: 'Laptop computers and accessories',
    parentName: 'Electronics'
  },
  {
    name: 'Tablets',
    description: 'Tablet computers and accessories',
    parentName: 'Electronics'
  },
  {
    name: 'Audio',
    description: 'Headphones, speakers, and audio equipment',
    parentName: 'Electronics'
  },

  // Clothing subcategories
  {
    name: "Men's Clothing",
    description: 'Clothing for men',
    parentName: 'Clothing'
  },
  {
    name: "Women's Clothing",
    description: 'Clothing for women',
    parentName: 'Clothing'
  },
  {
    name: 'Shoes',
    description: 'Footwear for all ages',
    parentName: 'Clothing'
  },
  {
    name: 'Accessories',
    description: 'Fashion accessories',
    parentName: 'Clothing'
  },

  // Home & Garden subcategories
  {
    name: 'Furniture',
    description: 'Home and office furniture',
    parentName: 'Home & Garden'
  },
  {
    name: 'Kitchen',
    description: 'Kitchen appliances and utensils',
    parentName: 'Home & Garden'
  },
  {
    name: 'Garden Tools',
    description: 'Gardening tools and equipment',
    parentName: 'Home & Garden'
  },
  {
    name: 'Home Decor',
    description: 'Decorative items for home',
    parentName: 'Home & Garden'
  },

  // Sports & Outdoors subcategories
  {
    name: 'Fitness',
    description: 'Fitness equipment and gear',
    parentName: 'Sports & Outdoors'
  },
  {
    name: 'Camping',
    description: 'Camping and hiking gear',
    parentName: 'Sports & Outdoors'
  },
  {
    name: 'Team Sports',
    description: 'Equipment for team sports',
    parentName: 'Sports & Outdoors'
  },

  // Books subcategories
  {
    name: 'Fiction',
    description: 'Fictional literature',
    parentName: 'Books'
  },
  {
    name: 'Non-Fiction',
    description: 'Non-fictional books',
    parentName: 'Books'
  },
  {
    name: 'Educational',
    description: 'Educational and academic books',
    parentName: 'Books'
  }
];

export async function seedCategories(): Promise<void> {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create root categories first
    const createdCategories = new Map();

    for (const categoryData of categorySeeds) {
      const category = new Category(categoryData);
      const saved = await category.save();
      createdCategories.set(saved.name, saved._id);
      console.log(`Created category: ${saved.name}`);
    }

    // Create subcategories
    for (const subcategoryData of subcategorySeeds) {
      const parentId = createdCategories.get(subcategoryData.parentName);
      if (!parentId) {
        console.error(`Parent category not found: ${subcategoryData.parentName}`);
        continue;
      }

      const subcategory = new Category({
        name: subcategoryData.name,
        description: subcategoryData.description,
        parent: parentId
      });

      const saved = await subcategory.save();
      createdCategories.set(saved.name, saved._id);
      console.log(`Created subcategory: ${saved.name} under ${subcategoryData.parentName}`);
    }

    console.log(`Successfully seeded ${createdCategories.size} categories`);
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}