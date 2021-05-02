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
  'men': [],
  'women': [],
  'kids': [],
  'customize': [],
  'sale': [],
};
const add_dynamic_dropdown_data = (nav_item_id) => {
  console.log('nav_item_id: ', nav_item_id);
  const dropdown_data_columns = dropdown_data[nav_item_id];
  const cols = gsap.utils.toArray('.nav-dropdown__col');

  for (let i = 0; i < dropdown_data_columns.length; i++){
    console.log('i: ', i);
    // const elem = document.createElement('div');
    // console.log(elem);
    // elem.textContent = dropdown_data_columns[0][0];
    // col_1.append(elem);

    for (let j = 0; j < dropdown_data_columns[i].length; j++) {
      console.log('j: ', j);

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

  console.log('clicked hamburger');

  // Add dynamic data to dropdown:
  add_dynamic_dropdown_data(nav_item_id);
  
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
  // -Can do this in function click_listener(event) { event.target.removeEventListener('click', click_listener)}
  // -Then, don't call disable_nav_item_click_listeners() in the onStart() property of the gsap animatino in slide()
  // -The issue that I need to work out is how to handle the logic with .reverse() animation [need to not start new animation or do .reverse,
  //  and instead need to just swap out the dynamic data, which this is currently grabbed in the open() function, which might be a good place to 
  //  keep this logic since I will call open() when the event of clicking a nav_item (other than the currently selected nav-item) is fired]

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

  const nav_item_id = nav_item.dataset.id;
  open(nav_item_id);
};

// ==============================================
// Enable on page load
enable_nav_item_click_listeners();

// ==============================================