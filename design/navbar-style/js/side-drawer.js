import { element_geometry } from './geometry.js';

const hamburger = document.querySelector('#hamburger');
const side_drawer = document.querySelector('#side-drawer');

// $side-drawer-width  defined in  _side-drawer.scss
const sidedrawer = document.querySelector('#side-drawer'); 
const elem_geom = element_geometry(sidedrawer);
const sidedrawer_width = elem_geom.w;

let count = 0;
// let tween =  gsap.from(side_drawer, {x: 200, paused: true});
let tween;
window.addEventListener('click', () => {
  
  if (count === 0)
    tween = gsap.to(side_drawer, {x: -sidedrawer_width});
  else
    tween.reverse();

  count = (count + 1) % 2;
});