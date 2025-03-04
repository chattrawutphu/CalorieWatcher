import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  favorite: boolean;
  createdAt: Date;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface NutritionGoals {
  dailyCalorieGoal: number;
  macroRatios: {
    protein: number; // percentage
    fat: number; // percentage
    carbs: number; // percentage
  };
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

interface NutritionState {
  // User settings
  goals: NutritionGoals;
  favoriteFoods: FoodItem[];
  dailyLogs: Record<string, DailyLog>; // indexed by date string
  
  // Current day tracking
  currentDate: string; // ISO string for the currently selected date
  
  // Actions
  setGoals: (goals: NutritionGoals) => void;
  addFavoriteFood: (food: FoodItem) => void;
  removeFavoriteFood: (foodId: string) => void;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  updateMealEntry: (entryId: string, updates: Partial<MealEntry>) => void;
  setCurrentDate: (date: string) => void;
  updateGoals: (goals: Partial<NutritionGoals>) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      goals: {
        dailyCalorieGoal: 2000,
        macroRatios: {
          protein: 30,
          fat: 30,
          carbs: 40,
        },
      },
      favoriteFoods: [],
      dailyLogs: {},
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      
      setGoals: (goals) => set({ goals }),
      
      addFavoriteFood: (food) => set((state) => ({
        favoriteFoods: [...state.favoriteFoods, food],
      })),
      
      removeFavoriteFood: (foodId) => set((state) => ({
        favoriteFoods: state.favoriteFoods.filter((food) => food.id !== foodId),
      })),
      
      addMeal: (meal) => {
        const { dailyLogs, currentDate } = get();
        
        // Get the current day's log or create a new one
        const dayLog = dailyLogs[meal.date] || {
          date: meal.date,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
        };
        
        // Add the new meal
        const updatedMeals = [...dayLog.meals, meal];
        
        // Calculate totals
        const totalCalories = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.calories * meal.quantity, 
          0
        );
        
        const totalProtein = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.protein * meal.quantity, 
          0
        );
        
        const totalCarbs = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.carbs * meal.quantity, 
          0
        );
        
        const totalFat = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.fat * meal.quantity, 
          0
        );
        
        // Update the daily log
        const updatedDayLog = {
          ...dayLog,
          meals: updatedMeals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        };
        
        set({
          dailyLogs: {
            ...dailyLogs,
            [meal.date]: updatedDayLog,
          },
        });
      },
      
      removeMeal: (id) => {
        const { dailyLogs, currentDate } = get();
        
        // Get the current day's log
        const dayLog = dailyLogs[currentDate];
        
        if (!dayLog) return;
        
        // Remove the meal
        const updatedMeals = dayLog.meals.filter(meal => meal.id !== id);
        
        // Calculate totals
        const totalCalories = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.calories * meal.quantity, 
          0
        );
        
        const totalProtein = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.protein * meal.quantity, 
          0
        );
        
        const totalCarbs = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.carbs * meal.quantity, 
          0
        );
        
        const totalFat = updatedMeals.reduce(
          (sum, meal) => sum + meal.foodItem.fat * meal.quantity, 
          0
        );
        
        // Update the daily log
        const updatedDayLog = {
          ...dayLog,
          meals: updatedMeals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        };
        
        set({
          dailyLogs: {
            ...dailyLogs,
            [currentDate]: updatedDayLog,
          },
        });
      },
      
      updateMealEntry: (entryId, updates) => {
        const { dailyLogs } = get();
        
        // Find the log containing this entry
        for (const dateString in dailyLogs) {
          const log = dailyLogs[dateString];
          const entryIndex = log.meals.findIndex((meal) => meal.id === entryId);
          
          if (entryIndex >= 0) {
            // Update the entry
            const updatedMeals = [...log.meals];
            updatedMeals[entryIndex] = {
              ...updatedMeals[entryIndex],
              ...updates,
            };
            
            // Recalculate totals
            const totals = updatedMeals.reduce(
              (acc, meal) => {
                const quantity = meal.quantity;
                acc.totalCalories += meal.foodItem.calories * quantity;
                acc.totalProtein += meal.foodItem.protein * quantity;
                acc.totalFat += meal.foodItem.fat * quantity;
                acc.totalCarbs += meal.foodItem.carbs * quantity;
                return acc;
              },
              { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
            );
            
            // Update the log
            const updatedLog = {
              ...log,
              meals: updatedMeals,
              ...totals,
            };
            
            set({
              dailyLogs: {
                ...dailyLogs,
                [dateString]: updatedLog,
              },
            });
            
            break;
          }
        }
      },
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      updateGoals: (newGoals) => {
        set({
          goals: {
            ...get().goals,
            ...newGoals,
          },
        });
      },
    }),
    {
      name: 'nutrition-storage',
    }
  )
); 