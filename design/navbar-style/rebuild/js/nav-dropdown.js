// ==============================================

import { element_geometry, viewport_geometry } from './geometry.js';
import { enable_scroll_listener, 
        disable_scroll_listener } from './hide-navbar.js';

// ==============================================

let master_timeline;
const duration = 0.5;

// ==============================================

const nav_items = gsap.utils.toArray('.nav-desktop .nav-item');
console.log('nav_items: ', nav_items);

// ==============================================

const blur_container = document.querySelector('.blur-container-2');
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


const slide = (className) => {

  const timeline = gsap.timeline();

  timeline.to(className, {
    duration,
    yPercent: 100,
    onStart: () => {
      disable_nav_item_click_listeners();
    }, // onStart()
    onComplete: () => {
      listen_for_click_outside_of_element('add');
      disable_scroll_listener();
    }, // onComplete()
    onReverseComplete: () => {
      listen_for_click_outside_of_element('remove');
      enable_scroll_listener();
      enable_nav_item_click_listeners();
    }, // onReverseComplete()
  });

  // - - - - - - - - - - - - - - - - - - - - - - 

  const click_outside_of_element_listener = (event) => {

    const element = document.querySelector(className);
    const {y1: element_top, y2: element_bottom} = element_geometry(element);
    const {viewport_height: vh} = viewport_geometry();

    const y = event.clientY;

    console.log('y: ', y, 'vh: ', vh,  'element_bottom: ', element_bottom);
    
    if (y < element_top) {
      // avoid being able to open the navbar dropdown twice
      event.preventDefault(); // this does not fix it

      // NEED TO REMOVE EVENT LISTENER ON THE ELEMENTS

      console.log('WANT TO DO NOTHING WITH CLICK EVENT');
    }
    else if (y > element_bottom) {
      console.log('clicked outside the side-drawer!');
      close();
    }
  };

  // - - - - - - - - - - - - - - - - - - - - - - 

  const listen_for_click_outside_of_element = (option) => {
    if (option === 'add')
      window.addEventListener('click',    click_outside_of_element_listener);
    else if (option === 'remove')
      window.removeEventListener('click', click_outside_of_element_listener);
  };

  return timeline;
}; // slide_side_drawer()

// ==============================================

const open = () => {
  // -currently only used in click listener for
  //  clicking hamburger button in navbar

  console.log('clicked hamburger');
  
  master_timeline = gsap.timeline();
  master_timeline.add( blur_background() );
  master_timeline.add( translucent_overlay(), '<' );
  master_timeline.add( slide('.nav-dropdown'),   '<' );

};

// ==============================================

const close = () => {
  // -currently only used in click listener for
  //  clicking outside of the side-drawer
  master_timeline.reverse();
}; // close()


// ==============================================

const enable_nav_item_click_listeners = () => {
  nav_items.forEach((nav_item) => {
    nav_item.addEventListener('click', click_listener);
  });
};

// ==============================================

const disable_nav_item_click_listeners = () => {
  nav_items.forEach((nav_item) => {
    nav_item.removeEventListener('click', click_listener);
  });
};

// ==============================================

const click_listener = (event) => {
  event.preventDefault();

  // yPercent: 100
  open();
};

// ==============================================

enable_nav_item_click_listeners();

// ==============================================