import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Self-healing: ensure unique indexes on users collection are sparse
    // so accounts created without email (e.g. POS customers) do not collide on null
    try {
      const collection = conn.connection.collection('users');
      const indexes = await collection.indexes();
      for (const name of ['email_1', 'phone_1']) {
        const existing = indexes.find((i) => i.name === name);
        if (existing && existing.unique && !existing.sparse) {
          console.warn(`[DB Migration] Dropping non-sparse index ${name}...`);
          await collection.dropIndex(name);
          const field = name.replace('_1', '');
          await collection.createIndex({ [field]: 1 }, { unique: true, sparse: true });
          console.log(`[DB Migration] Rebuilt ${name} as sparse unique index.`);
        }
      }
    } catch {
      // Non-fatal if collection doesn't exist yet
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
