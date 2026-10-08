import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./DB/connection";

dotenv.config({
  path: path.resolve("./config/.env"),
});

export async function bootStrap() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    }),
    express.json(),
    helmet(),
  );

  await connectDB();

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}
