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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const count_1 = writable(0);
    const count_2 = writable(0);
    // export const count_1 = writable(0);
    // export const count_2 = writable(0);

    /* src\Element.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\Element.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "+";
    			add_location(button, file$3, 86, 2, 2439);
    			attr_dev(div, "class", "qty-container svelte-1yfr2bm");
    			add_location(div, file$3, 84, 0, 2406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*increment*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $count_1;
    	let $count_2;
    	validate_store(count_1, "count_1");
    	component_subscribe($$self, count_1, $$value => $$invalidate(4, $count_1 = $$value));
    	validate_store(count_2, "count_2");
    	component_subscribe($$self, count_2, $$value => $$invalidate(5, $count_2 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Element", slots, []);
    	let { line_item_id } = $$props;
    	let { line_item_qty } = $$props;
    	let { line_num } = $$props;
    	if (line_num === 0) set_store_value(count_1, $count_1 = line_item_qty, $count_1); else if (line_num === 1) set_store_value(count_2, $count_2 = line_item_qty, $count_2);

    	function increment() {
    		console.clear();
    		console.log(`line_num: ${line_num}, $count_1: ${$count_1}, $count_2: ${$count_2}`);
    		console.log(`line_item_id: ${line_item_id}, typeof line_item_id: ${typeof line_item_id}`);

    		// -This value is to be sent to the server 
    		//  (not verified it has been succefully updated yet, 
    		//   that happens in the response)
    		// const new_quanity_we_desire = local_component_qty + 1;
    		let new_quanity_we_desire;

    		if (line_num === 0) new_quanity_we_desire = $count_1 + 1; else if (line_num === 1) new_quanity_we_desire = $count_2 + 1;
    		console.log("new_quantity_we_desire: ", new_quanity_we_desire);

    		// const data_obj = { "quantity": new_quanity_we_desire, "id": String(line_item_id) };
    		// const data_obj = { "quantity": String(9), "id": String(39540088832179) };
    		// const data_obj = { "quantity": String(9), "id": String(39540031127731) };
    		// const data_obj = { "quantity": String(18), "id": "39540088832179:6881ee5f9fc473f02da20f6049955538" };
    		// const data_obj = { "quantity": String(18), "id": "39540031127731:109260b9cfda5bcd3e86cdb2f7ba8b67" };
    		const data_obj = {
    			"quantity": String(new_quanity_we_desire),
    			"id": String(line_item_id)
    		};

    		// const data_obj = { "line": 1, "quantity": 7,  };
    		fetch("/cart/change.js", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data_obj)
    		}).then(response => response.json()).then(data => {
    			console.log("Svelte Fetch: ", data);

    			// New quantity has been succesfully changed on server
    			const verified_new_quantity = data.items[line_num].quantity;

    			console.log("verified_new_quantity: ", verified_new_quantity);

    			// -Update quantity of line item (to display in component one level above)
    			if (line_num === 0) {
    				count_1.update(n => verified_new_quantity);
    			} else if (line_num === 1) {
    				count_2.update(n => verified_new_quantity);
    			}
    		}).catch(error => console.error("Error:", error));
    	}

    	const writable_props = ["line_item_id", "line_item_qty", "line_num"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Element> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("line_item_id" in $$props) $$invalidate(1, line_item_id = $$props.line_item_id);
    		if ("line_item_qty" in $$props) $$invalidate(2, line_item_qty = $$props.line_item_qty);
    		if ("line_num" in $$props) $$invalidate(3, line_num = $$props.line_num);
    	};

    	$$self.$capture_state = () => ({
    		count_1,
    		count_2,
    		line_item_id,
    		line_item_qty,
    		line_num,
    		increment,
    		$count_1,
    		$count_2
    	});

    	$$self.$inject_state = $$props => {
    		if ("line_item_id" in $$props) $$invalidate(1, line_item_id = $$props.line_item_id);
    		if ("line_item_qty" in $$props) $$invalidate(2, line_item_qty = $$props.line_item_qty);
    		if ("line_num" in $$props) $$invalidate(3, line_num = $$props.line_num);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [increment, line_item_id, line_item_qty, line_num];
    }

    class Element extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			line_item_id: 1,
    			line_item_qty: 2,
    			line_num: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Element",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*line_item_id*/ ctx[1] === undefined && !("line_item_id" in props)) {
    			console_1$2.warn("<Element> was created without expected prop 'line_item_id'");
    		}

    		if (/*line_item_qty*/ ctx[2] === undefined && !("line_item_qty" in props)) {
    			console_1$2.warn("<Element> was created without expected prop 'line_item_qty'");
    		}

    		if (/*line_num*/ ctx[3] === undefined && !("line_num" in props)) {
    			console_1$2.warn("<Element> was created without expected prop 'line_num'");
    		}
    	}

    	get line_item_id() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line_item_id(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line_item_qty() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line_item_qty(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line_num() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line_num(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Item.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\Item.svelte";

    // (35:4) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Quantity:");
    			t1 = text(/*$count_2*/ ctx[8]);
    			t2 = text(" @ Price: ");
    			t3 = text(/*price*/ ctx[4]);
    			attr_dev(p, "class", "svelte-1gi6pjb");
    			add_location(p, file$2, 35, 7, 954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$count_2*/ 256) set_data_dev(t1, /*$count_2*/ ctx[8]);
    			if (dirty & /*price*/ 16) set_data_dev(t3, /*price*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(35:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if line_num == 0}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Quantity:");
    			t1 = text(/*$count_1*/ ctx[7]);
    			t2 = text(" @ Price: ");
    			t3 = text(/*price*/ ctx[4]);
    			attr_dev(p, "class", "svelte-1gi6pjb");
    			add_location(p, file$2, 33, 7, 891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$count_1*/ 128) set_data_dev(t1, /*$count_1*/ ctx[7]);
    			if (dirty & /*price*/ 16) set_data_dev(t3, /*price*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:4) {#if line_num == 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let a;
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let element_1;
    	let t4;
    	let div3;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*line_num*/ ctx[6] == 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	element_1 = new Element({
    			props: {
    				line_num: /*line_num*/ ctx[6],
    				line_item_id: /*id*/ ctx[0],
    				line_item_qty: /*quantity*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			t1 = text(/*title*/ ctx[2]);
    			t2 = space();
    			if_block.c();
    			t3 = space();
    			div2 = element("div");
    			create_component(element_1.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			attr_dev(img, "height", "100");
    			if (img.src !== (img_src_value = /*imgURL*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 22, 4, 403);
    			attr_dev(div0, "class", "img-container svelte-1gi6pjb");
    			add_location(div0, file$2, 21, 2, 371);
    			attr_dev(a, "href", /*URL*/ ctx[1]);
    			attr_dev(a, "class", "svelte-1gi6pjb");
    			add_location(a, file$2, 27, 4, 527);
    			attr_dev(div1, "class", "info-container svelte-1gi6pjb");
    			add_location(div1, file$2, 26, 2, 494);
    			attr_dev(div2, "class", "qty-container svelte-1gi6pjb");
    			add_location(div2, file$2, 39, 2, 1020);
    			attr_dev(div3, "class", "remove-container svelte-1gi6pjb");
    			add_location(div3, file$2, 53, 2, 1921);
    			attr_dev(div4, "class", "item svelte-1gi6pjb");
    			attr_dev(div4, "data-variant-id", /*id*/ ctx[0]);
    			add_location(div4, file$2, 18, 0, 325);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, a);
    			append_dev(a, t1);
    			append_dev(div1, t2);
    			if_block.m(div1, null);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			mount_component(element_1, div2, null);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*imgURL*/ 8 && img.src !== (img_src_value = /*imgURL*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*title*/ 4) set_data_dev(t1, /*title*/ ctx[2]);

    			if (!current || dirty & /*URL*/ 2) {
    				attr_dev(a, "href", /*URL*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			const element_1_changes = {};
    			if (dirty & /*line_num*/ 64) element_1_changes.line_num = /*line_num*/ ctx[6];
    			if (dirty & /*id*/ 1) element_1_changes.line_item_id = /*id*/ ctx[0];
    			if (dirty & /*quantity*/ 32) element_1_changes.line_item_qty = /*quantity*/ ctx[5];
    			element_1.$set(element_1_changes);

    			if (!current || dirty & /*id*/ 1) {
    				attr_dev(div4, "data-variant-id", /*id*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(element_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(element_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block.d();
    			destroy_component(element_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $count_1;
    	let $count_2;
    	validate_store(count_1, "count_1");
    	component_subscribe($$self, count_1, $$value => $$invalidate(7, $count_1 = $$value));
    	validate_store(count_2, "count_2");
    	component_subscribe($$self, count_2, $$value => $$invalidate(8, $count_2 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { id } = $$props;
    	let { URL } = $$props;
    	let { title } = $$props;
    	let { imgURL } = $$props;
    	let { price } = $$props;
    	let { quantity } = $$props;
    	let { line_num } = $$props;

    	// $: quantity = $count;
    	console.log("line_num: ", line_num);

    	const writable_props = ["id", "URL", "title", "imgURL", "price", "quantity", "line_num"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("URL" in $$props) $$invalidate(1, URL = $$props.URL);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("imgURL" in $$props) $$invalidate(3, imgURL = $$props.imgURL);
    		if ("price" in $$props) $$invalidate(4, price = $$props.price);
    		if ("quantity" in $$props) $$invalidate(5, quantity = $$props.quantity);
    		if ("line_num" in $$props) $$invalidate(6, line_num = $$props.line_num);
    	};

    	$$self.$capture_state = () => ({
    		count_1,
    		count_2,
    		Element,
    		id,
    		URL,
    		title,
    		imgURL,
    		price,
    		quantity,
    		line_num,
    		$count_1,
    		$count_2
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("URL" in $$props) $$invalidate(1, URL = $$props.URL);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("imgURL" in $$props) $$invalidate(3, imgURL = $$props.imgURL);
    		if ("price" in $$props) $$invalidate(4, price = $$props.price);
    		if ("quantity" in $$props) $$invalidate(5, quantity = $$props.quantity);
    		if ("line_num" in $$props) $$invalidate(6, line_num = $$props.line_num);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, URL, title, imgURL, price, quantity, line_num, $count_1, $count_2];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			id: 0,
    			URL: 1,
    			title: 2,
    			imgURL: 3,
    			price: 4,
    			quantity: 5,
    			line_num: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'id'");
    		}

    		if (/*URL*/ ctx[1] === undefined && !("URL" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'URL'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'title'");
    		}

    		if (/*imgURL*/ ctx[3] === undefined && !("imgURL" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'imgURL'");
    		}

    		if (/*price*/ ctx[4] === undefined && !("price" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'price'");
    		}

    		if (/*quantity*/ ctx[5] === undefined && !("quantity" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'quantity'");
    		}

    		if (/*line_num*/ ctx[6] === undefined && !("line_num" in props)) {
    			console_1$1.warn("<Item> was created without expected prop 'line_num'");
    		}
    	}

    	get id() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get URL() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set URL(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgURL() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgURL(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quantity() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quantity(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line_num() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line_num(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\CheckoutButton.svelte generated by Svelte v3.37.0 */

    const file$1 = "src\\CheckoutButton.svelte";

    function create_fragment$2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Proceed to checkout";
    			attr_dev(button, "class", "svelte-rkpkmw");
    			add_location(button, file$1, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckoutButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckoutButton> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CheckoutButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckoutButton",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    // const timer = new Timer();
    // timer.state();

    // - - - - - - - - - - - - - - - - - - - 

    // Asynchronous function for handling GET '/cart.js' request
    // timer.tic();
    async function getCart() {
      // console.log('getCart()');
      
      // let timeDiff = timer.toc();
      // console.log(`BEGIN AJAX request @ ${timeDiff.toFixed(0)}ms.`);
      const response = await fetch('/cart.js');
      const data = await response.json();
      // console.log(data);
      // timeDiff = timer.toc();
      // console.log(`END AJAX response @ ${timeDiff.toFixed(0)}ms.`);
      return data;
    }

    const toDollars = (cents) => (Number(cents) / 100).toFixed(2);

    /* src\Cart.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src\\Cart.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (87:0) {#each arr as item, idx}
    function create_each_block(ctx) {
    	let hr;
    	let t;
    	let item;
    	let current;

    	item = new Item({
    			props: {
    				id: /*item*/ ctx[5].id,
    				URL: /*item*/ ctx[5].URL,
    				title: /*item*/ ctx[5].title,
    				imgURL: /*item*/ ctx[5].imgURL,
    				price: /*item*/ ctx[5].price,
    				quantity: /*item*/ ctx[5].quantity,
    				line_num: /*idx*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t = space();
    			create_component(item.$$.fragment);
    			add_location(hr, file, 87, 2, 2132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_changes = {};
    			if (dirty & /*arr*/ 2) item_changes.id = /*item*/ ctx[5].id;
    			if (dirty & /*arr*/ 2) item_changes.URL = /*item*/ ctx[5].URL;
    			if (dirty & /*arr*/ 2) item_changes.title = /*item*/ ctx[5].title;
    			if (dirty & /*arr*/ 2) item_changes.imgURL = /*item*/ ctx[5].imgURL;
    			if (dirty & /*arr*/ 2) item_changes.price = /*item*/ ctx[5].price;
    			if (dirty & /*arr*/ 2) item_changes.quantity = /*item*/ ctx[5].quantity;
    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t);
    			destroy_component(item, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(87:0) {#each arr as item, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let checkoutbutton;
    	let t3;
    	let t4;
    	let hr;
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	checkoutbutton = new CheckoutButton({ $$inline: true });
    	let each_value = /*arr*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Subtotal: $");
    			t1 = text(/*total_price*/ ctx[0]);
    			t2 = space();
    			create_component(checkoutbutton.$$.fragment);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Change Item 1";
    			add_location(h1, file, 82, 2, 2042);
    			attr_dev(div, "class", "checkout-button-container svelte-1doe5dg");
    			add_location(div, file, 81, 0, 2000);
    			add_location(hr, file, 98, 0, 2318);
    			add_location(button, file, 100, 0, 2324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div, t2);
    			mount_component(checkoutbutton, div, null);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*change_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*total_price*/ 1) set_data_dev(t1, /*total_price*/ ctx[0]);

    			if (dirty & /*arr*/ 2) {
    				each_value = /*arr*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t4.parentNode, t4);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkoutbutton.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkoutbutton.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(checkoutbutton);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cart", slots, []);
    	let total_price = 0;
    	let arr = [];

    	// --------------------------------------------------------
    	async function renderCart() {
    		const data = await getCart();
    		const items = data.items;

    		items.forEach((item, idx) => {
    			console.log("item:");
    			console.log(item);

    			$$invalidate(
    				1,
    				arr[idx] = {
    					id: item.id,
    					URL: item.url,
    					title: item.title,
    					imgURL: item.featured_image.url,
    					price: toDollars(item.price),
    					quantity: item.quantity
    				},
    				arr
    			);

    			const price = item.price;
    			const qty = item.quantity;
    			$$invalidate(0, total_price += price * qty);
    		});

    		$$invalidate(0, total_price = toDollars(total_price));
    	}

    	
    	renderCart();

    	const change_1 = () => {
    		const data_obj = {
    			"quantity": String(5),
    			"id": "39540088832179"
    		};

    		// const data_obj = { "line": 1, "quantity": 7,  };
    		fetch("/cart/change.js", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data_obj)
    		}).then(response => response.json()).then(data => {
    			console.clear(); // body: data_obj
    			console.log("Svelte Fetch: ", data);
    		}).catch(error => console.error("Error:", error));
    	};

    	const change_2 = () => {
    		const data_obj = {
    			"quantity": String(5),
    			"id": "39540088832179:6881ee5f9fc473f02da20f6049955538"
    		};

    		fetch("/cart/change.js", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data_obj)
    		}).then(response => response.json()).then(data => {
    			console.clear();
    			console.log("Svelte Fetch: ", data);
    		}).catch(error => console.error("Error:", error));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Item,
    		CheckoutButton,
    		getCart,
    		toDollars,
    		total_price,
    		arr,
    		renderCart,
    		change_1,
    		change_2
    	});

    	$$self.$inject_state = $$props => {
    		if ("total_price" in $$props) $$invalidate(0, total_price = $$props.total_price);
    		if ("arr" in $$props) $$invalidate(1, arr = $$props.arr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [total_price, arr, change_1];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    function create_fragment(ctx) {
    	let cart;
    	let current;
    	cart = new Cart({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cart.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(cart, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cart, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Cart });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.querySelector('#app'),
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
