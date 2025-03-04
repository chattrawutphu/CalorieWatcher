import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    // Test MongoDB native client connection
    const client = await clientPromise;
    const nativeDb = client.db("test");
    const nativeTestData = await nativeDb.command({ ping: 1 });

    // Test Mongoose connection
    const mongoose = await connectToDatabase();
    const connectionStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful",
      nativeClient: nativeTestData,
      mongoose: {
        status: connectionStatus,
        version: mongoose.version,
      }
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "MongoDB connection failed", 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 