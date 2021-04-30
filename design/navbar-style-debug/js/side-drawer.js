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

let timeline = gsap.timeline();
const open_side_drawer = () => {

  const duration = 2.3;
  timeline = gsap.timeline();
  timeline.to(side_drawer, {
    duration: duration,
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

  const nav_mobile = document.querySelector('#nav-mobile');
  const blur_container = document.querySelector('#blur-container');
  timeline.to(blur_container, {
    duration: duration,
    filter: 'blur(3px)',
    onStart: () => {
      console.log('starting blur');
      nav_mobile.style.transform = `translateY(${scrollY}px)`;
    }, // onStart()
    onReverseComplete: () => {
      nav_mobile.style.transform = `translateY(${0}px)`;
    }, // onReverseComplete()
  }, '<'); // .to()
  
  // const overlay = document.querySelector('.overlay');
  // timeline.to(overlay, {
  //   duration: duration,
  //   backgroundColor: 'rgba(0, 0, 0, 0.3)',
  //   onStart:           () => overlay.style.zIndex = 1,
  //   onReverseComplete: () => overlay.style.zIndex = -1,
  // }, '<'); // .to()

}; // open_side_drawer()

const close_side_drawer = () => {
  timeline.reverse();
}; // close_side_drawer()

// ==============================================

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