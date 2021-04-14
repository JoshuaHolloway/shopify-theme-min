<script>
  export let __id_;
  export let __URL_;
  export let __title_;
  export let __imgURL_;
  export let __price_;
</script>

<div class="item" data-variant-id={__id_}>

  <a href="{__URL_}">{__title_}</a>
  <img height="150" src="{__imgURL_}" alt=""/>
  <p>{__price_}</p>
</div>