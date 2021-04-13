document.addEventListener("DOMContentLoaded", function() {
  const qs = (target) => document.querySelector(target);

  // Declare necessary parent scope variables
  let cartTotal = 0;
  let items = [];

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
      qs('.cart__pricing-total-cost').innerHTML = `JOSH: <strong>$${cartTotal / 100}</strong>`;

      // Check if item already exists in the cart
      const existingItem = variantAlreadyExists(items, item);
      if(existingItem.length > 0) {
        alert('TODO: Handle item already exists in cart!');
      } else {
        console.log('Render line item');
        
        // Add new item to items array
        items.push(item);
      
        // Divide prices by 100 to get the dollar value
        item.price = item.price / 100;
        item.line_price = item.line_price / 100;
      
        // Render line item template with Mustache
        const output = Mustache.render(templateLineItem, item, {}, ['<%', '%>']);
        qs('#cart-goes-here .items').innerHTML = output;
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

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "quantity": newQty, "id": String(itemVariantId) })
    })
    .then(response => response.json())
    .then(data => {
      console.log('fetch: ', data);

      // Update the quantity input with the new value
      qtyInput.val(newQty);

      // If new quantity is less than one, simply remove the line item from the DOM
      // Else re-render the cart
      if(newQty < 1) {
        alert('TODO: Handle when newQty < 1');
      } else {
        handleCartResponse(data);
      }
    })
    .catch(error => console.error('Error:', error));
  };

  // Increase Quantity Trigger
  const set_qty_btn_listeners = () => {
    qs('.cart__qty--plus').addEventListener( 'click', event => adjustQty(event, +1));
    qs('.cart__qty--minus').addEventListener('click', event => adjustQty(event, -1));
  };

});