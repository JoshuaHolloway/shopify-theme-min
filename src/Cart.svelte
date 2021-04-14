<script>
  import Item from './Item.svelte';
  import getCart from './getCart.js';
  const toDollars = (cents) => (Number(cents) / 100).toFixed(2);

  // --------------------------------------------------------
  let total_price = 0;
  let arr = [{
      id: 0,
      URL: '',
      title: '',
      imgURL: '',
      price: 0
    },{
      id: 0,
      URL: '',
      title: '',
      imgURL: '',
      price: 0
    } 
  ];

  // --------------------------------------------------------

  async function renderCart() {

    const data = await getCart();
    const items = data.items;

    items.forEach((item, idx) => {


      
      arr[idx].id     = item.id;
      arr[idx].URL    = item.url;
      arr[idx].title  = item.title;
      arr[idx].imgURL = item.featured_image.url;
      arr[idx].price  = toDollars(item.price);

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
  <Item __URL_={item.URL} __title_={item.title} __imgURL_={item.imgURL} __price_={item.price}/>
{/each}