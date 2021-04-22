<script>
  import { count_1, count_2 } from './store.js';
  import Element from './Element.svelte';
  export let id;
  export let URL;
  export let title;
  export let imgURL;
  export let price;
  export let quantity;

  export let line_num;

  // $: quantity = $count;

  console.log('line_num: ', line_num);
  
</script>

<div class="item" data-variant-id={id}>

  
  <div class="img-container">
    <img height="100" src="{imgURL}" alt=""/>
    <!-- <div class="img"></div> -->
  </div>

  <div class="info-container">
    <a href="{URL}">{title}</a>

    <!-- This should now re-render when $count is updated (we auto-subscribe with $-prefix) -->
    <!-- $count is first set when <Element /> is created by passing it the quantity value from gettting the cart on page load -->
    <!-- $count is updated in the POST request's count.update( callback ) -->
    {#if line_num == 0}
       <p>Quantity:{$count_1} @ Price: {price}</p>
    {:else}
       <p>Quantity:{$count_2} @ Price: {price}</p>
    {/if}
  </div>

  <div class="qty-container">

    <!-- Step 0: Create a subscriber to get Element-Increment component to pass quantity information up to Item component -->
    <!-- Step 1: Grab quantity/id of this line item from props that are set from page load when cart is grabbed -->
    <!-- Step 2: Pass quantity/id down to Element -->
    <!-- Step 3: Pass this data down to Increment/Decrement and store in local variables there -->
    <!-- Step 4: When increment button is first update local value of quantity  -->
    <!-- Step 5: Then, make a POST request to /cart/change.js passing with local ID and local quantity. -->
    <!-- Step 6: Upon response from successful update of quantity on server, pass the new quantity up to Item component for line-item via subscriber to update line-item display of quantity -->

    <Element line_num={line_num} line_item_id={id} line_item_qty={quantity}/>

  </div>

  <div class="remove-container"></div>
</div>

<style>
  .item {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 100px 50px;
    grid-template-areas: 
      /* 'a b' */
      /* 'c d'; */
      'a a b b b b'
      'c c c d d d';
  }

  .img-container {
    grid-area: a;
    background: darkorange;
  }

  .info-container {
    grid-area: b;
    background: lightcyan;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas: 
      'info-top'
      'info-bottom';
  }
  .info-container > a {
    grid-area: info-top;
    font-size: 1.4em;
    color: var(--text-color-1);
  }
  .info-container > p {
    grid-area: info-bottom;
  }

  .qty-container {
    grid-area: c;
    background: red;
  }

  .remove-container {
    grid-area: d;
    background: yellow;
  }
</style>