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

<!-- ============================ -->

<style>
  .checkout-button-container {
    padding: 0 20px;
  }
</style>