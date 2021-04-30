console.log('hi');

const nav__hamburger  = document.querySelector('.nav__hamburger');
const blur_container = document.querySelector('.blur-container');

let count = 0;
let master_timeline;

// ==============================================

const blur_background = () => {
  const timeline = gsap.timeline();
  
  timeline.to(blur_container, {
    filter: 'blur(4px)',
  }); // .to()

  return timeline;
};

// ==============================================

nav__hamburger.addEventListener('click', () => {

  console.log('clicked button');
  
  if (count === 0) {
    
    master_timeline = gsap.timeline();
    master_timeline.add( blur_background() );

  }
  else {
    master_timeline.reverse();
  }

  count = (count + 1) % 2;
});

// ==============================================