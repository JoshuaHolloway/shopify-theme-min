
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // import {Timer} from './timer.js';
    // const timer1 = new Timer();
    // const timer2 = new Timer();

    // - - - - - - - - - - - - - - - - - - - 


    // console.log('BEGIN AJAX request to /cart.js');  
    // timer1.tic();
    // const cartContents = fetch('/cart.js')
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('END AJAX response:');
    //     // console.log(data);
    //     // console.log(typeof data.total_price);
    //     // price = (data.total_price / 100).toFixed(2);
    //     timer1.toc();

    //     // handleCartResponse(data);
    //     return data;
    //   });

    // - - - - - - - - - - - - - - - - - - - 

    // Asynchronous function for handling GET '/cart.js' request
    // timer2.tic();
    async function getCart(f) {
      console.log('getCart()');
      const response = await fetch('/cart.js');
      const data = await response.json();

      console.log('END AJAX response:');
      // console.log(data);



      // console.log(typeof data.total_price);
      // price = (data.total_price / 100).toFixed(2);
    //   timer2.toc();

    //   handleCartResponse(data);
      f(data);
    }

    const toDollars = (cents) => (Number(cents) / 100).toFixed(2);

    // --------------------------------------------------------

    const populate_template = (item) => {
      const template = `
    <div class="item" data-variant-id=${item.id}>
    
      <a href="${item.url}">${item.title}</a>
      <img src="${item.featured_image.url}" alt=""/>
      <p>$${toDollars(item.price)}</p>
    </div>
  `;
      return template;
    };

    // --------------------------------------------------------

    const renderCart = (data) => {
      console.log('render cart');
      console.log(data);

      const items = data.items;
      console.log('items:');
      console.log(items);

      let total_price = 0;
      const div = document.createElement('div');
      div.classList.add('items');
      items.forEach((item, idx) => {
        console.log(item);

        const price = item.price;
        const qty = item.quantity;

        total_price += price * qty;

        const div_item = document.createElement('div');
        div_item.innerHTML = populate_template(item);

        div.appendChild(div_item);
      });
      total_price = toDollars(total_price); 

      const cart_container = document.querySelector('#cart-container');
      const subtotal_elem = cart_container.querySelector('#cart-container__subtotal');
      subtotal_elem.textContent = `Subtotal: $${total_price}`;
      cart_container.appendChild(div);
      



    };

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let button0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let button1;
    	let t5;
    	let h1;
    	let t6;
    	let t7;
    	let t8;
    	let h5;
    	let t9;
    	let t10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*qty_in_cart*/ ctx[0]);
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t5 = space();
    			h1 = element("h1");
    			t6 = text("Total Price: $");
    			t7 = text(/*price*/ ctx[1]);
    			t8 = space();
    			h5 = element("h5");
    			t9 = text("Quantity In Cart: ");
    			t10 = text(/*qty_in_cart*/ ctx[0]);
    			attr_dev(button0, "class", "svelte-a51pi3");
    			add_location(button0, file, 25, 4, 463);
    			attr_dev(p, "class", "svelte-a51pi3");
    			add_location(p, file, 26, 4, 509);
    			attr_dev(button1, "class", "svelte-a51pi3");
    			add_location(button1, file, 27, 4, 534);
    			attr_dev(div0, "id", "id-container");
    			attr_dev(div0, "class", "svelte-a51pi3");
    			add_location(div0, file, 24, 2, 435);
    			attr_dev(h1, "class", "svelte-a51pi3");
    			add_location(h1, file, 30, 2, 587);
    			attr_dev(h5, "class", "svelte-a51pi3");
    			add_location(h5, file, 31, 2, 620);
    			attr_dev(div1, "id", "container");
    			attr_dev(div1, "class", "svelte-a51pi3");
    			add_location(div1, file, 22, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			append_dev(div1, t5);
    			append_dev(div1, h1);
    			append_dev(h1, t6);
    			append_dev(h1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, h5);
    			append_dev(h5, t9);
    			append_dev(h5, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleMinus*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*handlePlus*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*qty_in_cart*/ 1) set_data_dev(t2, /*qty_in_cart*/ ctx[0]);
    			if (dirty & /*price*/ 2) set_data_dev(t7, /*price*/ ctx[1]);
    			if (dirty & /*qty_in_cart*/ 1) set_data_dev(t10, /*qty_in_cart*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	getCart(renderCart);
    	let { price } = $$props;
    	let { qty_in_cart = 0 } = $$props;

    	// - - - - - - - - - - - - - - - - - - - 
    	const handlePlus = () => $$invalidate(0, ++qty_in_cart);

    	const handleMinus = () => {
    		if (qty_in_cart > 0) $$invalidate(0, --qty_in_cart); else alert("TODO: Handle removing item from cart!");
    	};

    	const writable_props = ["price", "qty_in_cart"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("qty_in_cart" in $$props) $$invalidate(0, qty_in_cart = $$props.qty_in_cart);
    	};

    	$$self.$capture_state = () => ({
    		getCart,
    		renderCart,
    		price,
    		qty_in_cart,
    		handlePlus,
    		handleMinus
    	});

    	$$self.$inject_state = $$props => {
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("qty_in_cart" in $$props) $$invalidate(0, qty_in_cart = $$props.qty_in_cart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [qty_in_cart, price, handlePlus, handleMinus];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { price: 1, qty_in_cart: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*price*/ ctx[1] === undefined && !("price" in props)) {
    			console.warn("<App> was created without expected prop 'price'");
    		}
    	}

    	get price() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get qty_in_cart() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set qty_in_cart(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.querySelector('#app'),
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
