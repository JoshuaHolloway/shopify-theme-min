let tween;
let prev_scrollY = 0;

let is_navbar_hidden  = false;
let is_navbar_showing = true;  // TODO: remove redundant variable

// ==============================================

const hide_navbar = () => {

  is_navbar_hidden  = true;
  is_navbar_showing = false;

  tween = gsap.to('nav', {
    yPercent: -100,
    duration: 0.3, 
    onStart: () => { // only want these to change once first start scrolling
      // is_navbar_hidden  = true;
      // is_navbar_showing = false;
    }, // onStart()
  }); // tween = gsap.to('', {})
}; // hide_navbar()

// ==============================================

const show_navbar = () => {
  is_navbar_hidden  = false;
  is_navbar_showing = true;
  tween.reverse();
}; // show_navbar()

// ==============================================

window.addEventListener('scroll', () => {

  if (scrollY < prev_scrollY) // scrolling up
  {
    if (is_navbar_hidden === true) {
      // console.log('changed to scrolling up');
      show_navbar();
    } 
    // else {
    //   console.log('scrolling up, scrollY: ', scrollY);
    // }
  }
  else // scrolling down
  {

    if (is_navbar_showing === true){
      // console.log('changed to scrolling down');
      hide_navbar();
    } 
    // else {
    //   console.log('scrolling down, scrollY: ', scrollY);
    // }
  } 

  // update previous scroll postions
  prev_scrollY = scrollY;
}); // window.addEventListener('scroll', () => {})
