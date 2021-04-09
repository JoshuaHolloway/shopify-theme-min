document.addEventListener("DOMContentLoaded", function() {

    // Declare necessary parent scope variables
    let cartTotal = 0;
    let items = [];

    // Assigning DOM elements to variables
    const $AddToCartForm = $('#AddToCartForm');
    const template = document.getElementById('template').innerHTML;
    const lineItemtemplate = document.getElementById('lineItemTemplate').innerHTML;
  
    // Specifying custom delimiters (as curly brackets are already in use)
    var customTags = [ '<%', '%>' ];

    // Function: takes a list of items and a single item as arguments 
    // and returns a filtered array based on whether a match has been found
    const variantAlreadyExists = (items, newItem) => {
        return items.filter(obj => {
            return obj.id === newItem.id
        })
    }
  
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
        const output = Mustache.render(template, data, {}, customTags);
        $('#cart-goes-here').html(output);
    }

    // Asynchronous function for handling GET '/cart.js' request
    async function getCart() {
        const response = await $.get('/cart.js');
        const data = JSON.parse(response);
      
        handleCartResponse(data);
    }

    // Run previous function on page load
    getCart();


    
    // Add item to the cart
    const add_to_cart_form = document.querySelector('#AddToCartForm');
    add_to_cart_form.addEventListener('submit', (e) => {
      console.log('josh: submitted!');
      // Prevent standard form submit
        e.preventDefault();
      
        // Use the form to send a POST request to '/cart/add.js'
        $.post('/cart/add.js', $AddToCartForm.serialize())
          .then(response => {
            
            // Parse and store the added item
            const item = JSON.parse(response);
          
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
                const output = Mustache.render(lineItemtemplate, item, {}, customTags);
                $('#cart-goes-here .items').append(output);
            }
  
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
                    $('.cart__pricing-total-cost').html(`<strong>$${cartTotal / 100}</strong>`);
                } else {
                  handleCartResponse(data);
                }
            }
        });
    }

    // Increase Quantity Trigger 
    $(document).on('click','.cart__qty--plus',  (e) => adjustQty(e, 1));

    // Decrease Quantity Trigger 
    $(document).on('click','.cart__qty--minus',  (e) => adjustQty(e, -1));
});
