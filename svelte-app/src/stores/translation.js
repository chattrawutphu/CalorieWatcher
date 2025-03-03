import { writable } from 'svelte/store';
import th from '../locales/th.js';
import en from '../locales/en.js';

export const language = writable('th'); // ค่าเริ่มต้นเป็นภาษาไทย

export const translations = writable(th);

// ฟังก์ชันสำหรับเปลี่ยนภาษา
export function setLanguage(lang) {
  language.set(lang);
  if (lang === 'th') {
    translations.set(th);
  } else if (lang === 'en') {
    translations.set(en);
  }
}

// ฟังก์ชันสำหรับการแปลข้อความ
export function t(key) {
  let result = '';
  translations.subscribe(value => {
    result = value[key] || key;
  })();
  return result;
} 