// ==============================================

import {viewport_geometry, element_geometry} from './geometry.js';

// ==============================================

const carousel = document.querySelector('.carousel');
const carousel_items = gsap.utils.toArray('.carousel-item');

// ==============================================

const timeline = gsap.timeline({
  repeat: -1,
  defaults: {
    duration: 1,
  } // defaults: {}
});

// ==============================================

const {viewport_width} = viewport_geometry();

const widths = carousel_items.map(carousel_item => {
  const {w} = element_geometry(carousel_item);
  return w;
});

// ==============================================

const do_carousel = () => {

  const pause_duration = 6.75; // 6.5s.
  carousel_items.forEach((carousel_item, idx) => {

    timeline.to(carousel_item, { x: viewport_width + viewport_width/2 - widths[idx]/2,} )
            .to(carousel_item, { x: 2*viewport_width }, `<+${pause_duration}` );
    });

};
do_carousel();