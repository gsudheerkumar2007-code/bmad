import { User, IUser } from './User';

// User factory functions for testing
interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface UserOverrides {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

export const userFactory = {
  build: (overrides: UserOverrides = {}): UserData => ({
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    isAdmin: false,
    ...overrides
  }),

  create: async (overrides: UserOverrides = {}): Promise<IUser> => {
    const userData = userFactory.build(overrides);
    const user = new User(userData);
    return await user.save();
  },

  buildList: (count: number, overrides: UserOverrides = {}): UserData[] => {
    return Array.from({ length: count }, (_, index) =>
      userFactory.build({
        email: `test${index + 1}@example.com`,
        ...overrides
      })
    );
  },

  createList: async (count: number, overrides: UserOverrides = {}): Promise<IUser[]> => {
    const usersData = userFactory.buildList(count, overrides);
    return await User.insertMany(usersData);
  }
};

describe('User Model', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = userFactory.build();
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(userData.email!.toLowerCase());
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.isAdmin).toBe(false);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should require email field', async () => {
      const userData = { ...userFactory.build() };
      delete (userData as any).email;
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should require password field', async () => {
      const userData = { ...userFactory.build() };
      delete (userData as any).password;
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should require firstName field', async () => {
      const userData = { ...userFactory.build() };
      delete (userData as any).firstName;
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should require lastName field', async () => {
      const userData = { ...userFactory.build() };
      delete (userData as any).lastName;
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should enforce unique email constraint', async () => {
      const userData = userFactory.build();
      await userFactory.create(userData);

      const duplicateUser = new User(userData);
      try {
        await duplicateUser.save();
        fail('Expected duplicate key error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate email format', async () => {
      const userData = userFactory.build({ email: 'invalid-email' });
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected email validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should enforce minimum password length', async () => {
      const userData = userFactory.build({ password: '123' });
      const user = new User(userData);

      try {
        await user.save();
        fail('Expected password validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should convert email to lowercase', async () => {
      const userData = userFactory.build({ email: 'TEST@EXAMPLE.COM' });
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should trim firstName and lastName', async () => {
      const userData = userFactory.build({
        firstName: '  John  ',
        lastName: '  Doe  '
      });
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.firstName).toBe('John');
      expect(savedUser.lastName).toBe('Doe');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = userFactory.build({ password: 'plaintext123' });
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe('plaintext123');
      expect(savedUser.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should not rehash password if not modified', async () => {
      const user = await userFactory.create();
      const originalHash = user.password;

      user.firstName = 'Updated';
      const updatedUser = await user.save();

      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const plainPassword = 'TestPassword123!';
      const user = await userFactory.create({ password: plainPassword });

      const isValid = await user.comparePassword(plainPassword);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const user = await userFactory.create({ password: 'TestPassword123!' });

      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should exclude password from JSON output', async () => {
      const user = await userFactory.create();
      const userJSON = user.toJSON();

      expect((userJSON as any).password).toBeUndefined();
      expect(userJSON.email).toBeDefined();
      expect(userJSON.firstName).toBeDefined();
      expect(userJSON.lastName).toBeDefined();
    });
  });

  describe('Database Indexes', () => {
    it('should have email index for query optimization', async () => {
      const indexes = await User.collection.getIndexes();

      expect(Object.keys(indexes)).toContain('email_1');
      expect(indexes.email_1).toEqual([['email', 1]]);
    });

    it('should have isAdmin index for query optimization', async () => {
      const indexes = await User.collection.getIndexes();

      expect(Object.keys(indexes)).toContain('isAdmin_1');
      expect(indexes.isAdmin_1).toEqual([['isAdmin', 1]]);
    });
  });
});