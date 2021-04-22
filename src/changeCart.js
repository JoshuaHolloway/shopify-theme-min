import {counts} from './store.js';
import {Timer} from './timer';
const timer = new Timer();

function do_change_quantity_post_request(
          line_item_id, 
          current_quantity,
          new_quanity_we_desire,
          line_num)
{
  timer.tic();

  const count = counts[line_num];

  // -Make quantity update feel faster:
  // -Change quantity in line item display immediately.
  // -Then, if response fails, undo the change in quanity in data store.
  // -Else, leave change as is.

  // -Update quantity of line item (to display in component one level above)
  count.update(() => {
    console.clear();
    const dt = timer.toc();
    console.log(`update count in ${dt}ms.`);
    return new_quanity_we_desire;
  });


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

    
    console.log('Svelte Fetch: ', data);

    // New quantity has been succesfully changed on server
    const verified_new_quantity = data.items[line_num].quantity;
    if (verified_new_quantity !== new_quanity_we_desire)
      count.update(() => current_quantity);


    const timeDiff = timer.toc();
    console.log(`END AJAX response @ ${timeDiff}ms.`);
  })
  .catch(error => {
    count.update(() => current_quantity);
    console.error('Error:', error);
  });
}

export default do_change_quantity_post_request;