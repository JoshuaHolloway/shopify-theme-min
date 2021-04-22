import {writable} from 'svelte/store';

const count_1 = writable(0);
const count_2 = writable(0);
// export const count = writable(0);
export {count_1, count_2};
// export const count_1 = writable(0);
// export const count_2 = writable(0);