<script>
  import {count_1, count_2} from './store.js';

  export let line_item_id;
  export let line_item_qty;

  export let line_num;


  if (line_num === 0)
    $count_1 = line_item_qty;
  else if (line_num === 1)
    $count_2 = line_item_qty;

  function increment() {
    
    console.clear();

    console.log(`line_num: ${line_num}, $count_1: ${$count_1}, $count_2: ${$count_2}`);
    console.log(`line_item_id: ${line_item_id}, typeof line_item_id: ${typeof line_item_id}`);
  

    // -This value is to be sent to the server 
    //  (not verified it has been succefully updated yet, 
    //   that happens in the response)
    // const new_quanity_we_desire = local_component_qty + 1;
    let new_quanity_we_desire;
    if (line_num === 0)
      new_quanity_we_desire = $count_1 + 1;
    else if (line_num === 1)
      new_quanity_we_desire = $count_2 + 1;


    console.log('new_quantity_we_desire: ', new_quanity_we_desire);


    // const data_obj = { "quantity": new_quanity_we_desire, "id": String(line_item_id) };
    
    // const data_obj = { "quantity": String(9), "id": String(39540088832179) };
    // const data_obj = { "quantity": String(9), "id": String(39540031127731) };


    // const data_obj = { "quantity": String(18), "id": "39540088832179:6881ee5f9fc473f02da20f6049955538" };
    // const data_obj = { "quantity": String(18), "id": "39540031127731:109260b9cfda5bcd3e86cdb2f7ba8b67" };
    

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
      console.log('verified_new_quantity: ', verified_new_quantity);

      // -Update quantity of line item (to display in component one level above)
      if (line_num === 0) {
        
        count_1.update(n => verified_new_quantity);

      } else if (line_num === 1) {
        
        count_2.update(n => verified_new_quantity);
      
      }

    })
    .catch(error => console.error('Error:', error));

  }

</script>

<div class="qty-container">
  
  <button on:click={increment}>+</button>

</div>

<style>
  .qty-container {
    background: blue;
  }
</style>