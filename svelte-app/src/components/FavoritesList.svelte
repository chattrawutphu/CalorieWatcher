<script>
  import { favorites, removeFromFavorites, addFoodToLog } from '../stores/nutrition.js';
  import { translations } from '../stores/translation.js';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  export let onSelect = () => {}; // callback after selecting
  
  let selectedMeal = 'breakfast';
  
  function addToLog(food) {
    addFoodToLog(date, selectedMeal, food);
    onSelect(food, selectedMeal);
  }
  
  function removeFavorite(foodId) {
    if (confirm($translations.confirmRemoveFromFavorites)) {
      removeFromFavorites(foodId);
    }
  }
</script>

<div class="favorites-list">
  <h2>{$translations.favorites}</h2>
  
  {#if $favorites.length > 0}
    <div class="meal-selector">
      <label for="meal-select">{$translations.selectMeal}:</label>
      <select id="meal-select" bind:value={selectedMeal}>
        <option value="breakfast">{$translations.breakfast}</option>
        <option value="lunch">{$translations.lunch}</option>
        <option value="dinner">{$translations.dinner}</option>
        <option value="snacks">{$translations.snacks}</option>
      </select>
    </div>
    
    <ul class="favorite-items">
      {#each $favorites as food (food.id)}
        <li class="favorite-item">
          <div class="favorite-info">
            <span class="favorite-name">{food.name}</span>
            <span class="favorite-details">
              {food.calories} kcal | {food.amount}{$translations.g}
            </span>
          </div>
          
          <div class="favorite-actions">
            <button class="add-button" on:click={() => addToLog(food)}>
              <span class="add-icon">+</span>
              <span class="sr-only">{$translations.addFood}</span>
            </button>
            
            <button class="remove-button" on:click={() => removeFavorite(food.id)}>
              <span class="remove-icon">×</span>
              <span class="sr-only">{$translations.removeFromFavorites}</span>
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-favorites">{$translations.noFavorites}</p>
  {/if}
</div>

<style>
  .favorites-list {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #333;
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .meal-selector {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }
  
  .meal-selector label {
    margin-right: 0.5rem;
    color: #555;
    font-weight: bold;
  }
  
  .meal-selector select {
    flex: 1;
    padding: 0.4rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .no-favorites {
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 1rem 0;
  }
  
  .favorite-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .favorite-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .favorite-item:last-child {
    border-bottom: none;
  }
  
  .favorite-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .favorite-name {
    font-weight: bold;
    color: #333;
  }
  
  .favorite-details {
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.2rem;
  }
  
  .favorite-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .add-button, .remove-button {
    background: none;
    border: none;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  
  .add-button {
    color: white;
    background-color: #4CAF50;
  }
  
  .add-button:hover {
    background-color: #45a049;
  }
  
  .remove-button {
    color: white;
    background-color: #e74c3c;
  }
  
  .remove-button:hover {
    background-color: #c0392b;
  }
  
  .add-icon, .remove-icon {
    font-size: 1.2rem;
    line-height: 1;
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
    .favorite-info {
      flex-direction: row;
      align-items: center;
    }
    
    .favorite-details {
      margin-top: 0;
      margin-left: 0.5rem;
    }
  }
</style> 