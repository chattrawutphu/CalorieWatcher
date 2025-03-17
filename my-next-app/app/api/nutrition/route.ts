import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { connectToDatabase } from '@/lib/mongoose';
import NutritionModel from '@/lib/models/nutrition';

// GET request เพื่อดึงข้อมูลโภชนาการทั้งหมดของผู้ใช้
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // เชื่อมต่อกับ MongoDB
    await connectToDatabase();

    // ค้นหาข้อมูลของผู้ใช้
    let nutritionData = await NutritionModel.findOne({ userId });

    // ถ้าไม่พบข้อมูล ให้สร้างข้อมูลเริ่มต้น
    if (!nutritionData) {
      nutritionData = new NutritionModel({
        userId,
        dailyLogs: {},
        goals: {
          calories: 2000,
          protein: 120,
          carbs: 250,
          fat: 65,
          water: 2000
        },
        favoriteFoods: []
      });
      await nutritionData.save();
    }

    // แปลง Map เป็น Object (JSON serializable)
    const responseData = {
      ...nutritionData.toObject(),
      dailyLogs: Object.fromEntries(
        nutritionData.dailyLogs instanceof Map
          ? nutritionData.dailyLogs.entries()
          : Object.entries(nutritionData.dailyLogs)
      )
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch nutrition data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST request เพื่อบันทึกข้อมูลโภชนาการของผู้ใช้
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();

    // เชื่อมต่อกับ MongoDB
    await connectToDatabase();

    // แปลง object เป็น Map ถ้าจำเป็น
    const nutritionData = {
      ...data,
      userId,
      dailyLogs: new Map(Object.entries(data.dailyLogs || {}))
    };

    // บันทึกข้อมูลโดยใช้ upsert
    await NutritionModel.findOneAndUpdate(
      { userId },
      nutritionData,
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving nutrition data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save nutrition data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 