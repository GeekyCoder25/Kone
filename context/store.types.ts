import {User} from '@/types';
import {CartItem} from '@/services/apis/products';

export interface GlobalState {
	user: User | null;
	cart: CartItem[];
	setUser: (user: User | null) => void;
	setCart: (cart: CartItem[]) => void;
	reset: () => void;
}
