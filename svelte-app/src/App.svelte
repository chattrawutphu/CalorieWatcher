<script>
	import { onMount } from 'svelte';
	import { settings } from './stores/nutrition.js';
	import { setLanguage } from './stores/translation.js';
	
	import Navbar from './components/Navbar.svelte';
	import Dashboard from './components/Dashboard.svelte';
	import FoodLog from './components/FoodLog.svelte';
	import FavoritesPage from './components/FavoritesPage.svelte';
	import SettingsPage from './components/SettingsPage.svelte';
	
	let activePage = 'dashboard';
	let currentDate = new Date().toISOString().split('T')[0]; // โดยค่าเริ่มต้นเป็นวันนี้
	
	function handlePageChange(page) {
		activePage = page;
	}
	
	// โหลดการตั้งค่าภาษาจากที่จัดเก็บไว้เมื่อแอพโหลด
	onMount(() => {
		// กำหนดภาษาตามการตั้งค่าที่บันทึกไว้
		setLanguage($settings.language);
	});
</script>

<main class="app-container">
	<div class="content-area">
		{#if activePage === 'dashboard'}
			<Dashboard date={currentDate} />
		{:else if activePage === 'foodLog'}
			<FoodLog date={currentDate} />
		{:else if activePage === 'favorites'}
			<FavoritesPage date={currentDate} />
		{:else if activePage === 'settings'}
			<SettingsPage />
		{/if}
	</div>
	
	<Navbar {activePage} onPageChange={handlePageChange} />
</main>

<style>
	:global(body) {
		background-color: #f8f8f8;
		color: #333;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
			Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		margin: 0;
		padding: 0;
		line-height: 1.5;
	}
	
	.app-container {
		min-height: 100vh;
	}
	
	.content-area {
		padding-bottom: 70px; /* พื้นที่สำหรับ navbar ด้านล่าง */
	}
	
	@media (min-width: 768px) {
		.content-area {
			padding-top: 70px; /* พื้นที่สำหรับ navbar ด้านบน */
			padding-bottom: 0;
		}
	}
</style>