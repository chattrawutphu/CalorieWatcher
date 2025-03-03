<script>
  import { language, setLanguage, translations } from '../stores/translation.js';
  import { settings } from '../stores/nutrition.js';

  function changeLanguage(lang) {
    setLanguage(lang);
    // บันทึกการตั้งค่าภาษาใน settings
    settings.update(s => ({ ...s, language: lang }));
  }
</script>

<div class="language-selector">
  <label for="language-select">{$translations.language}</label>
  <select 
    id="language-select" 
    bind:value={$language} 
    on:change={(e) => changeLanguage(e.target.value)}
  >
    <option value="th">{$translations.thai}</option>
    <option value="en">{$translations.english}</option>
  </select>
</div>

<style>
  .language-selector {
    margin: 1rem 0;
    padding: 0.5rem;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #555;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    .language-selector {
      display: flex;
      align-items: center;
    }
    
    label {
      margin-bottom: 0;
      margin-right: 1rem;
      flex: 0 0 auto;
    }
    
    select {
      flex: 1;
    }
  }
</style> 