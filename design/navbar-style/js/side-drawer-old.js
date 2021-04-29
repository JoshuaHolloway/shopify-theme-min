const hamburger = document.querySelector('#hamburger');
const side_drawer = document.querySelector('#side-drawer');

let count = 0;
let tween =  gsap.from(side_drawer, {x: 200, paused: true});
window.addEventListener('click', () => {
  console.log('clicked!');

  if (count === 0) {
    tween = gsap.to(side_drawer, {x: 0});
  }
  else {
    tween.reverse();
  }

  count = (count + 1) % 2;
});