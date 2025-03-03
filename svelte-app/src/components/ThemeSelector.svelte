<script>
  import { theme, setTheme, availableThemes, THEMES } from '../stores/theme.js';
  import { translations } from '../stores/translation.js';
</script>

<div class="w-full">
  <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">{$translations.chooseTheme}</h3>
  
  <div class="flex flex-wrap gap-2">
    {#each availableThemes as themeOption}
      <button 
        class="theme-button rounded-lg p-4 flex flex-col items-center relative border-2 transition-all duration-200 shadow-sm hover:shadow-md"
        class:border-primary={$theme === themeOption.id}
        class:border-transparent={$theme !== themeOption.id}
        class:bg-light-surface={themeOption.id === THEMES.LIGHT}
        class:bg-dark-surface={themeOption.id === THEMES.DARK}
        class:bg-superdark-surface={themeOption.id === THEMES.SUPERDARK}
        class:bg-pink-surface={themeOption.id === THEMES.PINK}
        on:click={() => setTheme(themeOption.id)}
      >
        <div class="w-12 h-12 rounded-full mb-2 flex items-center justify-center" 
          class:bg-light-primary={themeOption.id === THEMES.LIGHT}
          class:bg-dark-primary={themeOption.id === THEMES.DARK}
          class:bg-superdark-primary={themeOption.id === THEMES.SUPERDARK}
          class:bg-pink-primary={themeOption.id === THEMES.PINK}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {#if themeOption.id === THEMES.LIGHT}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            {:else if themeOption.id === THEMES.DARK}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            {:else if themeOption.id === THEMES.SUPERDARK}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            {:else if themeOption.id === THEMES.PINK}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            {/if}
          </svg>
        </div>
        <span 
          class="text-sm font-medium"
          class:text-light-text={themeOption.id === THEMES.LIGHT}
          class:text-dark-text={themeOption.id === THEMES.DARK}
          class:text-superdark-text={themeOption.id === THEMES.SUPERDARK}
          class:text-pink-text={themeOption.id === THEMES.PINK}
        >
          {$translations[themeOption.name]}
        </span>
        
        {#if $theme === themeOption.id}
          <div class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        {/if}
      </button>
    {/each}
  </div>
  
  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{$translations.themeDescription}</p>
</div> 