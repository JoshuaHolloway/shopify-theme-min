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

const drodown_data = {
  'new_releases': [
    [
      'New & Featured',
      'Shop All New Arrivals',
      'SNKRS Launch Calendar',
      'Best of Air Max',
      'Member Access',
      'Top Picks for Mom',
      'Mix & Match with Mom'
    ],
    [],
  ],
  'men': [],
  'women': [],
  'kids': [],
  'customize': [],
  'sale': [],
};
const add_dynamic_dropdown_data = (className) => {



};

// ==============================================

const navbar = document.querySelector('.nav-desktop');
const nav_height = element_geometry(navbar).h;
const nav_dropdown = document.querySelector('.nav-dropdown');
const nav_dropdown_height = element_geometry(nav_dropdown).h;
const slide = (className) => {

  const timeline = gsap.timeline();

  timeline.to(className, {
    duration,
    // yPercent: 100,
    y: nav_height + nav_dropdown_height, 
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
    
    if (y < element_top) { // clicked in navbar region (above nav-dropdown)
      // avoid being able to open the navbar dropdown twice (done by removing listeners on all nav-items in function disable_nav_item_click_listeners())
      // event.preventDefault(); // this does not fix it
    }
    else if (y > element_bottom) { // clicked below opened nav-dropdown
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

  // Add dynamic data to dropdown:
  // add_dynamic_dropdown_data(className);
  
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
  // this will run at page load and after the nav-dropdown is closed
  nav_items.forEach((nav_item) => {
    nav_item.addEventListener('click', click_listener);
    
    // Remove clicked highlighting on nav_item
    nav_item.classList.remove('clicked');
  });
};

// ==============================================

const disable_nav_item_click_listeners = () => {

  // -What we actually want is to only disable the navbar for the currently selected nav-item
  // -This allows user to open another nav-item without clicking outside nav-dropdown to close first.
  // -Should add logic to not re-open the nav-dropdown, but be ready to swap out dynamic data corresponding to different nav-items

  // this will run when the dropdown is open to prevent double opens
  nav_items.forEach((nav_item) => {
    nav_item.removeEventListener('click', click_listener);
  });
};

// ==============================================

const click_listener = (event) => {
  const nav_item = event.target;
  nav_item.classList.add('clicked');
  console.log('nav-item clicked: ', nav_item);

  open();
};

// ==============================================
// Enable on page load
enable_nav_item_click_listeners();

// ==============================================