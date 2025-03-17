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
  // USDA API related fields
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  dataType?: string;
  // New field for meal categorization
  mealCategory?: string;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
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
  
  // Syncing state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initializeData: () => Promise<void>;
  syncData: () => Promise<void>;
  addFavoriteFood: (food: FoodItem) => Promise<void>;
  removeFavoriteFood: (foodId: string) => Promise<void>;
  addMeal: (meal: MealEntry) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateMealEntry: (entryId: string, updates: Partial<MealEntry>) => Promise<void>;
  setCurrentDate: (date: string) => void;
  updateGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateDailyMood: (date: string, moodRating: number, notes?: string) => Promise<void>;
  getMood: (date: string) => { moodRating?: number, notes?: string } | null;
  getDailyMood: () => { moodRating?: number, notes?: string } | null;
  addWaterIntake: (date: string, amount: number) => Promise<void>;
  resetWaterIntake: (date: string) => Promise<void>;
  getWaterIntake: (date: string) => number;
  getWaterGoal: () => number;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      goals: {
        calories: 2000,
        protein: 120,
        carbs: 250,
        fat: 65,
        water: 2000, // กำหนดค่าเริ่มต้นเป็น 2000ml (2 ลิตร)
      },
      favoriteFoods: [],
      dailyLogs: {},
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      isLoading: false,
      isInitialized: false,
      error: null,
      
      // โหลดข้อมูลจาก API เมื่อเริ่มต้น
      initializeData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/nutrition');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch nutrition data');
          }
          
          const result = await response.json();
          if (result.success && result.data) {
            set({ 
              dailyLogs: result.data.dailyLogs || {},
              goals: result.data.goals || {
                calories: 2000,
                protein: 120,
                carbs: 250,
                fat: 65,
                water: 2000
              },
              favoriteFoods: result.data.favoriteFoods || [],
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error initializing nutrition data:', error);
          set({ error: error instanceof Error ? error.message : String(error) });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // บันทึกข้อมูลลง API
      syncData: async () => {
        const { dailyLogs, goals, favoriteFoods } = get();
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dailyLogs, goals, favoriteFoods })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to sync nutrition data');
          }
        } catch (error) {
          console.error('Error syncing nutrition data:', error);
          set({ error: error instanceof Error ? error.message : String(error) });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addFavoriteFood: async (food) => {
        set((state) => ({
          favoriteFoods: [...state.favoriteFoods, food],
        }));
        await get().syncData();
      },
      
      removeFavoriteFood: async (foodId) => {
        set((state) => ({
          favoriteFoods: state.favoriteFoods.filter((food) => food.id !== foodId),
        }));
        await get().syncData();
      },
      
      addMeal: async (meal) => {
        // อัพเดท state ก่อน
        set((state) => {
          const { dailyLogs } = state;
          
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
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [meal.date]: updatedDayLog,
            },
          };
        });
        
        // ส่งข้อมูลไปที่ API
        try {
          const response = await fetch('/api/nutrition/meal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meal)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add meal');
          }
          
          // Trigger a full data sync after successful meal addition to ensure data consistency
          await get().syncData();
        } catch (error) {
          console.error('Error adding meal to API:', error);
          // Try a full data sync as a fallback
          try {
            await get().syncData();
          } catch (syncError) {
            console.error('Fallback sync also failed:', syncError);
          }
        }
      },
      
      removeMeal: async (id) => {
        let dateFound = '';
        
        // อัพเดท state ก่อน
        set((state) => {
          const { dailyLogs, currentDate } = state;
          
          // Find which day has this meal
          for (const date in dailyLogs) {
            if (dailyLogs[date].meals.some(meal => meal.id === id)) {
              dateFound = date;
              break;
            }
          }
          
          if (!dateFound) return state; // No change if meal not found
          
          const dayLog = dailyLogs[dateFound];
          
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
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [dateFound]: updatedDayLog,
            },
          };
        });
        
        // ส่งคำขอลบไปที่ API
        if (dateFound) {
          try {
            const response = await fetch(`/api/nutrition/meal?id=${id}&date=${dateFound}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to remove meal');
            }
            
            // Trigger a full data sync after successfully removing a meal
            await get().syncData();
          } catch (error) {
            console.error('Error removing meal from API:', error);
            // Try a full data sync as a fallback
            try {
              await get().syncData();
            } catch (syncError) {
              console.error('Fallback sync also failed:', syncError);
            }
          }
        }
      },
      
      updateMealEntry: async (entryId, updates) => {
        let dateFound = '';
        let updatedMeal: MealEntry | null = null;
        
        // อัพเดท state ก่อน
        set((state) => {
          const { dailyLogs } = state;
          
          // Find the log containing this entry
          for (const dateString in dailyLogs) {
            const log = dailyLogs[dateString];
            const entryIndex = log.meals.findIndex((meal) => meal.id === entryId);
            
            if (entryIndex >= 0) {
              dateFound = dateString;
              
              // Update the entry
              const updatedMeals = [...log.meals];
              updatedMeals[entryIndex] = {
                ...updatedMeals[entryIndex],
                ...updates,
              };
              
              updatedMeal = updatedMeals[entryIndex];
              
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
              
              return {
                dailyLogs: {
                  ...dailyLogs,
                  [dateString]: updatedLog,
                },
              };
            }
          }
          
          return state; // No change if entry not found
        });
        
        // ถ้าพบมื้ออาหารที่ต้องการอัพเดท ให้ส่งข้อมูลไปที่ API
        if (dateFound && updatedMeal) {
          try {
            // ลบมื้อเดิมก่อน
            await fetch(`/api/nutrition/meal?id=${entryId}&date=${dateFound}`, {
              method: 'DELETE'
            });
            
            // เพิ่มมื้อใหม่
            await fetch('/api/nutrition/meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedMeal)
            });
          } catch (error) {
            console.error('Error updating meal in API:', error);
          }
        }
      },
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      updateGoals: async (newGoals) => {
        // อัพเดท state ก่อน
        set(state => ({
          goals: {
            ...state.goals,
            ...newGoals,
          },
        }));
        
        // ส่งข้อมูลไปที่ API
        try {
          const goals = get().goals;
          const response = await fetch('/api/nutrition/goals', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goals)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update goals');
          }
        } catch (error) {
          console.error('Error updating goals in API:', error);
        }
      },
      
      updateDailyMood: async (date, moodRating, notes) => {
        // อัพเดท state ก่อน
        set(state => {
          const { dailyLogs } = state;
          
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
          
          // Update the mood
          const updatedDayLog = {
            ...dayLog,
            moodRating,
            notes: notes || dayLog.notes,
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedDayLog,
            },
          };
        });
        
        // บันทึกข้อมูลลง API
        await get().syncData();
      },
      
      getMood: (date) => {
        const { dailyLogs } = get();
        const dayLog = dailyLogs[date];
        
        if (!dayLog) return null;
        
        return {
          moodRating: dayLog.moodRating,
          notes: dayLog.notes,
        };
      },
      
      getDailyMood: () => {
        const { dailyLogs, currentDate } = get();
        const dayLog = dailyLogs[currentDate];
        
        if (!dayLog) return null;
        
        return {
          moodRating: dayLog.moodRating,
          notes: dayLog.notes,
        };
      },
      
      addWaterIntake: async (date, amount) => {
        // อัพเดท state ก่อน
        set(state => {
          const { dailyLogs } = state;
          
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
          
          // Add water intake
          const updatedDayLog = {
            ...dayLog,
            waterIntake: dayLog.waterIntake + amount,
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedDayLog,
            },
          };
        });
        
        // ส่งข้อมูลไปที่ API
        try {
          const dailyLogs = get().dailyLogs;
          const waterIntake = dailyLogs[date]?.waterIntake || 0;
          
          const response = await fetch('/api/nutrition/water', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, waterIntake })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update water intake');
          }
          
          // Trigger a full data sync after successful water intake update
          await get().syncData();
        } catch (error) {
          console.error('Error updating water intake in API:', error);
          // Try a full data sync as a fallback
          try {
            await get().syncData();
          } catch (syncError) {
            console.error('Fallback sync also failed:', syncError);
          }
        }
      },
      
      resetWaterIntake: async (date) => {
        // อัพเดท state ก่อน
        set(state => {
          const { dailyLogs } = state;
          
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
          
          // Reset water intake
          const updatedDayLog = {
            ...dayLog,
            waterIntake: 0,
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedDayLog,
            },
          };
        });
        
        // ส่งข้อมูลไปที่ API
        try {
          const response = await fetch('/api/nutrition/water', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, waterIntake: 0 })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to reset water intake');
          }
          
          // Trigger a full data sync after successfully resetting water intake
          await get().syncData();
        } catch (error) {
          console.error('Error resetting water intake in API:', error);
          // Try a full data sync as a fallback
          try {
            await get().syncData();
          } catch (syncError) {
            console.error('Fallback sync also failed:', syncError);
          }
        }
      },
      
      getWaterIntake: (date) => {
        const { dailyLogs } = get();
        const dayLog = dailyLogs[date];
        
        if (!dayLog) return 0;
        
        return dayLog.waterIntake;
      },
      
      getWaterGoal: () => {
        const { goals } = get();
        return goals.water;
      },
    }),
    {
      name: 'nutrition-storage',
      // ใช้ local storage เป็นแค่ cache ชั่วคราวเท่านั้น จะโหลดข้อมูลหลักจาก API
      partialize: (state) => ({
        currentDate: state.currentDate,
      }),
    }
  )
); 