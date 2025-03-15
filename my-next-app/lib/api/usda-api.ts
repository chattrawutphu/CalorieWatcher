// USDA FoodData Central API Service
// ต้องการ API key จาก https://fdc.nal.usda.gov/api-key-signup.html

import { FoodItem } from '@/lib/store/nutrition-store';

// ตัวอย่าง API key - ในการใช้งานจริงควรเก็บใน env variables
const API_KEY = 'mLcBnM4rro9dlGOkdLuCRBlmMyh7hv7oaGSmUFRx'; 
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// ประเภทอาหารที่ USDA สนับสนุน
export enum FoodCategory {
  FOUNDATION = 'Foundation',
  SURVEY = 'Survey (FNDDS)',
  BRANDED = 'Branded',
  SR_LEGACY = 'SR Legacy',
  EXPERIMENTAL = 'Experimental',
}

// อินเตอร์เฟซสำหรับการค้นหา
export interface FoodSearchCriteria {
  query: string;
  dataType?: string[]; // เช่น ['Foundation', 'SR Legacy']
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  brandOwner?: string;
  requireAllWords?: boolean;
}

// อินเตอร์เฟซสำหรับกลุ่มอาหาร
export interface FoodGroup {
  id: number;
  name: string;
  description?: string;
}

// อินเตอร์เฟซสำหรับข้อมูลอาหาร
export interface USDAFoodItem {
  fdcId: number;
  description: string;
  lowercaseDescription?: string;
  dataType?: string;
  publicationDate?: string;
  foodCategory?: string;
  nutrients?: {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }[];
  servingSize?: number;
  servingSizeUnit?: string;
  brandName?: string;
  ingredients?: string;
}

// แปลงจาก USDA Format เป็น Format ที่แอพใช้
export function convertToAppFoodItem(usdaFood: USDAFoodItem): FoodItem {
  // หาค่าโภชนาการหลักจาก nutrients
  const findNutrient = (names: string[], nutrientIds?: number[]) => {
    // ลองค้นหาด้วย nutrient ID ก่อน (แม่นยำกว่า)
    if (nutrientIds && usdaFood.nutrients) {
      for (const id of nutrientIds) {
        const nutrient = usdaFood.nutrients.find(n => n.nutrientId === id);
        if (nutrient) return nutrient.value;
      }
    }
    
    // ถ้าไม่พบด้วย ID ให้ลองค้นหาด้วยชื่อ (มีหลายชื่อที่อาจใช้)
    if (usdaFood.nutrients) {
      for (const name of names) {
        const nutrient = usdaFood.nutrients.find(n => 
          n.nutrientName.toLowerCase().includes(name.toLowerCase())
        );
        if (nutrient) return nutrient.value;
      }
    }
    
    return 0;
  };

  // ค้นหาค่าโภชนาการหลักด้วยชื่อที่หลากหลายและ ID ที่ถูกต้อง
  // USDA nutrient IDs: 
  // 208 = Energy (kcal)
  // 203 = Protein (g)
  // 205 = Carbohydrate (g)
  // 204 = Total fat (g)
  const calories = findNutrient(['energy', 'calorie', 'calories', 'kcal'], [208]);
  const protein = findNutrient(['protein'], [203]);
  const carbs = findNutrient(['carbohydrate', 'carbs', 'carbohydrates', 'total carbohydrate'], [205]);
  const fat = findNutrient(['fat', 'total fat', 'lipid'], [204]);
  
  // Log values for debugging
  console.log('Nutrient values found:', { 
    name: usdaFood.description,
    calories, protein, carbs, fat,
    hasNutrients: !!usdaFood.nutrients,
    nutrientCount: usdaFood.nutrients?.length || 0
  });
  
  // กำหนดขนาดเสิร์ฟ
  const servingSize = usdaFood.servingSize 
    ? `${usdaFood.servingSize} ${usdaFood.servingSizeUnit || 'g'}`
    : '100 g';

  return {
    id: usdaFood.fdcId.toString(),
    name: usdaFood.description,
    calories: calories || 0,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    servingSize: servingSize,
    category: (usdaFood.foodCategory?.toLowerCase() || 'other') as any,
    favorite: false,
    createdAt: new Date(),
    usdaId: usdaFood.fdcId,
    brandName: usdaFood.brandName,
    ingredients: usdaFood.ingredients,
    dataType: usdaFood.dataType
  };
}

