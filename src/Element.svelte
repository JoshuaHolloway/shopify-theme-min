<script>
  import {counts} from './store.js';

  export let line_item_id;
  export let line_item_qty;

  export let line_num;

  const count = counts[line_num];
  $count = line_item_qty;

  // ============================================

  function do_change_quantity_post_request(line_item_id, new_quanity_we_desire) {

    const data_obj = { "quantity": String(new_quanity_we_desire), "id": String(line_item_id) };
    // const data_obj = { "line": 1, "quantity": 7,  };

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data_obj)
    })
    .then(response => response.json())
    .then(data => {

      console.clear();
      console.log('Svelte Fetch: ', data);
 
      // New quantity has been succesfully changed on server
      const verified_new_quantity = data.items[line_num].quantity;

      // -Update quantity of line item (to display in component one level above)
       count.update(() => verified_new_quantity);
    })
    .catch(error => console.error('Error:', error));

  }

  // ============================================

  function increment() {
    const new_quanity_we_desire = $count + 1;
    do_change_quantity_post_request(line_item_id, new_quanity_we_desire);
  }

  // ============================================

  function decrement() {
    const new_quanity_we_desire = $count - 1;
    do_change_quantity_post_request(line_item_id, new_quanity_we_desire);
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