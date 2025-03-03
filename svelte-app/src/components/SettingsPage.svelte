<script>
  import { translations } from '../stores/translation.js';
  import CalorieGoalSetting from './CalorieGoalSetting.svelte';
  import LanguageSelector from './LanguageSelector.svelte';
</script>

<div class="settings-page">
  <h1>{$translations.settings}</h1>
  
  <CalorieGoalSetting />
  
  <div class="section">
    <h2>{$translations.language}</h2>
    <LanguageSelector />
  </div>
  
  <div class="app-info">
    <h3>{$translations.appName}</h3>
    <p class="version">v1.0.0</p>
    <p class="description">
      {$translations.appDescription}
    </p>
  </div>
</div>

<style>
  .settings-page {
    padding: 1rem;
  }
  
  h1 {
    color: #333;
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .section {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }
  
  .section h2 {
    color: #333;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .app-info {
    text-align: center;
    margin-top: 2rem;
    color: #777;
    padding: 1rem;
  }
  
  .app-info h3 {
    margin: 0;
    color: #4CAF50;
    font-size: 1.2rem;
  }
  
  .version {
    margin: 0.3rem 0 1rem;
    font-size: 0.9rem;
  }
  
  .description {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  @media (min-width: 768px) {
    .settings-page {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .section {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }
</style> 