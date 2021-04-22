<script>
  import Item from './Item.svelte';
  import CheckoutButton from './CheckoutButton.svelte';
  import getCart from './getCart.js';
  import {toDollars} from './utils.js';

  // --------------------------------------------------------
  let total_price = 0;
  let arr = [];
  // --------------------------------------------------------

  async function renderCart() {

    const data = await getCart();
    const items = data.items;

    items.forEach((item, idx) => {
      console.log('item:');
      console.log(item);

      arr[idx] = {
        id:  item.id,
        URL: item.url,
        title: item.title,
        imgURL: item.featured_image.url,
        price: toDollars(item.price),
        quantity: item.quantity
      };
      
      const price = item.price;
      const qty = item.quantity;

      total_price += price * qty;
    });
    total_price = toDollars(total_price); 
  };

  renderCart();




  const change_1 = () => {
    const data_obj = { "quantity": String(5), "id": "39540088832179" };
    // const data_obj = { "line": 1, "quantity": 7,  };
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data_obj)
      // body: data_obj
    })
    .then(response => response.json())
    .then(data => {
      console.clear();
      console.log('Svelte Fetch: ', data);
    })
    .catch(error => console.error('Error:', error));
  };

  const change_2 = () => {
    const data_obj = { "quantity": String(5), "id": "39540088832179:6881ee5f9fc473f02da20f6049955538" };
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
    })
    .catch(error => console.error('Error:', error));
  };
</script>

<!-- ============================ -->

<div class="checkout-button-container">
  <h1>Subtotal: ${total_price}</h1>
  <CheckoutButton />
</div>

{#each arr as item, idx}
  <hr>
  <Item 
    id={item.id} 
    URL={item.URL} 
    title={item.title} 
    imgURL={item.imgURL} 
    price={item.price}
    quantity={item.quantity}
    line_num={idx}
  />
{/each}
<hr>

<button on:click={change_1}>Change Item 1</button>

<!-- ============================ -->

<style>
  .checkout-button-container {
    padding: 0 20px;
  }
</style>