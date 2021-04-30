console.log('hi');


let count = 0;
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
};

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
};


// ==============================================

const nav__hamburger  = document.querySelector('.nav__hamburger');
window.addEventListener('click', () => {
  
  console.log('clicked button');
  
  if (count === 0) {
    
    master_timeline = gsap.timeline();
    master_timeline.add( blur_background() );
    master_timeline.add( translucent_overlay(), '<' );

  }
  else {
    master_timeline.reverse();
  }

  count = (count + 1) % 2;
});

// ==============================================