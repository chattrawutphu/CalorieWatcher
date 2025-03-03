import { writable, derived } from 'svelte/store';

// สร้าง local storage helpers
const storageAvailable = (type) => {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

const getFromStorage = (key, defaultValue) => {
  if (storageAvailable('localStorage')) {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  }
  return defaultValue;
};

const saveToStorage = (key, value) => {
  if (storageAvailable('localStorage')) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// เป้าหมายแคลอรี่และการตั้งค่าต่างๆ
export const settings = writable(getFromStorage('calorieWatcher_settings', {
  calorieGoal: 1800,
  macroSplit: {
    protein: 30,
    fat: 30, 
    carbs: 40
  },
  language: 'th'
}));

// ติดตามการเปลี่ยนแปลงและบันทึกการตั้งค่า
settings.subscribe(value => {
  saveToStorage('calorieWatcher_settings', value);
});

// บันทึกอาหารตามวันที่
export const foodLogs = writable(getFromStorage('calorieWatcher_foodLogs', {}));

// ติดตามการเปลี่ยนแปลงและบันทึกข้อมูลอาหาร
foodLogs.subscribe(value => {
  saveToStorage('calorieWatcher_foodLogs', value);
});

// รายการอาหารโปรด
export const favorites = writable(getFromStorage('calorieWatcher_favorites', []));

// ติดตามการเปลี่ยนแปลงและบันทึกอาหารโปรด
favorites.subscribe(value => {
  saveToStorage('calorieWatcher_favorites', value);
});

// ฟังก์ชั่นเพิ่มอาหารในบันทึกประจำวัน
export function addFoodToLog(date, meal, food) {
  foodLogs.update(logs => {
    if (!logs[date]) {
      logs[date] = {};
    }
    if (!logs[date][meal]) {
      logs[date][meal] = [];
    }
    logs[date][meal] = [...logs[date][meal], { ...food, id: Date.now() }];
    return logs;
  });
}

// ฟังก์ชั่นลบอาหารจากบันทึก
export function removeFoodFromLog(date, meal, foodId) {
  foodLogs.update(logs => {
    if (logs[date] && logs[date][meal]) {
      logs[date][meal] = logs[date][meal].filter(item => item.id !== foodId);
    }
    return logs;
  });
}

// ฟังก์ชั่นเพิ่มอาหารในรายการโปรด
export function addToFavorites(food) {
  favorites.update(items => {
    // ตรวจสอบว่าอาหารนี้อยู่ในรายการโปรดแล้วหรือไม่
    const exists = items.some(item => item.name === food.name);
    if (!exists) {
      return [...items, { ...food, id: Date.now() }];
    }
    return items;
  });
}

// ฟังก์ชั่นลบอาหารจากรายการโปรด
export function removeFromFavorites(foodId) {
  favorites.update(items => items.filter(item => item.id !== foodId));
}

// คำนวณปริมาณแคลอรี่ที่บริโภคในแต่ละวัน
export function getDailyCalories(date) {
  let total = 0;
  foodLogs.subscribe(logs => {
    if (logs[date]) {
      Object.values(logs[date]).forEach(mealItems => {
        mealItems.forEach(item => {
          total += item.calories;
        });
      });
    }
  })();
  return total;
}

// คำนวณปริมาณสารอาหารที่บริโภคในแต่ละวัน
export function getDailyMacros(date) {
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  
  foodLogs.subscribe(logs => {
    if (logs[date]) {
      Object.values(logs[date]).forEach(mealItems => {
        mealItems.forEach(item => {
          protein += item.protein || 0;
          fat += item.fat || 0;
          carbs += item.carbs || 0;
        });
      });
    }
  })();
  
  return { protein, fat, carbs };
} 