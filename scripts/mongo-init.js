// MongoDB initialization script
db = db.getSiblingDB('ecommerce');

// Create collections with indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('carts');
db.createCollection('orders');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ isActive: 1 });
db.carts.createIndex({ userId: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });

print("Database initialized with collections and indexes");