class Timer {
  constructor() {
    this.startTime;
    this.endTime;
  }

  tic() { 
    this.startTime = performance.now(); 
  };

  toc() {
    this.endTime = performance.now();
    const timeDiff = this.endTime - this.startTime; //in ms 
    console.log(`${timeDiff}ms.`);
  }
}

const timer = new Timer();
timer.tic();

const getReadyState = () => {console.log(`document.readyState: ${document.readyState}`);};
getReadyState();

document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOMContentLoaded event fired     ---                                   (Beginning of phase 2)');
  getReadyState();
  timer.toc();
});

window.addEventListener('load', (event) => {
  console.log(`load event fired                 ---  document.readyState: ${document.readyState}    (All files done loading and async scripts guaranteed to be done)`);
  getReadyState();
  timer.toc();
});

export {Timer};