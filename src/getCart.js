import {Timer} from './timer';
const timer = new Timer();
timer.state();

// const timer1 = new Timer();
// const timer2 = new Timer();

// - - - - - - - - - - - - - - - - - - - 

// console.log('BEGIN AJAX request to /cart.js');  
// timer1.tic();
// const cartContents = fetch('/cart.js')
//   .then(response => response.json())
//   .then(data => {
//     console.log('END AJAX response:');
//     // console.log(data);
//     // console.log(typeof data.total_price);
//     // price = (data.total_price / 100).toFixed(2);
//     timer1.toc();

//     // handleCartResponse(data);
//     return data;
//   });

// - - - - - - - - - - - - - - - - - - - 

// Asynchronous function for handling GET '/cart.js' request
timer.tic();
async function getCart() {
  console.log('getCart()');
  
  let timeDiff = timer.toc();
  console.log(`BEGIN AJAX request @ ${timeDiff.toFixed(0)}ms.`);
  const response = await fetch('/cart.js');
  const data = await response.json();
  console.log(data);
  timeDiff = timer.toc();
  console.log(`END AJAX response @ ${timeDiff.toFixed(0)}ms.`);
  return data;
}
export default getCart;