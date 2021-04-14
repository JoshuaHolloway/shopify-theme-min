const toDollars = (cents) => (Number(cents) / 100).toFixed(2);

// --------------------------------------------------------

const populate_template = (item) => {
  const template = `
    <div class="item" data-variant-id=${item.id}>
    
      <a href="${item.url}">${item.title}</a>
      <img src="${item.featured_image.url}" alt=""/>
      <p>$${toDollars(item.price)}</p>
    </div>
  `;
  return template;
};

// --------------------------------------------------------

const renderCart = (data) => {
  console.log('render cart');
  console.log(data);

  const items = data.items;
  console.log('items:');
  console.log(items);

  let total_price = 0;
  const div = document.createElement('div');
  div.classList.add('items');
  items.forEach((item, idx) => {
    console.log(item);

    const price = item.price;
    const qty = item.quantity;

    total_price += price * qty;

    const div_item = document.createElement('div');
    div_item.innerHTML = populate_template(item);

    div.appendChild(div_item);
  });
  total_price = toDollars(total_price); 

  const cart_container = document.querySelector('#cart-container');
  const subtotal_elem = cart_container.querySelector('#cart-container__subtotal');
  subtotal_elem.textContent = `Subtotal: $${total_price}`;
  cart_container.appendChild(div);
  



};
export default renderCart;