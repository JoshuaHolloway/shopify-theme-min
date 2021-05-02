// ==============================================

import { element_geometry, viewport_geometry } from './geometry.js';
import { enable_scroll_listener, 
        disable_scroll_listener } from './hide-navbar.js';

// ==============================================

let master_timeline;
const duration = 0.5;
let is_nav_dropdown_open = false;

// ==============================================

const nav_items = gsap.utils.toArray('.nav-desktop .nav-item');

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

const navbar = document.querySelector('.nav-desktop');
const nav_height = element_geometry(navbar).h;
const nav_dropdown = document.querySelector('.nav-dropdown');
const nav_dropdown_height = element_geometry(nav_dropdown).h;
const slide = (className) => {

  const timeline = gsap.timeline();

  timeline.to(className, {
    duration,
    y: nav_height + nav_dropdown_height, 
    onStart: () => {
      is_nav_dropdown_open = true;
    }, // onStart()
    onComplete: () => {
      listen_for_click_outside_of_element('add');
      disable_scroll_listener();
    }, // onComplete()
    onReverseComplete: () => {
      listen_for_click_outside_of_element('remove');
      enable_scroll_listener();
      reset_nav_item_click_listeners();
      is_nav_dropdown_open = false;
    }, // onReverseComplete()
  });

  // - - - - - - - - - - - - - - - - - - - - - - 

  const click_outside_of_element_listener = (event) => {
    const element = document.querySelector(className);
    const {y1: element_top, y2: element_bottom} = element_geometry(element);
    const {viewport_height: vh} = viewport_geometry();
    const y = event.clientY;
    // console.log('y: ', y, 'vh: ', vh,  'element_bottom: ', element_bottom);
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

// Dummy data
const dropdown_data = {
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
    [
      'New For Men',
      'Shoes',
      'Clothing',
      'Equipment',
      'Shop All New'
    ],
    [
      'New For Women',
      'Shoes',
      'Clothing',
      'Equipment',
      'Shop All New',
    ],
    [
      'New For Kids',
      'Boys Shoes',
      'Boys Clothing',
      'Girls Shoes',
      'Girls Clothing',
      'Shop All New'
    ]
  ],
  'men': [
    [
      'New & Featured',
      'New Releases',
      'Best Sellers',
      'Best of Air Max',
      'Top Picks for Mom',
      'Summer of Tie Dye',
      'Wild Run Collection',
      'New Pegasus 38',
      'Sale - Up to 40% Off'
    ],
    [
      'Shoes',
      'Lifestyle',
      'Running',
      'Basketball',
      'Jordan',
      'Training & Gym',
      'Soccer',
      'Golf',
      'Track & Field',
      'Skateboarding',
      'Tennis',
      'Baseball',
      'Sandals & Slides',
      'Shoes $100 & Under',
      'All Shoes'
    ]
  ],
  'women': [],
  'kids': [],
  'customize': [],
  'sale': [],
};
// Thid function will be replaced with dynamic data via Liquid
const add_dynamic_dropdown_data = (nav_item_id) => {

  const dropdown_data_columns = dropdown_data[nav_item_id];
  const cols = gsap.utils.toArray('.nav-dropdown__col');
  // reset cols (to not keep appending)
  cols.forEach((col) => {
    col.innerHTML = '';
  });


  for (let i = 0; i < dropdown_data_columns.length; i++){
    for (let j = 0; j < dropdown_data_columns[i].length; j++) {
      const elem = document.createElement('div');
      elem.textContent = dropdown_data_columns[i][j];
      cols[i].append(elem);
    }
  }
};

// ==============================================

const open = (nav_item_id) => {
  // -currently only used in click listener for
  //  clicking hamburger button in navbar

  console.log('clicked nav item: ', nav_item_id);

  // Add dynamic data to dropdown:
  add_dynamic_dropdown_data(nav_item_id);
  
  if (is_nav_dropdown_open === false) {
    master_timeline = gsap.timeline();
    master_timeline.add( blur_background() );
    master_timeline.add( translucent_overlay(), '<' );
    master_timeline.add( slide('.nav-dropdown'),   '<' );
  }
  
};

// ==============================================

const close = () => {
  // -currently only used in click listener for
  //  clicking outside of the side-drawer
  master_timeline.reverse();
}; // close()


// ==============================================

const reset_nav_item_click_listeners = () => {
  // this will run at page load and after the nav-dropdown is closed
  nav_items.forEach((nav_item) => {
    nav_item.addEventListener('click', click_listener);
    
    // Remove clicked highlighting on nav_item
    nav_item.classList.remove('clicked');
  });
};

// ==============================================

const click_listener = (event) => {
  const nav_item = event.target;
  
  // Open nav-dropdown with corresponding data
  const nav_item_id = nav_item.dataset.id;
  open(nav_item_id);
  
  // -first reset all event listeners, then disable only the one currently open
  // -need to reset them in case you click one nav-item,
  //  then click a second nav-item before closing the nav dropdown,
  //  then again clicking the first nav-item,
  //  we need to be listening to it again.
  // -All event listeners on nav-items are also reset upon
  //  completion of the closing of the nav dropdown.
  reset_nav_item_click_listeners();
  
  // disable event listener to prevent double open of nav-dropdown for same nav-item
  nav_item.removeEventListener('click', click_listener);

  // Display the border-bottom on nav-item
  nav_item.classList.add('clicked');
  console.log('nav-item clicked: ', nav_item);
};

// ==============================================
// Enable on page load
reset_nav_item_click_listeners();

// ==============================================