<script>
	export let name;
</script>

<div>
  <h1>HHH Hello {name}!</h1>
</div>

<style>

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>