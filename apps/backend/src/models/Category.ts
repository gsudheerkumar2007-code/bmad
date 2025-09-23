import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for hierarchical queries
categorySchema.index({ parent: 1, isActive: 1 });

// Pre-save middleware to update parent's children array
categorySchema.pre<ICategory>('save', async function(next) {
  if (this.isNew && this.parent) {
    try {
      await mongoose.model('Category').findByIdAndUpdate(
        this.parent,
        { $addToSet: { children: this._id } }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Pre-remove middleware to clean up parent-child relationships
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove this category from parent's children array
    if (this.parent) {
      await mongoose.model('Category').findByIdAndUpdate(
        this.parent,
        { $pull: { children: this._id } }
      );
    }

    // Update children to remove parent reference
    await mongoose.model('Category').updateMany(
      { parent: this._id },
      { $unset: { parent: 1 } }
    );
  } catch (error) {
    return next(error as Error);
  }
  next();
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);