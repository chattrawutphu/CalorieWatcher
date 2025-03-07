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
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
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
  waterGoal: number; // มิลลิลิตร (ml)
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  moodRating?: number; // 1-5 rating (1:worst, 5:best)
  notes?: string;
  waterIntake: number; // มิลลิลิตร (ml)
}

export interface WaterEntry {
  amount: number; // มิลลิลิตร (ml)
  timestamp: string;
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
  updateDailyMood: (date: string, moodRating: number, notes?: string) => void;
  getMood: (date: string) => { moodRating?: number, notes?: string } | null;
  getDailyMood: () => { moodRating?: number, notes?: string } | null;
  addWaterIntake: (date: string, amount: number) => void;
  resetWaterIntake: (date: string) => void;
  setWaterGoal: (goal: number) => void;
  getWaterIntake: (date: string) => number;
  getWaterGoal: () => number;
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
        waterGoal: 2000, // กำหนดค่าเริ่มต้นเป็น 2000ml (2 ลิตร)
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
          waterIntake: 0,
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
          waterIntake: dayLog.waterIntake,
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
          waterIntake: dayLog.waterIntake,
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
              waterIntake: log.waterIntake,
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
      
      updateDailyMood: (date, moodRating, notes) => {
        const { dailyLogs } = get();
        
        // Get the current day's log or create a new one
        const dayLog = dailyLogs[date] || {
          date,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          waterIntake: 0,
        };
        
        // Update mood data
        const updatedDayLog = {
          ...dayLog,
          moodRating,
          notes: notes || dayLog.notes,
          waterIntake: dayLog.waterIntake,
        };
        
        set({
          dailyLogs: {
            ...dailyLogs,
            [date]: updatedDayLog,
          },
        });
      },
      
      getMood: (date) => {
        const currentLog = get().dailyLogs[date];
        if (!currentLog) return null;
        return { 
          moodRating: currentLog.moodRating,
          notes: currentLog.notes 
        };
      },
      
      getDailyMood: () => {
        const currentLog = get().dailyLogs[get().currentDate];
        if (!currentLog) return null;
        return { 
          moodRating: currentLog.moodRating,
          notes: currentLog.notes 
        };
      },
      
      addWaterIntake: (date, amount) => {
        set((state) => {
          // ตรวจสอบว่ามี log ของวันนี้หรือไม่ ถ้าไม่มีให้สร้างใหม่
          const dayLog = state.dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            waterIntake: 0,
          };

          // เพิ่มปริมาณน้ำที่ดื่ม
          const newWaterIntake = (dayLog.waterIntake || 0) + amount;

          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...dayLog,
                waterIntake: newWaterIntake
              }
            }
          };
        });
      },
      
      resetWaterIntake: (date) => {
        set((state) => {
          const dayLog = state.dailyLogs[date];
          if (!dayLog) return state;

          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: {
                ...dayLog,
                waterIntake: 0
              }
            }
          };
        });
      },
      
      setWaterGoal: (goal) => {
        set((state) => ({
          goals: {
            ...state.goals,
            waterGoal: goal
          }
        }));
      },
      
      getWaterIntake: (date) => {
        const dayLog = get().dailyLogs[date];
        return dayLog?.waterIntake || 0;
      },
      
      getWaterGoal: () => {
        const goal = get().goals.waterGoal;
        // ตรวจสอบค่า waterGoal ถ้าไม่มีค่าหรือเป็น 0 ให้คืนค่าเริ่มต้น 2000ml
        return goal && goal > 0 ? goal : 2000;
      },
    }),
    {
      name: 'nutrition-storage',
    }
  )
); 