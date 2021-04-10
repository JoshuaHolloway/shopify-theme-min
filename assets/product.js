// const template = `
//     <div>
//     <div class="items">
//         <%#items%>
//         <div class="item" data-variant-id="<%id%>">
//             <div class="row cart__row">
//                 <div class="col-md-4 col-sm-4 col-4">
//                     <img alt="" src="<%featured_image.url%>">
//                 </div>
//                 <div class="col-md-8 col-sm-8 col-8">
//                     <p>
//                         <a href="<%url%>" class="cart__product-name">
//                             <span><%title%></span>
//                         </a>
//                         <%#options_with_values%><span class="cart__product-meta"><%name%>: <%value%></span><%/options_with_values%>
//                         <span class="cart__product-meta" >$<%price%></span>
//                     </p>
//                     <div class="row--full display-table">
//                         <div class="row__item display-table-cell one-half">
//                             <div class="cart__qty">
//                                 <button type="button" class="x-button cart__qty-adjust cart__qty--minus">
//                                     <span aria-hidden="true" class="icon icon-minus"></span>
//                                     <span aria-hidden="true" class="fallback-text">−</span>
//                                 </button>
//                                 <input type="text" pattern="[0-9]*" class="cart__qty-num" value="<%quantity%>">
//                                 <button type="button" class="x-button cart__qty-adjust cart__qty--plus">
//                                     <span aria-hidden="true" class="icon icon-plus"></span>
//                                     <span aria-hidden="true" class="fallback-text">+</span>
//                                 </button>
//                             </div>
//                         </div>
//                         <div class="row__item display-table-cell one-half text-right"><span class="variant-price au">$<%line_price%></span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <%/items%>
//         </div>
//         <div class="cart__footer">
//             <div class="cart__footer--empty">
//                 <!---->
//             </div>
//             <div class="row cart__footer-extra">
//                 <div class="col-md-6 col-sm-6 col-xs-6">
//                     <p class="x-p cart__pricing-title">Shipping</p>
//                 </div>
//                 <div class="col-md-6 col-sm-6 col-xs-6 text-right">
//                     <p class="x-p cart__pricing-cost"><strong>FREE</strong></p>
//                 </div>
//                 <!---->
//             </div>
//             <div class="row cart__footer-total">
//                 <div class="col-md-6 col-sm-6 col-xs-6">
//                     <p class="x-p cart__pricing-total-title">Subtotal</p>
//                 </div>
//                 <div class="col-md-6 col-sm-6 col-xs-6 text-right">
//                     <p class="x-p cart__pricing-total-cost"><strong>$<%total_price%></strong></p>
//                 </div>
//             </div>
//             <a href="/checkout" id="checkoutButton" class="btn btn--secondary btn--full cart__cta">
//                 Check Out
//             </a>
//         </div>
//     </div>
// `;

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

      // Prevent standard form submit
      e.preventDefault();
      console.log('josh: submitted!');


      const x        = $AddToCartForm;
      const x_serial = $AddToCartForm.serialize();
      console.log('x: ', x);
      console.log('x_serial: ', x_serial);
      // id=39540031127731&quantity=1

      const y        = add_to_cart_form;
      const y_select = y.querySelector('#productSelect');
      const y_select_options = y_select.options;
      const y_select_selectedIndex = y_select.selectedIndex;
      const y_select_value = y_select_options[y_select_selectedIndex].value;
      // console.log('y: ', y);
      // console.log('y_select: ', y_select);
      // console.log('y_select_options: ', y_select_options);
      // console.log('y_select_selectedIndex: ', y_select_selectedIndex);
      // console.log('y_select_value: ', y_select_value);

      const z = add_to_cart_form.querySelector('#Quantity');
      const z_value = z.value;
      // console.log('z: ', z);
      // console.log('z.value: ', z_value);

      const A_serial = `id=${y_select_value}&quantity=${z_value}`;
      const A_obj = {
        "id": y_select_value,
        "quantity": z_value
      };



      // var myUrl = '/cart/add.js';
      // var myData = {
      //   firstName: 'Joe',
      //   lastName: 'Smith'
      // };
      // //axios.post(myUrl, myData, {
      // axios.post(myUrl, A_obj, {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'key': '12345'
      //     }
      //     // other configuration there
      //   })
      //   .then(function (response) {
      //     alert('yeah!');
      //     console.log(response);
      //   })
      //   .catch(function (error) {
      //     alert('oops');
      //     console.log(error);
      //   })
      // ;

        let formData = {
        'items': [{
          'id': 39540031127731,
          'quantity': 2
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
            console.log('item: ', item);

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
