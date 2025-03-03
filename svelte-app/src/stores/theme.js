import { writable } from 'svelte/store';

// ธีมที่รองรับ
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SUPERDARK: 'superdark',
  PINK: 'pink'
};

// เก็บรายชื่อธีมทั้งหมดเพื่อใช้ในการแสดงตัวเลือก
export const availableThemes = [
  { id: THEMES.LIGHT, name: 'lightTheme' },
  { id: THEMES.DARK, name: 'darkTheme' },
  { id: THEMES.SUPERDARK, name: 'superDarkTheme' },
  { id: THEMES.PINK, name: 'pinkTheme' }
];

// ฟังก์ชันเริ่มต้นเพื่อดึงธีมจาก LocalStorage หรือกำหนดเป็นค่าเริ่มต้น
function initTheme() {
  // ตรวจสอบว่ามีการบันทึกธีมไว้ใน LocalStorage หรือไม่
  const savedTheme = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('theme') 
    : null;
  
  // ตรวจสอบว่าธีมที่บันทึกเป็นธีมที่รองรับหรือไม่
  if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
    return savedTheme;
  }
  
  // ตรวจสอบโหมดของระบบ (dark/light) เพื่อเลือกธีมเริ่มต้นที่เหมาะสม
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
  }
  
  // ถ้าไม่มีการตั้งค่าใดๆ ให้ใช้ธีม Light เป็นค่าเริ่มต้น
  return THEMES.LIGHT;
}

// สร้าง store สำหรับธีม
export const theme = writable(THEMES.LIGHT); // ค่าเริ่มต้นชั่วคราวจะถูกแทนที่ใน onMount

// ฟังก์ชันเปลี่ยนธีม
export function setTheme(newTheme) {
  // ตรวจสอบว่าเป็นธีมที่รองรับหรือไม่
  if (!Object.values(THEMES).includes(newTheme)) {
    console.error(`Theme ${newTheme} is not supported`);
    return;
  }
  
  // อัพเดทธีมใน store
  theme.set(newTheme);
  
  // บันทึกลง LocalStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', newTheme);
  }
  
  // อัพเดท data-theme attribute บน <html> element
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', newTheme);
  }
}

// ฟังก์ชัน initialize theme ที่จะเรียกใช้ใน onMount
export function initializeTheme() {
  const initialTheme = initTheme();
  setTheme(initialTheme);
}

// ฟังก์ชันเพิ่มเติมเพื่อรองรับการทำงานในอนาคต
export function getThemeColors(themeId) {
  // ฟังก์ชันนี้สามารถใช้เพื่อดึงค่าสีของธีมเพื่อใช้ใน JS โดยตรงได้
  const themeMap = {
    [THEMES.LIGHT]: {
      primary: '#4CAF50',
      background: '#f8f8f8',
      surface: '#ffffff',
      text: '#333333',
      // อื่นๆ...
    },
    [THEMES.DARK]: {
      primary: '#5CDA60',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#E0E0E0',
      // อื่นๆ...
    },
    [THEMES.SUPERDARK]: {
      primary: '#00E676',
      background: '#000000',
      surface: '#0A0A0A',
      text: '#FFFFFF',
      // อื่นๆ...
    },
    [THEMES.PINK]: {
      primary: '#FF4081',
      background: '#FFF0F6',
      surface: '#FFFFFF',
      text: '#442C2E',
      // อื่นๆ...
    }
  };
  
  return themeMap[themeId] || themeMap[THEMES.LIGHT];
} 