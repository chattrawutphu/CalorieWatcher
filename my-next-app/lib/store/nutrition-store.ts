import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

// Food template เป็นต้นแบบสำหรับสร้างอาหาร (เดิมคือ FoodItem)
export interface FoodTemplate {
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
  // Indicate that this is a template
  isTemplate: boolean;
}

// Instance of food that is created from template or other sources
// This is what gets recorded in meal entries
export interface MealFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other';
  // Optional fields
  usdaId?: number;
  brandName?: string;
  ingredients?: string;
  // Reference to the template it was created from (if any)
  templateId?: string;
  // When this food item was created
  recordedAt: Date;
}

// FoodItem type for backward compatibility and union type
export type FoodItem = FoodTemplate | MealFoodItem;

// Helper function to determine if a FoodItem is a template
export function isTemplate(food: FoodItem): food is FoodTemplate {
  return 'isTemplate' in food && food.isTemplate === true;
}

// Helper function to determine if a FoodItem is a meal food item
export function isMealFoodItem(food: FoodItem): food is MealFoodItem {
  return 'recordedAt' in food && !('isTemplate' in food);
}

export interface MealEntry {
  id: string;
  foodItem: MealFoodItem; // Now explicitly uses MealFoodItem
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
  weight?: number; // Target weight in kg
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
  weight?: number; // Weight in kg
}

export interface WeightEntry {
  date: string;
  weight: number; // Weight in kg
  note?: string; // Optional note about the weight entry
}

export interface WaterEntry {
  amount: number; // มิลลิลิตร (ml)
  timestamp: string;
}

interface NutritionState {
  // User settings
  goals: NutritionGoals;
  foodTemplates: FoodTemplate[]; // Renamed from favoriteFoods to foodTemplates
  dailyLogs: Record<string, DailyLog>; // indexed by date string
  weightHistory: WeightEntry[]; // Array of weight entries
  
  // Current day tracking
  currentDate: string; // ISO string for the currently selected date
  
  // Syncing state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initializeData: () => Promise<void>;
  syncData: () => Promise<void>;
  
  // Template management
  addFoodTemplate: (template: FoodTemplate) => Promise<void>;
  updateFoodTemplate: (templateId: string, updates: Partial<FoodTemplate>) => Promise<void>;
  removeFoodTemplate: (templateId: string) => Promise<void>;
  
  // Meal management
  createMealItemFromTemplate: (templateId: string, overrides?: Partial<MealFoodItem>) => MealFoodItem | null;
  createMealFoodFromScratch: (foodData: Omit<MealFoodItem, 'id' | 'recordedAt'>) => MealFoodItem;
  addMeal: (meal: MealEntry) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateMealEntry: (entryId: string, updates: Partial<MealEntry>) => Promise<void>;
  
  // Legacy methods for backward compatibility
  addFavoriteFood: (food: FoodItem) => Promise<void>;
  removeFavoriteFood: (foodId: string) => Promise<void>;
  
  // Other methods
  setCurrentDate: (date: string) => void;
  updateGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateDailyMood: (date: string, moodRating: number, notes?: string) => Promise<void>;
  getMood: (date: string) => { moodRating?: number, notes?: string } | null;
  getDailyMood: () => { moodRating?: number, notes?: string } | null;
  addWaterIntake: (date: string, amount: number) => Promise<void>;
  resetWaterIntake: (date: string) => Promise<void>;
  getWaterIntake: (date: string) => number;
  getWaterGoal: () => number;
  
  // Weight tracking methods
  addWeightEntry: (entry: WeightEntry) => Promise<void>;
  updateWeightEntry: (date: string, weight: number, note?: string) => Promise<void>;
  getWeightEntry: (date: string) => WeightEntry | undefined;
  getWeightEntries: (limit?: number) => WeightEntry[];
  getWeightGoal: () => number | undefined;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      // Default state
      goals: {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 70,
        water: 2000,
        weight: 70 // Default target weight
      },
      foodTemplates: [], // เปลี่ยนชื่อจาก favoriteFoods เป็น foodTemplates
      dailyLogs: {},
      weightHistory: [],
      currentDate: new Date().toISOString().split('T')[0],
      isLoading: false,
      isInitialized: false,
      error: null,
      
