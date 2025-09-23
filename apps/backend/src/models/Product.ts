import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) { return v >= 0; },
      message: 'Price must be non-negative'
    }
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        // Allow both URLs and relative paths
        return /^https?:\/\/.+/.test(v) || /^\//.test(v) || /^assets\//.test(v);
      },
      message: 'Image must be a valid URL or relative path'
    }
  }],
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Compound indexes for optimized queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);