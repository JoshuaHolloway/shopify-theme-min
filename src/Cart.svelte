<script>
  import Item from './Item.svelte';
  import getCart from './getCart.js';
  const toDollars = (cents) => (Number(cents) / 100).toFixed(2);

  // --------------------------------------------------------
  let total_price = 0;
  let arr = [];

  // --------------------------------------------------------

  async function renderCart() {

    const data = await getCart();
    const items = data.items;

    items.forEach((item, idx) => {

      arr[idx] = {
        id:  item.id,
        URL: item.url,
        title: item.title,
        imgURL: item.featured_image.url,
        price: toDollars(item.price)
      };
      
      const price = item.price;
      const qty = item.quantity;

      total_price += price * qty;
    });
    total_price = toDollars(total_price); 
  };

  renderCart();
</script>

<h1>Total Price: ${total_price}</h1>
{#each arr as item}
  <Item id={item.id} URL={item.URL} title={item.title} imgURL={item.imgURL} price={item.price}/>
{/each}