document.addEventListener("DOMContentLoaded", function() {
  const qs = (target) => document.querySelector(target);
  const josh = new class {
    qs(target, elem=null) {
      if (elem === nul)
        return document.querySelector(target);
      else
        return elem.querySelector(target);
    }
  };

  // Declare necessary parent scope variables
  let cartTotal = 0;
  let items = [];

  // Assigning DOM elements to variables
  const $AddToCartForm = $('#AddToCartForm');

  // Function: takes a list of items and a single item as arguments 
  // and returns a filtered array based on whether a match has been found
  const variantAlreadyExists = (items, newItem) => {
    return items.filter(obj => {
      return obj.id === newItem.id
    });
  };

  // Function: takes a cart object, updates parent scope variables,
  // divides prices by 100 and renders the cart using Mustache
  const handleCartResponse = (data) => {

    // Update parent scope variables
    cartTotal = data.total_price;
    items = data.items;
  
    // Divide prices by 100 to get the dollar value
    data.total_price = data.total_price / 100;
    data.items.forEach(item => {
      item.price = item.price / 100;
      item.line_price = item.line_price / 100;
    });
  
    // Render cart template with Mustache
    const output = Mustache.render(template, data, {}, ['<%', '%>']);

    const cart_goes_here = document.querySelector('#cart-goes-here');
    cart_goes_here.innerHTML = output;

    set_qty_btn_listeners();
  }

  // Asynchronous function for handling GET '/cart.js' request
  async function getCart() {
    console.log('getCart()');
    const response = await fetch('/cart.js');
    const data = await response.json();
    handleCartResponse(data);
  }

  // Run previous function on page load
  getCart();

  // Add item to the cart
  const add_to_cart_form = document.querySelector('#AddToCartForm');
  add_to_cart_form.addEventListener('submit', (e) => {

    // Prevent standard form submit
    e.preventDefault();

    const y        = add_to_cart_form;
    const y_select = y.querySelector('#productSelect');
    const y_select_options = y_select.options;
    const y_select_selectedIndex = y_select.selectedIndex;
    const y_select_value = Number(y_select_options[y_select_selectedIndex].value);

    const quantity = Number(add_to_cart_form.querySelector('#Quantity').value);

    let formData = {
      'items': [{
        'id': y_select_value,
        'quantity': quantity
      }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      const item = data.items[0];

      // Update cart total
      cartTotal = cartTotal + item.price;
      $('.cart__pricing-total-cost').html(`<strong>$${cartTotal / 100}</strong>`);

      // Check if item already exists in the cart
      const existingItem = variantAlreadyExists(items, item);
      if(existingItem.length > 0) {
        
        // If so, find the item via its id and update UI using jQuery 
        const $item = $(`.item[data-variant-id=${existingItem[0].id}]`);
      
        $item.find('.cart__qty-num').val(item.quantity);
        $item.find('.variant-price.au').html(`$${item.line_price / 100}`);
      } else {
        
        // If not...
      
        // Add new item to items array
        items.push(item);
      
        // Divide prices by 100 to get the dollar value
        item.price = item.price / 100;
        item.line_price = item.line_price / 100;
      
        // Render line item template with Mustache
        const output = Mustache.render(templateLineItem, item, {}, ['<%', '%>']);
        $('#cart-goes-here .items').append(output);

        set_qty_btn_listeners();
      }

    })
    .catch((error) => {
      console.log('josh 2');
      console.error('Error:', error);
    });

  });



  // Function: adjusts qty of a line item
  const adjustQty = (e, adjustment) => {

    // Find the current quantity and variant ID of the item
    const itemVariantId = $(e.currentTarget).closest('.item').data('variant-id');
    const qtyInput = $(e.currentTarget).siblings('.cart__qty-num');
    const currentQty = Number(qtyInput.val());
  
    // Apply the adjustment to the current quantity to get the new quantity
    const newQty = currentQty + adjustment;

    // Send a POST request to '/cart/change.js' with the new quantity and variant ID
    $.post('/cart/change.js', { quantity: newQty, id: itemVariantId }).then((response) => {
      if(response) {
        
        // Parse and store JSON response
        const data = JSON.parse(response);
      
        // Update the quantity input with the new value
        qtyInput.val(newQty);

        // If new quantity is less than one, simply remove the line item from the DOM
        // Else re-render the cart
        if(newQty < 1) {
          
          // Hide the DOM element
          $item = $(e.currentTarget).closest('.item');
          $item.hide();
        
          // Update parent scope variables
          items = data.items;
          cartTotal = data.total_price;
        
          // Update total price
          const cart__pricingTotalCost = document.querySelector('.cart__pricing-total-cost');
          const strong = cart__pricingTotalCost.querySelector('strong');
          strong.innerHTML = `$${cartTotal / 100}`;
        } else {
          handleCartResponse(data);
        }
      }
    });
  }

  // Increase Quantity Trigger
  const set_qty_btn_listeners = () => {
    qs('.cart__qty--plus').addEventListener( 'click', event => adjustQty(event, +1));
    qs('.cart__qty--minus').addEventListener('click', event => adjustQty(event, -1));
  };

});