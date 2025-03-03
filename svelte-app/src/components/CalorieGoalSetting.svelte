<script>
  import { settings } from '../stores/nutrition.js';
  import { translations } from '../stores/translation.js';
  
  let calorieGoal;
  let protein;
  let fat;
  let carbs;
  
  // เมื่อ settings เปลี่ยน อัพเดตค่าในฟอร์ม
  settings.subscribe(value => {
    calorieGoal = value.calorieGoal;
    protein = value.macroSplit.protein;
    fat = value.macroSplit.fat;
    carbs = value.macroSplit.carbs;
  });
  
  function updateSettings() {
    // ตรวจสอบว่าผลรวมของสารอาหารเป็น 100%
    const total = protein + fat + carbs;
    if (total !== 100) {
      alert(`${$translations.macronutrients} ${$translations.total} ${total}% (${$translations.total} 100%)`);
      return;
    }
    
    settings.update(s => ({
      ...s,
      calorieGoal,
      macroSplit: { protein, fat, carbs }
    }));
  }
</script>

<div class="calorie-goal-settings">
  <h2>{$translations.calorieGoal}</h2>
  
  <div class="form-group">
    <label for="calorie-goal">{$translations.dailyGoal}</label>
    <input 
      id="calorie-goal"
      type="number"
      bind:value={calorieGoal}
      min="500"
      max="10000"
    />
  </div>
  
  <h3>{$translations.macronutrients}</h3>
  <p class="help-text">({$translations.total}: 100%)</p>
  
  <div class="macro-sliders">
    <div class="form-group">
      <label for="protein">{$translations.protein} ({protein}%)</label>
      <input 
        id="protein"
        type="range"
        min="5"
        max="70"
        step="5"
        bind:value={protein}
      />
    </div>
    
    <div class="form-group">
      <label for="fat">{$translations.fat} ({fat}%)</label>
      <input 
        id="fat"
        type="range"
        min="5"
        max="70"
        step="5"
        bind:value={fat}
      />
    </div>
    
    <div class="form-group">
      <label for="carbs">{$translations.carbohydrate} ({carbs}%)</label>
      <input 
        id="carbs"
        type="range"
        min="5"
        max="70"
        step="5"
        bind:value={carbs}
      />
    </div>
  </div>
  
  <button class="save-button" on:click={updateSettings}>
    {$translations.save}
  </button>
</div>

<style>
  .calorie-goal-settings {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }
  
  h2, h3 {
    color: #333;
    margin-top: 0;
  }
  
  h3 {
    margin-bottom: 0.2rem;
  }
  
  .help-text {
    margin-top: 0;
    font-size: 0.8rem;
    color: #777;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
    color: #555;
  }
  
  input[type="number"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input[type="range"] {
    width: 100%;
  }
  
  .save-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    margin-top: 1rem;
  }
  
  .save-button:hover {
    background-color: #45a049;
  }
  
  @media (min-width: 768px) {
    .macro-sliders {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
  }
</style> 