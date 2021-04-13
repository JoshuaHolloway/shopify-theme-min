<script>
	export let name;

  console.log('josh');
  console.log('$');

  let startTime, endTime;
  function start() {
    startTime = performance.now();
  };
  start();

  function end() {
    endTime = performance.now();
    let timeDiff = endTime - startTime; //in ms 
    // strip the ms 
    // timeDiff /= 1000; 
    
    // get seconds 
    // let seconds = Math.round(timeDiff);
    // console.log(seconds + " seconds");
    console.log(`${timeDiff}ms.`);
  }


  const getReadyState = () => {console.log(`document.readyState: ${document.readyState}`);};
  getReadyState();
  
  document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded event fired     ---                                   (Beginning of phase 2)');
    getReadyState();
    end();
  });

  window.addEventListener('load', (event) => {
    console.log(`load event fired                 ---  document.readyState: ${document.readyState}    (All files done loading and async scripts guaranteed to be done)`);
    getReadyState();
    end();

    console.log('Setup request to /cart.js');  
    const cartContents = fetch('/cart.js')
      .then(response => response.json())
      .then(data => {
        console.log('Cart from AJAX-API: ');
        console.log(data);
        end();
        return data;
      });
  });

</script>

<div>
  <h1>HHH Hello {name}!</h1>
</div>

<style>

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>