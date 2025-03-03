<script>
  import { translations } from '../stores/translation.js';
  import DashboardSummary from './DashboardSummary.svelte';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  
  // ฟังก์ชันเปลี่ยนวันที่
  function previousDay() {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    date = currentDate.toISOString().split('T')[0];
  }
  
  function nextDay() {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // ไม่อนุญาตให้เลือกวันในอนาคตเกินวันพรุ่งนี้
    if (currentDate <= tomorrow) {
      date = currentDate.toISOString().split('T')[0];
    }
  }
  
  function resetToToday() {
    date = new Date().toISOString().split('T')[0];
  }
  
  // หาชื่อวันที่แบบอ่านง่าย
  $: formattedDate = formatDate(date);
  
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return $translations.today;
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return $translations.yesterday;
    } else {
      return d.toLocaleDateString();
    }
  }
</script>

<div class="dashboard">
  <div class="date-nav">
    <button class="nav-button" on:click={previousDay}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <div class="date-display">
      <h2>{formattedDate}</h2>
      {#if date !== new Date().toISOString().split('T')[0]}
        <button class="today-button" on:click={resetToToday}>
          {$translations.today}
        </button>
      {/if}
    </div>
    
    <button class="nav-button" on:click={nextDay}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
  
  <DashboardSummary {date} />
</div>

<style>
  .dashboard {
    padding: 1rem;
  }
  
  .date-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .date-display {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .date-display h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .nav-button {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;
  }
  
  .nav-button:hover {
    background-color: #f5f5f5;
  }
  
  .today-button {
    background: none;
    border: none;
    color: #4CAF50;
    font-size: 0.9rem;
    padding: 0;
    margin-top: 0.3rem;
    cursor: pointer;
    text-decoration: underline;
  }
  
  @media (min-width: 768px) {
    .dashboard {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .date-nav {
      margin-bottom: 2rem;
    }
  }
</style> 