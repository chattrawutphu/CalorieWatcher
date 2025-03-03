<script>
  import { settings, getDailyCalories, getDailyMacros } from '../stores/nutrition.js';
  import { translations } from '../stores/translation.js';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  
  let consumed = 0;
  let calorieGoal = 0;
  let remaining = 0;
  let macros = { protein: 0, fat: 0, carbs: 0 };
  
  // คำนวณค่าต่างๆ เมื่อวันที่หรือการตั้งค่าเปลี่ยนแปลง
  $: {
    consumed = getDailyCalories(date);
    settings.subscribe(s => {
      calorieGoal = s.calorieGoal;
    })();
    remaining = calorieGoal - consumed;
    macros = getDailyMacros(date);
  }
  
  // คำนวณเปอร์เซ็นต์การบริโภค
  $: consumedPercent = Math.min(Math.round((consumed / calorieGoal) * 100) || 0, 100);
  
  // คำนวณสีของค่าแคลอรี่คงเหลือ
  $: remainingColor = remaining < 0 ? 'red' : remaining < (calorieGoal * 0.1) ? 'orange' : 'green';
</script>

<div class="dashboard-summary">
  <div class="date-display">
    <h2>{$translations.date}: {date}</h2>
  </div>
  
  <div class="calorie-summary">
    <div class="calorie-card">
      <h3>{$translations.dailyGoal}</h3>
      <p class="calorie-number">{calorieGoal}</p>
    </div>
    
    <div class="calorie-card">
      <h3>{$translations.consumedCalories}</h3>
      <p class="calorie-number">{consumed}</p>
    </div>
    
    <div class="calorie-card">
      <h3>{$translations.remainingCalories}</h3>
      <p class="calorie-number" style="color: {remainingColor}">{remaining}</p>
    </div>
  </div>
  
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {consumedPercent}%"></div>
    </div>
    <p class="progress-text">{consumedPercent}%</p>
  </div>
  
  <div class="macro-summary">
    <h3>{$translations.macronutrients}</h3>
    <div class="macro-cards">
      <div class="macro-card protein">
        <span class="macro-label">{$translations.protein}</span>
        <span class="macro-value">{macros.protein}g</span>
      </div>
      <div class="macro-card fat">
        <span class="macro-label">{$translations.fat}</span>
        <span class="macro-value">{macros.fat}g</span>
      </div>
      <div class="macro-card carbs">
        <span class="macro-label">{$translations.carbohydrate}</span>
        <span class="macro-value">{macros.carbs}g</span>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard-summary {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }
  
  .date-display {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .date-display h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .calorie-summary {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .calorie-card {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  
  .calorie-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #555;
  }
  
  .calorie-number {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }
  
  .progress-container {
    margin-bottom: 1.5rem;
  }
  
  .progress-bar {
    height: 20px;
    background-color: #e9e9e9;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    text-align: center;
    margin: 0;
    font-weight: bold;
    color: #555;
  }
  
  .macro-summary h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    text-align: center;
    color: #333;
  }
  
  .macro-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .macro-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.7rem 1rem;
    border-radius: 8px;
    color: white;
  }
  
  .protein {
    background-color: #3498db;
  }
  
  .fat {
    background-color: #e74c3c;
  }
  
  .carbs {
    background-color: #f39c12;
  }
  
  .macro-label {
    font-weight: bold;
  }
  
  .macro-value {
    font-size: 1.1rem;
  }
  
  @media (min-width: 768px) {
    .calorie-summary {
      flex-direction: row;
    }
    
    .calorie-card {
      flex: 1;
    }
    
    .macro-cards {
      flex-direction: row;
    }
    
    .macro-card {
      flex: 1;
    }
  }
</style> 