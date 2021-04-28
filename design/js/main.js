// gsap.to('.box', {
//   x: 400,
//   duration: 5,
//   scrollTrigger: {
//     trigger: '.box',
//     scrub: true, //1
//     // pin: true,
//     start: '0px 50%', // trigger-start   scroller-start
//     end: '100px 50%', // trigger-end     scroller-end
//     markers: {startColor: "green", endColor: "rgba(255, 0, 0, 1)", fontSize: "22px"}, // markers: {}
//     toggleActions: 'restart pause reverse pause',
//   }, // scrolTrigger: {}
// }); // timeline.to()

const viewport_height = window.innerHeight;
const document_height = document.documentElement.offsetHeight;
console.log('document_height: ', document_height, ',    viewport_height: ', viewport_height);
console.log('screen: ', screen);

// TODO: Fix this hack!
const available_document_height = 3 * screen.availHeight;

gsap.to('nav', {
  yPercent: -100,
  // duration: 0.5,
  scrollTrigger: {
    trigger: '#section-1',
    // scrub: true, //1
    // pin: true,
    start: '100% 10%', // trigger-start   scroller-start
    end: `50.1% 50%`, // trigger-end     scroller-end
    markers: {startColor: "green", endColor: "rgba(255, 0, 0, 0)", fontSize: "22px"}, // markers: {}
    toggleActions: 'restart none reverse reverse', // onEnter, onLeave, onEnterBack, and onLeaveBack,
    onEnter: () => {
      console.log('onEnter');
    }, 
    onLeave: () => {
      console.log('onLeave');
    }, 
    onEnterBack: () => {
      console.log('onEnterBack');
    }, 
    onLeaveBack: () => {
      console.log('onLeaveBack')
    }
  }, // scrolTrigger: {}
}); // timeline.to()