// ฟังก์ชันสำหรับค้นหาอาหาร
export async function searchFoods(criteria: FoodSearchCriteria): Promise<USDAFoodItem[]> {
  try {
    // กำหนด dataType เพื่อการค้นหาที่เหมาะสม ให้เน้นวัตถุดิบพื้นฐานก่อน
    const defaultDataTypes = ['Foundation', 'SR Legacy', 'Experimental', 'Survey (FNDDS)', 'Branded'];
    
    // เพิ่มการตรวจสอบว่าต้องการค้นหาวัตถุดิบพื้นฐานหรือไม่
    let sortBy = criteria.sortBy;
    let dataType = criteria.dataType || defaultDataTypes;
    
    // เพิ่มพารามิเตอร์ให้ API
    const apiParams = {
      ...criteria,
      pageSize: criteria.pageSize || 25,
      pageNumber: criteria.pageNumber || 1,
      // ร้องขอค่าโภชนาการที่สำคัญเฉพาะ
      nutrients: [208, 203, 204, 205],
      dataType: dataType,
      sortBy: sortBy || 'dataType.keyword',  // เรียงตามประเภทข้อมูล เพื่อให้ Foundation มาก่อน
      sortOrder: criteria.sortOrder || 'asc'
    };
    
    // ถ้ากำลังค้นหาด้วยชื่อวัตถุดิบทั่วไป (เช่น broccoli, apple) ให้ปรับพารามิเตอร์
    if (criteria.query && /^[a-zA-Z]+$/.test(criteria.query.trim())) {
      const simpleIngredientSearch = criteria.query.trim().toLowerCase();
      const commonIngredients = ['broccoli', 'apple', 'banana', 'rice', 'potato', 'carrot', 'onion', 'beef', 'chicken', 'fish'];
      
      if (commonIngredients.includes(simpleIngredientSearch) || 
          commonIngredients.some(ing => simpleIngredientSearch.includes(ing))) {
        // น่าจะกำลังค้นหาวัตถุดิบพื้นฐาน ให้เน้น Foundation และ SR Legacy
        apiParams.dataType = ['Foundation', 'SR Legacy'];
      }
    }
    
    console.log('Search params:', { 
      query: criteria.query,
      dataType: apiParams.dataType,
      sortBy: apiParams.sortBy
    });

    const response = await fetch(`${BASE_URL}/foods/search?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiParams)
    });

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('USDA API response:', {
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      foodCount: data.foods?.length || 0,
      firstFoodSample: data.foods?.[0] ? {
        description: data.foods[0].description,
        dataType: data.foods[0].dataType,
        nutrients: data.foods[0].foodNutrients?.length || 0
      } : null
    });
    
    // ปรับปรุงข้อมูลในรูปแบบที่เหมาะกับแอพ
    const foods = data.foods || [];
    
    // แปลงฟิลด์ foodNutrients เป็น nutrients ที่เราใช้ในแอพ
    const mappedFoods = foods.map((food: any) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandName: food.brandOwner,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      // แปลง foodNutrients เป็นรูปแบบ nutrients ที่เราใช้
      nutrients: food.foodNutrients?.map((n: any) => ({
        nutrientId: n.nutrientId || n.nutrient?.id,
        nutrientName: n.nutrientName || n.nutrient?.name,
        unitName: n.unitName || n.nutrient?.unitName,
        value: n.value || 0
      })) || []
    }));
    
    // เรียงลำดับให้วัตถุดิบมาก่อนเสมอ (Foundation และ SR Legacy)
    const sortedFoods = [...mappedFoods].sort((a, b) => {
      // ให้ Foundation และ SR Legacy มาก่อน
      if (a.dataType === 'Foundation' && b.dataType !== 'Foundation') return -1;
      if (a.dataType !== 'Foundation' && b.dataType === 'Foundation') return 1;
      if (a.dataType === 'SR Legacy' && b.dataType !== 'SR Legacy' && b.dataType !== 'Foundation') return -1;
      if (a.dataType !== 'SR Legacy' && a.dataType !== 'Foundation' && b.dataType === 'SR Legacy') return 1;
      
      // ถ้าเป็นประเภทเดียวกัน ให้เรียงตามชื่อ
      return a.description.localeCompare(b.description);
    });
    
    return sortedFoods;
  } catch (error) {
    console.error('Error searching USDA foods:', error);
    return [];
  }
}

// ฟังก์ชันเพื่อดึงข้อมูลอาหารโดยละเอียดด้วย fdcId
export async function getFoodDetails(fdcId: number): Promise<USDAFoodItem | null> {
  try {
    // ขอข้อมูลโภชนาการหลัก - พลังงาน, โปรตีน, คาร์บ, ไขมัน
    const response = await fetch(
      `${BASE_URL}/food/${fdcId}?api_key=${API_KEY}&nutrients=208&nutrients=203&nutrients=204&nutrients=205`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const food = await response.json();
    
    // แปลงข้อมูลให้อยู่ในรูปแบบเดียวกับที่ใช้ในแอพ
    if (food.foodNutrients) {
      food.nutrients = food.foodNutrients.map((n: any) => ({
        nutrientId: n.nutrient?.id || n.nutrientId,
        nutrientName: n.nutrient?.name || n.nutrientName,
        unitName: n.nutrient?.unitName || n.unitName,
        value: n.amount || n.value || 0
      }));
    }
    
    // Log ข้อมูลเพื่อดูค่าโภชนาการ
    console.log('Food details retrieved:', {
      fdcId,
      description: food.description,
      nutrients: food.nutrients?.length || 0
    });
    
    return {
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      foodCategory: food.foodCategory,
      brandName: food.brandOwner || food.brandName,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      nutrients: food.nutrients || []
    };
  } catch (error) {
    console.error(`Error fetching food details for ID ${fdcId}:`, error);
    return null;
  }
}

// รายการหมวดหมู่อาหารหลัก
export const FOOD_CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'grains', name: 'Grains', emoji: '🌾' },
  { id: 'protein_foods', name: 'Protein Foods', emoji: '🥩' },
  { id: 'dairy', name: 'Dairy', emoji: '🧀' },
  { id: 'beverages', name: 'Beverages', emoji: '🍹' },
  { id: 'snacks', name: 'Snacks', emoji: '🍿' },
  { id: 'condiments', name: 'Condiments', emoji: '🧂' },
  { id: 'mixed_dishes', name: 'Mixed Dishes', emoji: '🍲' },
  { id: 'bakery', name: 'Bakery', emoji: '🍞' },
];

// แมปจาก USDA Categories เป็นหมวดหมู่ของเรา
export const USDA_CATEGORY_MAPPING: Record<string, string> = {
  'Vegetables and Vegetable Products': 'vegetables',
  'Fruits and Fruit Juices': 'fruits',
  'Grain Products': 'grains',
  'Cereal Grains and Pasta': 'grains',
  'Breakfast Cereals': 'grains',
  'Baked Products': 'bakery',
  'Meat, Poultry, Fish and Seafood': 'protein_foods',
  'Legumes and Legume Products': 'protein_foods',
  'Nut and Seed Products': 'protein_foods',
  'Beef Products': 'protein_foods',
  'Pork Products': 'protein_foods',
  'Poultry Products': 'protein_foods',
  'Lamb, Veal, and Game Products': 'protein_foods',
  'Sausages and Luncheon Meats': 'protein_foods',
  'Fish and Seafood Products': 'protein_foods',
  'Dairy and Egg Products': 'dairy',
  'Milk and Dairy Products': 'dairy',
  'Cheese Products': 'dairy',
  'Beverages': 'beverages',
  'Alcoholic Beverages': 'beverages',
  'Coffee and Tea': 'beverages',
  'Fats and Oils': 'condiments',
  'Soups, Sauces, and Gravies': 'condiments',
  'Spices and Herbs': 'condiments',
  'Snacks': 'snacks',
  'Fast Foods': 'mixed_dishes',
  'Mixed Dishes': 'mixed_dishes',
  'Restaurant Foods': 'mixed_dishes',
};

// ฟังก์ชันค้นหาอาหารในหมวดหมู่
export async function searchFoodsByCategory(category: string, pageNumber: number = 1, pageSize: number = 20): Promise<USDAFoodItem[]> {
  try {
    let searchTerms: string[] = [];
    
    // แมปหมวดหมู่ของเราเป็นคำค้นหาที่เกี่ยวข้อง
    switch (category) {
      case 'vegetables':
        searchTerms = ['vegetable', 'vegetables'];
        break;
      case 'fruits':
        searchTerms = ['fruit', 'fruits'];
        break;
      case 'grains':
        searchTerms = ['grain', 'cereal', 'pasta', 'rice', 'bread'];
        break;
      case 'protein_foods':
        searchTerms = ['meat', 'poultry', 'fish', 'seafood', 'beef', 'pork', 'chicken'];
        break;
      case 'dairy':
        searchTerms = ['dairy', 'milk', 'cheese', 'yogurt'];
        break;
      case 'beverages':
        searchTerms = ['beverage', 'drink', 'juice', 'water', 'coffee', 'tea'];
        break;
      case 'snacks':
        searchTerms = ['snack', 'chips', 'crackers', 'popcorn'];
        break;
      case 'condiments':
        searchTerms = ['condiment', 'sauce', 'spice', 'herb', 'oil'];
        break;
      case 'mixed_dishes':
        searchTerms = ['dish', 'meal', 'casserole', 'pizza', 'sandwich', 'soup'];
        break;
      case 'bakery':
        searchTerms = ['bread', 'bakery', 'cake', 'pastry', 'cookie'];
        break;
      default:
        searchTerms = [category];
    }
    
    // สร้างคำค้นหารวม
    const query = searchTerms.join(' OR ');
    
    // ค้นหาด้วย API - เน้นเรียงลำดับให้วัตถุดิบมาก่อน
    const foods = await searchFoods({
      query,
      pageNumber,
      pageSize,
      requireAllWords: false,
      dataType: ['Foundation', 'SR Legacy', 'Experimental', 'Survey (FNDDS)', 'Branded'],
      sortBy: 'dataType.keyword', // เรียงตามประเภทข้อมูล ให้ Foundation และ SR Legacy มาก่อน
      sortOrder: 'asc'
    });
    
    return foods;
  } catch (error) {
    console.error(`Error searching foods for category ${category}:`, error);
    return [];
  }
} 