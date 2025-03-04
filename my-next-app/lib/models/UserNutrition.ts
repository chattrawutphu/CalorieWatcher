import mongoose, { Schema, models } from "mongoose";

// Food item schema
const FoodItemSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  calories: { 
    type: Number, 
    required: true 
  },
  protein: { 
    type: Number, 
    default: 0 
  },
  fat: { 
    type: Number, 
    default: 0 
  },
  carbs: { 
    type: Number, 
    default: 0 
  },
  servingSize: { 
    type: String,
    default: "1 serving"
  },
  favorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Daily log schema
const DailyLogSchema = new Schema({
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  foodItems: [
    {
      foodItem: {
        type: Schema.Types.ObjectId,
        ref: "FoodItem"
      },
      quantity: {
        type: Number,
        default: 1
      },
      mealType: {
        type: String,
        enum: ["breakfast", "lunch", "dinner", "snack"],
        default: "snack"
      }
    }
  ],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  }
});

// User nutrition profile schema
const UserNutritionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  macroRatios: {
    protein: {
      type: Number,
      default: 30 // percentage
    },
    fat: {
      type: Number,
      default: 30 // percentage
    },
    carbs: {
      type: Number,
      default: 40 // percentage
    }
  },
  favoriteFood: [FoodItemSchema],
  dailyLogs: [DailyLogSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create or use existing models
export const UserNutrition = models.UserNutrition || mongoose.model("UserNutrition", UserNutritionSchema);
export const FoodItem = models.FoodItem || mongoose.model("FoodItem", FoodItemSchema);
export const DailyLog = models.DailyLog || mongoose.model("DailyLog", DailyLogSchema); 