      // Initialize data
      initializeData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // ตรวจสอบการ migration จาก favoriteFoods เป็น foodTemplates (ถ้าจำเป็น)
          set((state) => {
            // If this is a fresh install or we already migrated, do nothing
            if (state.foodTemplates.length > 0 || !('favoriteFoods' in state)) {
              return state;
            }
            
            // Migration needed - convert old favoriteFood to templates
            const oldFavoriteFoods = (state as any).favoriteFoods || [];
            const foodTemplates = oldFavoriteFoods.map((food: any) => ({
              ...food,
              isTemplate: true,
            }));
            
            return {
              ...state,
              foodTemplates,
            };
          });
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize nutrition data', error);
          set({ error: 'Failed to initialize data', isLoading: false });
        }
      },
      
      // Sync data with server (if needed)
      syncData: async () => {
        // Implementation depends on server sync requirements
        return Promise.resolve();
      },
      
      // Template management methods
      addFoodTemplate: async (template) => {
        set((state) => ({
          foodTemplates: [...state.foodTemplates, {
            ...template,
            isTemplate: true, // Ensure it's marked as a template
          }]
        }));
      },
      
      updateFoodTemplate: async (templateId, updates) => {
        set((state) => ({
          foodTemplates: state.foodTemplates.map(template =>
            template.id === templateId
              ? { ...template, ...updates, isTemplate: true }
              : template
          )
        }));
      },
      
      removeFoodTemplate: async (templateId) => {
        set((state) => ({
          foodTemplates: state.foodTemplates.filter(template => template.id !== templateId)
        }));
      },
      
      // Create food items from templates
      createMealItemFromTemplate: (templateId, overrides = {}) => {
        const { foodTemplates } = get();
        const template = foodTemplates.find(t => t.id === templateId);
        
        if (!template) return null;
        
        return {
          id: crypto.randomUUID(),
          name: template.name,
          calories: template.calories,
          protein: template.protein,
          carbs: template.carbs,
          fat: template.fat,
          servingSize: template.servingSize,
          category: template.category,
          usdaId: template.usdaId,
          brandName: template.brandName,
          ingredients: template.ingredients,
          templateId: template.id, // Reference to original template
          recordedAt: new Date(),
          ...overrides
        };
      },
      
      createMealFoodFromScratch: (foodData) => {
        return {
          id: crypto.randomUUID(),
          recordedAt: new Date(),
          ...foodData
        };
      },
      
      // Legacy methods for backward compatibility
      addFavoriteFood: async (food) => {
        // Convert FoodItem to FoodTemplate if necessary
        const template: FoodTemplate = {
          id: food.id || crypto.randomUUID(),
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          servingSize: food.servingSize,
          category: food.category,
          favorite: 'favorite' in food ? food.favorite : true,
          createdAt: 'createdAt' in food ? food.createdAt : new Date(),
          usdaId: 'usdaId' in food ? food.usdaId : undefined,
          brandName: 'brandName' in food ? food.brandName : undefined,
          ingredients: 'ingredients' in food ? food.ingredients : undefined,
          dataType: 'dataType' in food ? food.dataType : undefined,
          mealCategory: 'mealCategory' in food ? food.mealCategory : undefined,
          isTemplate: true,
        };
        
        get().addFoodTemplate(template);
      },
      
      removeFavoriteFood: async (foodId) => {
        get().removeFoodTemplate(foodId);
      },
      
      // Add a meal entry
      addMeal: async (meal) => {
        set((state) => {
          const { dailyLogs, currentDate } = state;
          const date = meal.date || currentDate;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0
          };
          
          // Ensure meal.foodItem is a MealFoodItem
          let mealFoodItem: MealFoodItem;
          if (isMealFoodItem(meal.foodItem)) {
            mealFoodItem = meal.foodItem;
          } else if (isTemplate(meal.foodItem)) {
            // Convert template to meal food item
            const template = meal.foodItem as FoodTemplate;
            mealFoodItem = {
              id: crypto.randomUUID(),
              name: template.name,
              calories: template.calories,
              protein: template.protein,
              carbs: template.carbs,
              fat: template.fat,
              servingSize: template.servingSize,
              category: template.category,
              usdaId: template.usdaId,
              brandName: template.brandName,
              ingredients: template.ingredients,
              templateId: template.id,
              recordedAt: new Date()
            };
          } else {
            // Legacy case - convert normal FoodItem to MealFoodItem
            const foodItem = meal.foodItem as any;
            mealFoodItem = {
              id: crypto.randomUUID(),
              name: foodItem.name,
              calories: foodItem.calories,
              protein: foodItem.protein,
              carbs: foodItem.carbs,
              fat: foodItem.fat,
              servingSize: foodItem.servingSize,
              category: foodItem.category,
              usdaId: foodItem.usdaId,
              brandName: foodItem.brandName,
              ingredients: foodItem.ingredients,
              recordedAt: new Date()
            };
          }
          
          // Create new meal entry with MealFoodItem
          const newMeal: MealEntry = {
            ...meal,
            foodItem: mealFoodItem
          };
          
          // Add meal to the day's log
          const updatedMeals = [...dayLog.meals, newMeal];
          
          // Calculate new totals
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
          
          // Create updated log
          const updatedLog = {
            ...dayLog,
            meals: updatedMeals,
            ...totals
          };
          
          // Return updated state
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
      },
      
      // ฟังก์ชั่นอื่นๆ ที่ไม่เกี่ยวกับการแก้ไขโครงสร้าง template ยังคงเหมือนเดิม...
      removeMeal: async (id) => {
        set((state) => {
          const { dailyLogs } = state;
          let updatedLogs = { ...dailyLogs };
          
          // Find the log containing this meal
          for (const dateString in dailyLogs) {
            const log = dailyLogs[dateString];
            const mealIndex = log.meals.findIndex((meal) => meal.id === id);
            
            if (mealIndex >= 0) {
              // Remove the meal
              const updatedMeals = log.meals.filter((_, index) => index !== mealIndex);
              
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
              updatedLogs[dateString] = {
                ...log,
                meals: updatedMeals,
                ...totals
              };
              
              break;
            }
          }
          
          return { dailyLogs: updatedLogs };
        });
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
      },
      
      setCurrentDate: (date) => {
        set({ currentDate: date });
      },
      
      updateGoals: async (goals) => {
        set((state) => ({
          goals: {
            ...state.goals,
            ...goals
          }
        }));
      },
      
      updateDailyMood: async (date, moodRating, notes) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0
          };
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            moodRating,
            notes
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
      },
      
      getMood: (date) => {
        const { dailyLogs } = get();
        const log = dailyLogs[date];
        
        if (!log) return null;
        
        return {
          moodRating: log.moodRating,
          notes: log.notes
        };
      },
      
      getDailyMood: () => {
        const { dailyLogs, currentDate } = get();
        const log = dailyLogs[currentDate];
        
        if (!log) return null;
        
        return {
          moodRating: log.moodRating,
          notes: log.notes
        };
      },
      
      addWaterIntake: async (date, amount) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get or create log for the day
          const dayLog = dailyLogs[date] || {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0
          };
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            waterIntake: dayLog.waterIntake + amount
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
      },
      
      resetWaterIntake: async (date) => {
        set((state) => {
          const { dailyLogs } = state;
          
          // Get log for the day
          const dayLog = dailyLogs[date];
          
          // If no log, no need to update
          if (!dayLog) return state;
          
          // Update the log
          const updatedLog = {
            ...dayLog,
            waterIntake: 0
          };
          
          return {
            dailyLogs: {
              ...dailyLogs,
              [date]: updatedLog
            }
          };
        });
      },
      
      getWaterIntake: (date) => {
        const { dailyLogs } = get();
        const log = dailyLogs[date];
        
        if (!log) return 0;
        
        return log.waterIntake;
      },
      
      getWaterGoal: () => {
        const { goals } = get();
        return goals.water;
      },
      
      // Weight tracking methods implementation
      addWeightEntry: async (entry: WeightEntry) => {
        const { weightHistory, dailyLogs } = get();
        
        // Update weight history
        const updatedWeightHistory = [...weightHistory];
        const existingEntryIndex = updatedWeightHistory.findIndex(e => e.date === entry.date);
        
        if (existingEntryIndex >= 0) {
          // Update existing entry
          updatedWeightHistory[existingEntryIndex] = entry;
        } else {
          // Add new entry
          updatedWeightHistory.push(entry);
        }
        
        // Sort by date (newest first)
        updatedWeightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Also update the daily log if it exists
        const updatedDailyLogs = { ...dailyLogs };
        if (updatedDailyLogs[entry.date]) {
          updatedDailyLogs[entry.date] = {
            ...updatedDailyLogs[entry.date],
            weight: entry.weight
          };
        } else {
          // Create a new daily log entry if one doesn't exist
          updatedDailyLogs[entry.date] = {
            date: entry.date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            waterIntake: 0,
            weight: entry.weight
          };
        }
        
        set({ weightHistory: updatedWeightHistory, dailyLogs: updatedDailyLogs });
      },
      
      updateWeightEntry: async (date: string, weight: number, note?: string) => {
        const entry: WeightEntry = { date, weight, note };
        return get().addWeightEntry(entry);
      },
      
      getWeightEntry: (date: string) => {
        const { weightHistory, dailyLogs } = get();
        
        // First check in weight history
        const entry = weightHistory.find(e => e.date === date);
        if (entry) return entry;
        
        // If not found in history but exists in daily log, create entry from daily log
        if (dailyLogs[date] && dailyLogs[date].weight) {
          return {
            date,
            weight: dailyLogs[date].weight as number
          };
        }
        
        return undefined;
      },
      
      getWeightEntries: (limit?: number) => {
        const { weightHistory } = get();
        // Return all entries sorted by date (newest first), or limit if specified
        const sortedEntries = [...weightHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        return limit ? sortedEntries.slice(0, limit) : sortedEntries;
      },
      
      getWeightGoal: () => {
        return get().goals.weight;
      }
    }),
    {
      name: 'nutrition-storage',
      // Exclude some heavy data from persistence if necessary
      partialize: (state) => ({
        goals: state.goals,
        foodTemplates: state.foodTemplates,
        dailyLogs: state.dailyLogs,
        currentDate: state.currentDate,
        isInitialized: state.isInitialized
      })
    }
  )
); 