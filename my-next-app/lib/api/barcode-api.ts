import { FoodItem } from "@/lib/store/nutrition-store";

// บาร์โค้ด mock database สำหรับเป็น fallback เมื่อไม่พบข้อมูลใน API
const barcodeMockDatabase: Record<string, Omit<FoodItem, 'id' | 'favorite' | 'createdAt'>> = {
  // มีอาหารตัวอย่างหลากหลายประเภทที่มีบาร์โค้ด
  "8851959131012": {
    name: "โคคา-โคล่า",
    calories: 42,
    protein: 0,
    fat: 0,
    carbs: 10.6,
    servingSize: "100ml",
    category: "beverage"
  },
  "8850329112224": {
    name: "มาม่า รสหมูสับ",
    calories: 320,
    protein: 7,
    fat: 12,
    carbs: 46,
    servingSize: "1 ซอง (60g)",
    category: "other"
  },
  "8858891302701": {
    name: "นมเปรี้ยวดัชมิลล์",
    calories: 72,
    protein: 1.7,
    fat: 0.8,
    carbs: 15.5,
    servingSize: "180ml",
    category: "dairy"
  },
  "8851959132316": {
    name: "สไปรท์",
    calories: 38,
    protein: 0,
    fat: 0,
    carbs: 9.5,
    servingSize: "100ml",
    category: "beverage"
  },
  "8851717200017": {
    name: "ลูกอมฮอลล์",
    calories: 26,
    protein: 0,
    fat: 0,
    carbs: 6.5,
    servingSize: "1 เม็ด",
    category: "snack"
  },
  "8850718801012": {
    name: "ขนมปังโฮลวีท ฟาร์มเฮ้าส์",
    calories: 216,
    protein: 10,
    fat: 3.2,
    carbs: 39,
    servingSize: "1 แพ็ค (4 แผ่น)",
    category: "grain"
  },
  "8888077118133": {
    name: "มันฝรั่งทอด เลย์รสโนริสาหร่าย",
    calories: 536,
    protein: 6.2,
    fat: 32,
    carbs: 52,
    servingSize: "100g",
    category: "snack"
  },
  "8851123341022": {
    name: "นมถั่วเหลือง ไวตามิ้ลค์",
    calories: 60,
    protein: 3,
    fat: 1.5,
    carbs: 9,
    servingSize: "180ml",
    category: "beverage"
  }
};

// Open Food Facts API response interface
interface OpenFoodFactsResponse {
  status: number;
  product: {
    product_name?: string;
    product_name_th?: string;
    nutriments?: {
      energy_kcal_100g?: number;
      proteins_100g?: number;
      fat_100g?: number;
      carbohydrates_100g?: number;
    };
    quantity?: string;
    serving_size?: string;
    categories_tags?: string[];
  };
}

/**
 * Map category from Open Food Facts to our app categories
 */
function mapCategory(categories: string[] = []): 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other' {
  const categoryMap: Record<string, 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'snack' | 'beverage' | 'other'> = {
    'en:beverages': 'beverage',
    'en:plant-based-foods-and-beverages': 'vegetable',
    'en:plant-based-foods': 'vegetable',
    'en:fruits': 'fruit',
    'en:cereals-and-potatoes': 'grain',
    'en:breads': 'grain',
    'en:dairy': 'dairy',
    'en:milk': 'dairy',
    'en:yogurts': 'dairy',
    'en:meats': 'protein',
    'en:seafood': 'protein',
    'en:eggs': 'protein',
    'en:snacks': 'snack',
    'en:desserts': 'snack',
    'en:sweet-snacks': 'snack',
    'en:salty-snacks': 'snack',
    'en:chocolates': 'snack',
    'en:cakes': 'snack',
    'en:biscuits-and-cakes': 'snack',
    'en:candies': 'snack'
  };

  // Find the first matching category
  for (const category of categories) {
    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.includes(key)) {
        return value;
      }
    }
  }

  return 'other';
}

/**
 * ค้นหาข้อมูลอาหารจากบาร์โค้ดโดยใช้ Open Food Facts API
 * @param barcode - บาร์โค้ดที่ต้องการค้นหา
 * @returns ข้อมูลอาหาร หรือ null ถ้าไม่พบ
 */
export async function getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    // ค้นหาข้อมูลจาก Open Food Facts API
    console.log(`Fetching data for barcode: ${barcode}`);
    
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data: OpenFoodFactsResponse = await response.json();
    
    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      // ถ้ามีข้อมูลโภชนาการ
      if (product.nutriments) {
        // ใช้ชื่อภาษาไทยถ้ามี หรือไม่ก็ใช้ชื่อปกติ
        const productName = product.product_name_th || product.product_name || 'Unknown Product';
        
        // ข้อมูลโภชนาการต่อ 100g
        const calories = product.nutriments.energy_kcal_100g || 0;
        const protein = product.nutriments.proteins_100g || 0;
        const fat = product.nutriments.fat_100g || 0;
        const carbs = product.nutriments.carbohydrates_100g || 0;
        
        // ขนาดบริการ (serving size)
        const servingSize = product.serving_size || product.quantity || '100g';
        
        // หมวดหมู่อาหาร
        const category = mapCategory(product.categories_tags);
        
        // สร้าง FoodItem
        return {
          id: crypto.randomUUID(),
          name: productName,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          servingSize: servingSize,
          favorite: false,
          createdAt: new Date(),
          category: category
        };
      }
    }
    
    // ถ้าไม่พบข้อมูลจาก API ให้ตรวจสอบใน mock database
    console.log('Product not found in API, checking mock database');
    if (barcode in barcodeMockDatabase) {
      const foodData = barcodeMockDatabase[barcode];
      
      return {
        id: crypto.randomUUID(),
        favorite: false,
        createdAt: new Date(),
        ...foodData
      };
    }
    
    // ถ้าไม่พบข้อมูลทั้งจาก API และ mock database
    return null;
  } catch (error) {
    console.error("Error fetching food data from barcode:", error);
    
    // ถ้าเกิดข้อผิดพลาด ให้ตรวจสอบใน mock database
    if (barcode in barcodeMockDatabase) {
      const foodData = barcodeMockDatabase[barcode];
      
      return {
        id: crypto.randomUUID(),
        favorite: false,
        createdAt: new Date(),
        ...foodData
      };
    }
    
    return null;
  }
}

/**
 * เช็คว่าเป็นบาร์โค้ดที่ถูกต้องหรือไม่ 
 * (อย่างง่าย - ตัวเลขอย่างน้อย 8 หลักขึ้นไป)
 */
export function isValidBarcode(barcode: string): boolean {
  // บาร์โค้ดต้องมีตัวเลขอย่างน้อย 8 หลักขึ้นไป
  const barcodePattern = /^\d{8,14}$/;
  return barcodePattern.test(barcode);
} 