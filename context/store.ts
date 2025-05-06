import {create} from 'zustand';
import {GlobalState} from './store.types';

export const useGlobalStore = create<GlobalState>(set => ({
	user: null,
	cart: [],
	setUser: user => set({user}),
	setCart: cart => set({cart}),
	reset: () => set({user: null, cart: []}),
}));
