import {Timer} from './timer';
// const timer = new Timer();
// timer.state();

// - - - - - - - - - - - - - - - - - - - 

// Asynchronous function for handling GET '/cart.js' request
// timer.tic();
async function getCart() {
  // console.log('getCart()');
  
  // let timeDiff = timer.toc();
  // console.log(`BEGIN AJAX request @ ${timeDiff.toFixed(0)}ms.`);
  const response = await fetch('/cart.js');
  const data = await response.json();
  // console.log(data);
  // timeDiff = timer.toc();
  // console.log(`END AJAX response @ ${timeDiff.toFixed(0)}ms.`);
  return data;
}
export default getCart;