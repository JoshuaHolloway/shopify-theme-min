import {counts} from './store.js';
import {Timer} from './timer';

const timer = new Timer();
timer.state();

function do_change_quantity_post_request(
          line_item_id, 
          new_quanity_we_desire,
          line_num)
{
  timer.tic();

  const count = counts[line_num];

  const data_obj = { "quantity": String(new_quanity_we_desire), "id": String(line_item_id) };
  // const data_obj = { "line": 1, "quantity": 7,  };

  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data_obj)
  })
  .then(response => response.json())
  .then(data => {

    console.clear();
    console.log('Svelte Fetch: ', data);

    // New quantity has been succesfully changed on server
    const verified_new_quantity = data.items[line_num].quantity;

    // -Update quantity of line item (to display in component one level above)
    count.update(() => verified_new_quantity);

    const timeDiff = timer.toc();
    console.log(`END AJAX response @ ${timeDiff.toFixed(0)}ms.`);
  })
  .catch(error => console.error('Error:', error));
}

export default do_change_quantity_post_request;