document.addEventListener("DOMContentLoaded", function() {
  const qs = (target) => document.querySelector(target);

  // Declare necessary parent scope variables
  let cartTotal = 0;
  let items = [];



  // Add item to the cart
  const add_to_cart_form = document.querySelector('#AddToCartForm');

  if (add_to_cart_form) {
    
    add_to_cart_form.addEventListener('submit', (e) => {
  
      // Prevent standard form submit
      e.preventDefault();
  
      console.clear();
      console.log('Form: ', add_to_cart_form);
   
  
      const y        = add_to_cart_form;
      const y_select = y.querySelector('#productSelect');
      const y_select_options = y_select.options;
      const y_select_selectedIndex = y_select.selectedIndex;
      const y_select_value = Number(y_select_options[y_select_selectedIndex].value);
  
      const quantity = Number(add_to_cart_form.querySelector('#Quantity').value);
  
  
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
      // TODO: Get the Variant ID!
  
  
  
  
  
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
  
  
        // NOTE: Can do this all before the request to the server!
        // NOTE: Can do this all before the request to the server!
        // NOTE: Can do this all before the request to the server!
        // NOTE: Can do this all before the request to the server!
        // NOTE: Can do this all before the request to the server!
        const new_item_variant_id = item.variant_id;
  
        console.log('ADD to cart response successful!');
  
        // Step 1: Search through the line items already in cart
        const current_cart_items = document.querySelectorAll('#app .item');
        console.log('current_cart_items: ', current_cart_items);
        current_cart_items.forEach((cart_item, idx) => {
          console.log('cart_item', cart_item);
  
          // -Compare newly attempted add of item with cart
          //  by comparing data-variant-id
          const line_item_variant_id = Number(cart_item.dataset.variantId);
  
          console.log('==========================================');
          console.log('line_item_variant_id: ', line_item_variant_id, ', type: ', typeof line_item_variant_id);
          console.log('new_item_variant_id:  ', new_item_variant_id, ', type: ', typeof new_item_variant_id);
  
          if (new_item_variant_id === line_item_variant_id) {
            // alert('item is already in cart!');
            console.log('gsap: ', gsap);
            const timeline = gsap.timeline();
            timeline.fromTo(cart_item, {fontSize: '1.0em', color: 'black'}, {fontSize: '1.1em', color: 'red', duration: 1,
              onStart: () => {
                // cart_item.style.border = 'dashed 10px darkorange';
              }});
            timeline.fromTo(cart_item, {fontSize: '1.1em', color: 'red'}, {fontSize: '1.0em', color: 'black', duration: 1, 
              onComplete: () => {
                // cart_item.style.border = '';
            }});
          }
  
        });
  
  
        // Step 2: If item is not already in cart, then add to cart 
        //           by pushing onto 'cart' variable in Item.svelte
        //           to re-render cart
  
  
  
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

  }

});