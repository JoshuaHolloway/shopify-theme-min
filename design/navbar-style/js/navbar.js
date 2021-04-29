let tween;
let prev_scrollY = 0;
// let was_previously_scrolling_up = true; 
// let change_scroll_direction = true;

let scroll_direction = false; // false = down,  true = up

const hide_navbar = () => {
  tween = gsap.to('nav', {
    yPercent: -100,
    duration: 0.3
  }); // tween = gsap.to('', {})
}; // hide_navbar()
const show_navbar = () => tween.reverse();

window.addEventListener('scroll', () => {

  if (scrollY < prev_scrollY) // scrolling up
  {
    if (scroll_direction === true) {
      console.log('changed to scrolling up');
      show_navbar();
      scroll_direction = false;
    } else {
      console.log('scrolling up');
    }
  }
  else // scrolling down
  {
    if (scroll_direction === false){
      console.log('changed to scrolling down');
      hide_navbar();
      scroll_direction = true;
    } else {
      console.log('scrolling down');
    }
  } 

  // update previous scroll postions
  prev_scrollY = scrollY;
}); // window.addEventListener('scroll', () => {})
