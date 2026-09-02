<script>
	import favicon from '$lib/assets/favicon.ico';

	import WalletSelection from '$lib/components/WalletSelection.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>The Agent Billboard</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<WalletSelection/>

{@render children()}
