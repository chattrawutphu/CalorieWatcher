<script>
  import { foodLogs, removeFoodFromLog } from '../stores/nutrition.js';
  import { translations } from '../stores/translation.js';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  export let meal = 'breakfast'; // breakfast, lunch, dinner, snacks
  
  // คำนวณแคลอรี่รวมของมื้อนี้
  $: mealCalories = getMealCalories();
  
  function getMealCalories() {
    let total = 0;
    if ($foodLogs[date] && $foodLogs[date][meal]) {
      $foodLogs[date][meal].forEach(item => {
        total += item.calories;
      });
    }
    return total;
  }
  
  function deleteFood(foodId) {
    if (confirm($translations.confirmDelete)) {
      removeFoodFromLog(date, meal, foodId);
    }
  }
</script>

<div class="food-log-list">
  <div class="meal-header">
    <h3>{$translations[meal]}</h3>
    <span class="meal-calories">{mealCalories} {$translations.calories}</span>
  </div>
  
  {#if $foodLogs[date] && $foodLogs[date][meal] && $foodLogs[date][meal].length > 0}
    <ul class="food-items">
      {#each $foodLogs[date][meal] as food (food.id)}
        <li class="food-item">
          <div class="food-info">
            <span class="food-name">{food.name}</span>
            <span class="food-amount">{food.amount}{$translations.g}</span>
          </div>
          <div class="food-nutrition">
            <span class="food-calories">{food.calories} kcal</span>
            <span class="food-macros">
              P: {food.protein || 0}g | F: {food.fat || 0}g | C: {food.carbs || 0}g
            </span>
          </div>
          <button class="delete-button" on:click={() => deleteFood(food.id)}>
            <span class="delete-icon">×</span>
            <span class="sr-only">{$translations.delete}</span>
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-foods">{$translations.noFoodRecorded}</p>
  {/if}
</div>

<style>
  .food-log-list {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }
  
  .meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .meal-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
  }
  
  .meal-calories {
    font-weight: bold;
    color: #4CAF50;
  }
  
  .no-foods {
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 0.5rem;
  }
  
  .food-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f5f5f5;
    position: relative;
  }
  
  .food-item:last-child {
    border-bottom: none;
  }
  
  .food-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .food-name {
    font-weight: bold;
    color: #333;
  }
  
  .food-amount {
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.2rem;
  }
  
  .food-nutrition {
    text-align: right;
    flex: 1;
    padding-right: 2.5rem;
  }
  
  .food-calories {
    font-weight: bold;
    color: #555;
    display: block;
  }
  
  .food-macros {
    font-size: 0.8rem;
    color: #777;
    display: block;
    margin-top: 0.2rem;
  }
  
  .delete-button {
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 1.5rem;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.2rem;
  }
  
  .delete-button:hover {
    color: #c0392b;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  @media (min-width: 768px) {
    .food-item {
      padding: 1rem 0;
    }
    
    .food-info {
      flex-direction: row;
      align-items: center;
    }
    
    .food-amount {
      margin-top: 0;
      margin-left: 0.5rem;
    }
  }
</style> 