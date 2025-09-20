import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Configure mongoose options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false // Disable mongoose buffering
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log(`Connected to MongoDB: ${MONGODB_URI}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    const state = mongoose.connection.readyState;

    switch (state) {
      case 0:
        return { status: 'disconnected', message: 'Not connected to database' };
      case 1:
        return { status: 'connected', message: 'Successfully connected to database' };
      case 2:
        return { status: 'connecting', message: 'Connecting to database' };
      case 3:
        return { status: 'disconnecting', message: 'Disconnecting from database' };
      default:
        return { status: 'unknown', message: 'Unknown database connection state' };
    }
  } catch (error) {
    return { status: 'error', message: `Database health check failed: ${error}` };
  }
};