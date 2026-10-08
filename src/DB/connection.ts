import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
}
