<script>
  export let id;
  export let URL;
  export let title;
  export let imgURL;
  export let price;
</script>

<div class="item" data-variant-id={id}>

  <a href="{URL}">{title}</a>
  <img height="150" src="{imgURL}" alt=""/>
  <p>{price}</p>
</div>