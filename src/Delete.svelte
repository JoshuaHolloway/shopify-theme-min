<script>
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();

  import do_change_quantity_post_request from './changeCart.js';
  import {counts} from './store.js';

  export let items;

  export let line_item_id;
  export let line_item_qty;

  export let line_num;

  const count = counts[line_num];
  $count = line_item_qty;

  $: {
    console.log('re-render DELETE, and items = ', items);
  }

  // ============================================

  function f_delete() {

    const current_quantity = $count;
    const new_quanity_we_desire = 0;
    do_change_quantity_post_request(line_item_id, current_quantity, new_quanity_we_desire, line_num);
  }
</script>

<button 
  on:click={() => dispatch('remove', line_num)} 
  on:click={f_delete}>
  Delete
</button>