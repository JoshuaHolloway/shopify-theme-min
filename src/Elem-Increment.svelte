<script>
  import {count} from './store.js';

  export let line_num;
  export let line_item_id;
  export let line_item_qty;
  
  let local_component_qty;


  // Set count AND local_component_qty upon first render:
  
  // Local              Prop passed in
  local_component_qty = line_item_qty;

  count.update(current_count_val => {
    const updated_count_val = local_component_qty;
    return updated_count_val;
  });



  $: {
    console.log('Elem-Increment is updating, local_component_qty: ', local_component_qty);
  }

  function increment() {
    
    console.clear();
  
    count.update(n => {
      local_component_qty = n + 1;
      return local_component_qty;
    });


    console.log('local_component_qty: ', local_component_qty);

    // const data_obj = { "quantity": local_component_qty, "id": "39540031127731" };
    const data_obj = { "quantity": local_component_qty, "id": String(line_item_id) };

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data_obj)
    })
    .then(response => response.json())
    .then(data => {
      // console.clear();
      // console.log({ "quantity": x, "id": "39540088832179" });
      console.log('Svelte Fetch: ', data);
      console.log('qty: ', data.items[line_num].quantity);
      // {
      //   "quantity": 3,
      //   "id": "39540031127731"
      // }


    })
    .catch(error => console.error('Error:', error));

  }
</script>


<button on:click={increment}>+</button>