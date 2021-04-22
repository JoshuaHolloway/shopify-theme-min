<script>
  import do_change_quantity_post_request from './changeCart.js';
  import {counts} from './store.js';

  export let line_item_id;
  export let line_item_qty;

  export let line_num;

  const count = counts[line_num];
  $count = line_item_qty;

  // ============================================

  function increment() {
    const current_quantity = $count;
    const new_quanity_we_desire = $count + 1;
    do_change_quantity_post_request(line_item_id, current_quantity, new_quanity_we_desire, line_num);
  }

  // ============================================

  function decrement() {
    const current_quantity = $count;
    const new_quanity_we_desire = $count - 1;
    do_change_quantity_post_request(line_item_id, current_quantity, new_quanity_we_desire, line_num);
  }

</script>

<div class="qty-container">
  <button on:click={increment}>+</button>
  <span>{$count}</span>
  <button on:click={decrement}>-</button>
</div>

<style>
  .qty-container {
    background: blue;
  }
</style>