class Timer {
  constructor() {
    this.startTime;
    this.endTime;
  }

  state() {
    this.tic();
    const getReadyState = (timeDiff='') => {
      if (timeDiff)
        console.log(`document.readyState: ${document.readyState} @ ${timeDiff.toFixed(0)}ms.`);
      else
        console.log(`document.readyState: ${document.readyState}`);
    };
    getReadyState();

    document.addEventListener('DOMContentLoaded', (event) => {
      console.log('DOMContentLoaded event fired     ---                                   (Beginning of phase 2)');
      const timeDiff = this.toc();
      getReadyState(timeDiff);
    });

    window.addEventListener('load', (event) => {
      console.log(`load event fired                 ---  document.readyState: ${document.readyState}    (All files done loading and async scripts guaranteed to be done)`);
      const timeDiff = this.toc();
      getReadyState(timeDiff);
    });
  }

  tic() { 
    this.startTime = performance.now(); 
  };

  toc() {
    this.endTime = performance.now();
    const timeDiff = this.endTime - this.startTime; //in ms 
    return timeDiff.toFixed(2);
  }
  time() {
    const timeDiff = this.toc();
    console.log(`${timeDiff.toFixed(0)}ms.`);
  }
}

export {Timer};