<script>
  import { count } from './store.js';
  import Increment from './Elem-Increment.svelte';
  import Decrement from './Elem-Decrement.svelte';

  let count_value;
  const unsubscribe = count.subscribe(value => {
    count_value = value;
  });
</script>

<h1>The count is: {count_value}</h1>
<Increment />
<Decrement />