import mongoose, { Schema, Document, Model } from 'mongoose';

// กำหนด Interfaces
export interface IFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  favorite: boolean;
  createdAt: Date;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  dataType?: string;
  mealCategory?: string;
}

export interface IMealEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: IFoodItem;
  quantity: number;
  date: string;
}

export interface IDailyLog {
  date: string;
  meals: IMealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  moodRating?: number;
  notes?: string;
}

export interface INutritionData extends Document {
  userId: string;
  dailyLogs: Record<string, IDailyLog>;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  favoriteFoods: IFoodItem[];
}

// กำหนด Schema
const FoodItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  servingSize: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  category: { 
    type: String, 
    enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'snack', 'beverage', 'other'],
    default: 'other'
  },
  usdaId: Number,
  brandName: String,
  ingredients: String,
  dataType: String,
  mealCategory: String
}, { _id: false });

const MealEntrySchema = new Schema({
  id: { type: String, required: true },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
  foodItem: { type: FoodItemSchema, required: true },
  quantity: { type: Number, required: true },
  date: { type: String, required: true }
}, { _id: false });

const DailyLogSchema = new Schema({
  date: { type: String, required: true },
  meals: [MealEntrySchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 },
  moodRating: Number,
  notes: String
}, { _id: false });

const NutritionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  dailyLogs: { type: Map, of: DailyLogSchema, default: {} },
  goals: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 65 },
    water: { type: Number, default: 2000 }
  },
  favoriteFoods: [FoodItemSchema]
}, { timestamps: true });

// สร้าง Model หรือรับ Model ที่มีอยู่แล้ว
let NutritionModel: Model<INutritionData>;

try {
  // ถ้า Model มีอยู่แล้ว
  NutritionModel = mongoose.model<INutritionData>('Nutrition');
} catch (error) {
  // ถ้ายังไม่มี Model
  NutritionModel = mongoose.model<INutritionData>('Nutrition', NutritionSchema);
}

export default NutritionModel; 