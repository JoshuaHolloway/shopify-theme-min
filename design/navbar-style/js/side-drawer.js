import { element_geometry, viewport_geometry } from './geometry.js';

// ==============================================

const hamburger = document.querySelector('#nav-mobile .hamburger');
const side_drawer = document.querySelector('#side-drawer');
const side_drawer_close_button = side_drawer.querySelector('.side-drawer__close-button');

// ==============================================

// Get geometry of side-drawer and window:
const sidedrawer = document.querySelector('#side-drawer'); // $side-drawer-width  defined in  _side-drawer.scss 
const sidedrawer_width = element_geometry(sidedrawer).w;
const {viewport_width} = viewport_geometry();

// ==============================================

// ==============================================

const open_side_drawer = () => {

  tween = gsap.to(side_drawer, {
    x: -sidedrawer_width,
    onComplete: () => {
      console.log('animation complete');

      window.addEventListener('click', (event) => {
        console.log('event.clientX: ', event.clientX, ',  event.clientY: ', event.clientY, ',  viewport_width - sidedrawer_width: ', viewport_width - sidedrawer_width);

        if (event.clientX < viewport_width - sidedrawer_width) {
          console.log('clicked outside the side-drawer!');
          close_side_drawer();
        }
      });

    }, // onComplete()
    onReverseComplete: () => {
      console.log('onReverseComplete()');
    }, // onReverse()
  });

}; // open_side_drawer()

const close_side_drawer = () => {
  tween.reverse();
}; // close_side_drawer()

// ==============================================

let count = 0;
// let tween =  gsap.from(side_drawer, {x: 200, paused: true});
let tween = gsap.timeline();
hamburger.addEventListener('click', () => {

  console.log('open nav-drawer');
  open_side_drawer();
});

// ==============================================

side_drawer_close_button.addEventListener('click', () => {

  console.log('close nav-drawer');
  close_side_drawer();

});



// ==============================================