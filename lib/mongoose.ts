import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    throw new Error("MongoDB URL not found");
  }

  // Bağlantı zaten aktifse ve bağlıysa, tekrar bağlanmaya gerek yok
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // Eğer bağlantı kopmuşsa, isConnected'ı false yap
  if (mongoose.connection.readyState === 0) {
    isConnected = false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000, // 30 saniye timeout
      socketTimeoutMS: 45000, // 45 saniye socket timeout
    });
    
    isConnected = true;
    console.log("MongoDB connected");
    
    // Bağlantı hatalarını dinle
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
