<script>
  import {counts} from './store.js';

  export let line_item_id;
  export let line_item_qty;

  export let line_num;

  const count = counts[line_num];
  $count = line_item_qty;
  
  function increment() {
    
    console.clear();

    // -This value is to be sent to the server 
    //  (not verified it has been succefully updated yet, 
    //   that happens in the response)
    const new_quanity_we_desire = $count + 1;

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

      console.log('Svelte Fetch: ', data);
 
      // New quantity has been succesfully changed on server
      const verified_new_quantity = data.items[line_num].quantity;

      // -Update quantity of line item (to display in component one level above)
       count.update(() => verified_new_quantity);
    })
    .catch(error => console.error('Error:', error));
  }

</script>

<div class="qty-container">
  <button on:click={increment}>+</button>
  <span>{$count}</span>
</div>

<style>
  .qty-container {
    background: blue;
  }
</style>