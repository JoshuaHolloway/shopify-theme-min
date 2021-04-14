<script>
  import Cart from './Cart.svelte';

	// export let price;
  export let qty_in_cart = 0;



  // - - - - - - - - - - - - - - - - - - - 

  const handlePlus  = () => ++qty_in_cart;
  const handleMinus = () => {
    if (qty_in_cart > 0) 
      --qty_in_cart; 
    else
      alert('TODO: Handle removing item from cart!');
  }

</script>


<h1>josh 1</h1>
<Cart />
<h1>josh 2</h1>

<div id="container">

  <div id="id-container">
    <button on:click={handleMinus}>-</button>
    <p>{qty_in_cart}</p>
    <button on:click={handlePlus}>+</button>
  </div>

  <!-- <h1>Total Price: ${price}</h1> -->
  <h5>Quantity In Cart: {qty_in_cart}</h5>
</div>

<style>
  * { box-sizing: border-box; }
  #container {
    background: deepskyblue;
  }
  #id-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    background: hotpink;
    width: 120px;
    height: 50px;
  }
  #id-container button {
    height: 100%;
    width: 40px;
  }
</style>