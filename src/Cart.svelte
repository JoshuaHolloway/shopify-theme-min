<script>
  import Item from './Item.svelte';
  import CheckoutButton from './CheckoutButton.svelte';
  import getCart from './getCart.js';
  import {toDollars} from './utils.js';

  // --------------------------------------------------------
  let total_price = 0;
  let arr = [];

  const f_remove = (e) => {
    arr = arr.filter((elem, idx) => {
      return idx !== e.detail
    });
  };

  // --------------------------------------------------------

  // -Force re-grab of entire cart and re-render
  //  if quantity of any row drops below zero
  //  after initialization
  // -TODO: Remove this and just remove row without
  //        re-grabing entire cart

  // -Wait, re-render will not re-trigger the javascript
  //  code in this script unless we explicity tell it to 
  //  in a reactive block.
  // -We DO want a re-render of th e

  // --------------------------------------------------------

  // --------------------------------------------------------
  let items;
  async function renderCart() {

    const data = await getCart();
    items = data.items;

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
    f={f_remove}
    items={items}
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