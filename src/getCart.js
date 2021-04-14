// import {Timer} from './timer.js';
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
// timer2.tic();
async function getCart(f) {
  console.log('getCart()');
  const response = await fetch('/cart.js');
  const data = await response.json();

  console.log('END AJAX response:');
  // console.log(data);



  // console.log(typeof data.total_price);
  // price = (data.total_price / 100).toFixed(2);
//   timer2.toc();

//   handleCartResponse(data);
  f(data);
}
export default getCart;