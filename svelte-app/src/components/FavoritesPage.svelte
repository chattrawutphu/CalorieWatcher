<script>
  import { translations } from '../stores/translation.js';
  import FavoritesList from './FavoritesList.svelte';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  
  function handleFavoriteSelected(food, meal) {
    // แสดงข้อความแจ้งเตือนว่าได้เพิ่มอาหารลงในบันทึกแล้ว
    const message = `${food.name} ${$translations.addedToMeal} ${$translations[meal]}`;
    showNotification(message);
  }
  
  let notification = '';
  let showNotificationFlag = false;
  
  function showNotification(message) {
    notification = message;
    showNotificationFlag = true;
    
    // ซ่อนการแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
      showNotificationFlag = false;
    }, 3000);
  }
</script>

<div class="favorites-page">
  <h1>{$translations.favorites}</h1>
  
  <FavoritesList {date} onSelect={handleFavoriteSelected} />
  
  {#if showNotificationFlag}
    <div class="notification">
      {notification}
    </div>
  {/if}
</div>

<style>
  .favorites-page {
    padding: 1rem;
    position: relative;
  }
  
  h1 {
    color: #333;
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .notification {
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4CAF50;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: fadeInOut 3s ease;
    text-align: center;
    max-width: 90%;
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  @media (min-width: 768px) {
    .favorites-page {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .notification {
      bottom: 20px;
    }
  }
</style> 