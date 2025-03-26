// Minimal version to pass build
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

export interface INutritionData {
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

// Export a dummy model - this will be replaced at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NutritionModel: any = {};

export default NutritionModel; 