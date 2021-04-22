<script>
  import { counts } from './store.js';
  import Element from './Element.svelte';
  export let id;
  export let URL;
  export let title;
  export let imgURL;
  export let price;
  export let quantity;

  export let line_num;
  const count = counts[line_num];

  console.log('line_num: ', line_num);
  
</script>

<div class="item" data-variant-id={id}>

  <div class="img-container">
    <img height="100" src="{imgURL}" alt=""/>
  </div>

  <div class="info-container">
    <a href="{URL}">{title}</a>
    <p>JOSH Quantity:{$count} @ Price: {price}</p>
  </div>

  <div class="qty-container">
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