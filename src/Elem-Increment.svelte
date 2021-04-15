<script>
  import {count} from './store.js';

  function increment() {
    let x;
    count.update(n => {
      x = n + 1;
      return x;
    });


    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "quantity": x, "id": "39540031127731" })
    })
    .then(response => response.json())
    .then(data => {
      // console.clear();
      console.log({ "quantity": x, "id": "39540088832179" });
      console.log('Svelte Fetch: ', data);
      console.log('qty: ', data.items[0].quantity);
      // {
      //   "quantity": 3,
      //   "id": "39540031127731"
      // }


    })
    .catch(error => console.error('Error:', error));

  }
</script>


<button on:click={increment}>+</button>