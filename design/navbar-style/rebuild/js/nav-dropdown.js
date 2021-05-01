// ==============================================

let master_timeline;
const duration = 0.5;

// ==============================================

const nav_dropdown = document.querySelector('.nav-dropdown');
const nav_items = gsap.utils.toArray('.nav-desktop .nav-item');
console.log('nav_items: ', nav_items);

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


// ==============================================


// ==============================================

const open_side_drawer = () => {
  // -currently only used in click listener for
  //  clicking hamburger button in navbar

  console.log('clicked hamburger');
  
  master_timeline = gsap.timeline();
  // master_timeline.add( blur_background() );
  master_timeline.add( translucent_overlay(), '<' );
  // master_timeline.add( slide_side_drawer(),   '<' );

};

// ==============================================

nav_items.forEach((nav_item, idx) => {
  nav_item.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('clicked dropdown #', idx);
    
    // yPercent: 100
    open_side_drawer();
  });
});

// ==============================================