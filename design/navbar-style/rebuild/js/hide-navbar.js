// ==============================================

let tween;
let prev_scrollY = 0;

let is_navbar_hidden  = false;

// ==============================================

const hide_navbar = () => {
  is_navbar_hidden  = true;
  tween = gsap.to('nav', {
    yPercent: -100,
    duration: 0.3, 
  }); // tween = gsap.to('', {})
}; // hide_navbar()

// ==============================================

const show_navbar = () => {
  is_navbar_hidden  = false;
  tween.reverse();
}; // show_navbar()

// ==============================================

window.addEventListener('scroll', () => {

  if (scrollY < prev_scrollY) // scrolling up
  {
    if (is_navbar_hidden === true) 
      show_navbar();
  }
  else if (is_navbar_hidden === false)
      hide_navbar();
  prev_scrollY = scrollY;
}); // window.addEventListener('scroll', () => {})

// ==============================================