import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables. When using dotenv-vault, calling config() again
// after DOTENV_KEY is loaded ensures secrets from .env.vault are decrypted.
dotenv.config();
if (!process.env.NEXT_PUBLIC_MONGO_URI && process.env.DOTENV_KEY) {
    dotenv.config();
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const DBInstance = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!process.env.NEXT_PUBLIC_MONGO_URI && process.env.DOTENV_KEY) {
            dotenv.config();
        }

        const mongoUri = process.env.NEXT_PUBLIC_MONGO_URI;
        const dbName = process.env.NEXT_PUBLIC_DB_NAME;

        if (!mongoUri) {
            console.error(
                "❌ Could not connect to MongoDB: NEXT_PUBLIC_MONGO_URI is undefined"
            );
            throw new Error(
                "NEXT_PUBLIC_MONGO_URI environment variable is not defined"
            );
        }

        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: dbName || undefined
        };

        cached.promise = mongoose
            .connect(mongoUri, opts)
            .then((mongooseInstance) => {
                console.log(`✅ Connected to MongoDB: ${dbName || "default"}`);
                return mongooseInstance;
            })
            .catch((err) => {
                cached.promise = null;
                console.error("❌ Could not connect to MongoDB\n", err.message);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default DBInstance;
