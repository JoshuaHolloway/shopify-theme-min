import { element_geometry, viewport_geometry } from './geometry.js';

// ==============================================

let master_timeline;
const duration = 0.5;

// ==============================================

const blur_container = document.querySelector('.blur-container');
const blur_background = () => {

  const timeline = gsap.timeline();

  timeline.to(blur_container, {
    duration,
    filter: 'blur(4px)',
  }); // .to()
  
  return timeline;
}; // blur_background()

// ==============================================

const overlay = document.querySelector('.overlay');
const translucent_overlay = () => {

  const timeline = gsap.timeline();
  
  timeline.to(overlay, {
    duration,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    onStart:           () => overlay.style.zIndex = 1,
    onReverseComplete: () => overlay.style.zIndex = -1,
  }); // .to()

  return timeline;
}; // translucent_overlay()

// ==============================================

const side_drawer = document.querySelector('.side-drawer'); // $side-drawer-width  defined in  _side-drawer.scss 
const side_drawer_width = element_geometry(side_drawer).w;
const {viewport_width} = viewport_geometry();
const slide_side_drawer = () => {

  const timeline = gsap.timeline();

  timeline.to(side_drawer, {
    duration,
    x: -side_drawer_width,
    onComplete: () => {
      listen_for_click_outside_of_side_drawer('add');
    }, // onComplete()
    onReverseComplete: () => {
      listen_for_click_outside_of_side_drawer('remove')
    }, // onReverseComplete()
  });

  const click_outside_of_side_drawer_listener = (event) => {
    const click_x_pos = event.clientX;
    const side_drawer_left_x_pos = viewport_width - side_drawer_width;
    if (click_x_pos < side_drawer_left_x_pos) {
      console.log('clicked outside the side-drawer!');
      close_side_drawer();
    }
  };

  const listen_for_click_outside_of_side_drawer = (option) => {
    if (option === 'add')
      window.addEventListener('click', click_outside_of_side_drawer_listener);
    else if (option === 'remove')
      window.removeEventListener('click', click_outside_of_side_drawer_listener);
  };

  return timeline;
}; // slide_side_drawer()

// ==============================================

const open_side_drawer = () => {
  // -currently only used in click listener for
  //  clicking hamburger button in navbar

  console.log('clicked hamburger');
  
  master_timeline = gsap.timeline();
  master_timeline.add( blur_background() );
  master_timeline.add( translucent_overlay(), '<' );
  master_timeline.add( slide_side_drawer(),   '<' );

};

// ==============================================

const close_side_drawer = () => {
  // -currently only used in click listener for
  //  clicking outside of the side-drawer
  master_timeline.reverse();
}; // close_side_drawer()

// ==============================================

const nav__hamburger  = document.querySelector('.nav__hamburger');
nav__hamburger.addEventListener('click', open_side_drawer); // nav__hamburger.addEventListener('click', ()=>{})

// ==============================================