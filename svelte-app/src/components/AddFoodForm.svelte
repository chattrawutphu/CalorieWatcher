<script>
  import { addFoodToLog, addToFavorites } from '../stores/nutrition.js';
  import { translations } from '../stores/translation.js';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  export let meal = 'breakfast'; // default to breakfast
  export let onSave = () => {}; // callback after save
  
  let foodName = '';
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let amount = 100; // default to 100g
  let addToFavoritesFlag = false;
  
  function resetForm() {
    foodName = '';
    calories = 0;
    protein = 0;
    fat = 0;
    carbs = 0;
    amount = 100;
    addToFavoritesFlag = false;
  }
  
  function saveFood() {
    if (!foodName.trim()) {
      alert($translations.foodNameRequired);
      return;
    }
    
    if (calories <= 0) {
      alert($translations.caloriesRequired);
      return;
    }
    
    const food = {
      name: foodName,
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      amount: Number(amount)
    };
    
    // เพิ่มลงในบันทึกอาหาร
    addFoodToLog(date, meal, food);
    
    // เพิ่มลงในรายการโปรดถ้าเลือก
    if (addToFavoritesFlag) {
      addToFavorites(food);
    }
    
    // รีเซ็ตฟอร์ม
    resetForm();
    
    // เรียก callback
    onSave();
  }
</script>

<div class="add-food-form">
  <h2>{$translations.addFood}</h2>
  
  <div class="form-group">
    <label for="food-name">{$translations.foodName}</label>
    <input 
      id="food-name"
      type="text"
      bind:value={foodName}
      placeholder={$translations.foodName}
    />
  </div>
  
  <div class="form-row">
    <div class="form-group">
      <label for="calories">{$translations.calories}</label>
      <input 
        id="calories"
        type="number"
        bind:value={calories}
        min="0"
      />
    </div>
    
    <div class="form-group">
      <label for="amount">{$translations.amount} (g)</label>
      <input 
        id="amount"
        type="number"
        bind:value={amount}
        min="0"
      />
    </div>
  </div>
  
  <h3>{$translations.macronutrients} (g)</h3>
  <div class="form-row">
    <div class="form-group">
      <label for="protein">{$translations.protein}</label>
      <input 
        id="protein"
        type="number"
        bind:value={protein}
        min="0"
        step="0.1"
      />
    </div>
    
    <div class="form-group">
      <label for="fat">{$translations.fat}</label>
      <input 
        id="fat"
        type="number"
        bind:value={fat}
        min="0"
        step="0.1"
      />
    </div>
    
    <div class="form-group">
      <label for="carbs">{$translations.carbohydrate}</label>
      <input 
        id="carbs"
        type="number"
        bind:value={carbs}
        min="0"
        step="0.1"
      />
    </div>
  </div>
  
  <div class="form-group checkbox">
    <label>
      <input 
        type="checkbox"
        bind:checked={addToFavoritesFlag}
      />
      {$translations.addToFavorites}
    </label>
  </div>
  
  <div class="button-group">
    <button class="cancel-button" on:click={resetForm}>
      {$translations.cancel}
    </button>
    <button class="save-button" on:click={saveFood}>
      {$translations.save}
    </button>
  </div>
</div>

<style>
  .add-food-form {
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
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
    color: #555;
  }
  
  input[type="text"],
  input[type="number"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .checkbox {
    margin-top: 1rem;
  }
  
  .checkbox label {
    display: flex;
    align-items: center;
    font-weight: normal;
  }
  
  .checkbox input {
    margin-right: 0.5rem;
    width: auto;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .save-button, .cancel-button {
    flex: 1;
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .save-button {
    background-color: #4CAF50;
    color: white;
  }
  
  .save-button:hover {
    background-color: #45a049;
  }
  
  .cancel-button {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .cancel-button:hover {
    background-color: #e8e8e8;
  }
  
  @media (min-width: 768px) {
    .form-row {
      flex-direction: row;
    }
    
    .form-row .form-group {
      flex: 1;
    }
  }
</style> 