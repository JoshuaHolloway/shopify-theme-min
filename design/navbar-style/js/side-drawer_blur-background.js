let timeline;
button.addEventListener('click', () => {

  console.log('clicked button');
  
  if (count === 0) {
    
    timeline = gsap.timeline();
    
    timeline.to(content, {
      filter: 'blur(4px)',
    }); // .to()
    
    timeline.to(overlay, {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      onStart:           () => overlay.style.zIndex = 1,
      onReverseComplete: () => overlay.style.zIndex = -1,
    }, '<'); // .to()

  }
  else {
    timeline.reverse();
  }

  count = (count + 1) % 2;
});