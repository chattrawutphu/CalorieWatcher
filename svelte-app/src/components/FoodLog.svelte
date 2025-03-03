<script>
  import { translations } from '../stores/translation.js';
  import FoodLogList from './FoodLogList.svelte';
  import AddFoodForm from './AddFoodForm.svelte';
  
  export let date = new Date().toISOString().split('T')[0]; // default to today
  
  let activeMeal = 'breakfast';
  let showAddForm = false;
  
  function toggleAddForm() {
    showAddForm = !showAddForm;
  }
  
  function handleAddFood() {
    showAddForm = false;
  }
  
  const meals = [
    { id: 'breakfast', icon: '🍳' },
    { id: 'lunch', icon: '🍲' },
    { id: 'dinner', icon: '🍽️' },
    { id: 'snacks', icon: '🍪' }
  ];
</script>

<div class="food-log">
  <div class="meal-tabs">
    {#each meals as meal}
      <button 
        class="meal-tab {activeMeal === meal.id ? 'active' : ''}"
        on:click={() => activeMeal = meal.id}
      >
        <span class="meal-icon">{meal.icon}</span>
        <span class="meal-name">{$translations[meal.id]}</span>
      </button>
    {/each}
  </div>
  
  <div class="meal-content">
    <FoodLogList {date} meal={activeMeal} />
    
    {#if showAddForm}
      <AddFoodForm {date} meal={activeMeal} onSave={handleAddFood} />
    {:else}
      <button class="add-food-button" on:click={toggleAddForm}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        {$translations.addFood}
      </button>
    {/if}
  </div>
</div>

<style>
  .food-log {
    padding: 1rem;
  }
  
  .meal-tabs {
    display: flex;
    overflow-x: auto;
    margin-bottom: 1rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .meal-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    min-width: 80px;
    color: #777;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
  }
  
  .meal-tab.active {
    color: #4CAF50;
    border-bottom-color: #4CAF50;
  }
  
  .meal-icon {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
  }
  
  .meal-name {
    font-size: 0.8rem;
    white-space: nowrap;
  }
  
  .add-food-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.3s;
  }
  
  .add-food-button:hover {
    background-color: #45a049;
  }
  
  @media (min-width: 768px) {
    .food-log {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .meal-tab {
      flex-direction: row;
      justify-content: center;
      padding: 1rem;
    }
    
    .meal-icon {
      margin-bottom: 0;
      margin-right: 0.5rem;
    }
    
    .meal-name {
      font-size: 1rem;
    }
  }
</style> 