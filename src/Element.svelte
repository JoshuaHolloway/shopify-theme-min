<script>
  
  import Increment from './Elem-Increment.svelte';
  import Decrement from './Elem-Decrement.svelte';

  export let line_item_id;
  export let line_item_qty;

  export let line_num;

</script>

<div class="qty-container">
  <Increment 
    line_num={line_num}
    line_item_id={line_item_id} 
    line_item_qty={line_item_qty}
  />
  <span>{line_item_qty}</span>
  <Decrement />
</div>

<style>
  .qty-container {
    background: blue;
  }
</style>