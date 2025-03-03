<script>
  import { translations } from '../stores/translation.js';
  
  export let activePage = 'dashboard';
  export let onPageChange = (page) => {};
</script>

<nav class="navbar">
  <div class="brand">
    <h1>{$translations.appName}</h1>
  </div>
  
  <ul class="nav-items">
    <li class="nav-item">
      <button 
        class="nav-link {activePage === 'dashboard' ? 'active' : ''}" 
        on:click={() => onPageChange('dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>{$translations.dashboard}</span>
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activePage === 'foodLog' ? 'active' : ''}" 
        on:click={() => onPageChange('foodLog')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>{$translations.foodLog}</span>
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activePage === 'favorites' ? 'active' : ''}" 
        on:click={() => onPageChange('favorites')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>{$translations.favorites}</span>
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activePage === 'settings' ? 'active' : ''}" 
        on:click={() => onPageChange('settings')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>{$translations.settings}</span>
      </button>
    </li>
  </ul>
</nav>

<style>
  .navbar {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
  
  .brand {
    display: none;
  }
  
  .nav-items {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: space-between;
  }
  
  .nav-item {
    flex: 1;
    text-align: center;
  }
  
  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    color: #777;
    text-decoration: none;
    font-size: 0.7rem;
    border: none;
    background: none;
    cursor: pointer;
    width: 100%;
  }
  
  .nav-link.active {
    color: #4CAF50;
  }
  
  .icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 0.3rem;
  }
  
  @media (min-width: 768px) {
    .navbar {
      top: 0;
      bottom: auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .brand {
      display: block;
    }
    
    .brand h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #4CAF50;
    }
    
    .nav-items {
      width: auto;
    }
    
    .nav-link {
      flex-direction: row;
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }
    
    .icon {
      width: 1.2rem;
      height: 1.2rem;
      margin-bottom: 0;
      margin-right: 0.5rem;
    }
  }
</style> 