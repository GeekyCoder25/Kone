import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

export interface Product {
	type: string;
	id: number;
	attributes: {
		name: string;
		slug: string;
		description: string;
		price: number;
		category: string[];
		stock_quantity: number;
		unit: string;
		measurement: string;
		thumbnail: string;
		status: string;
		created_at: string;
	};
}

export interface ProductsResponse {
	status: number;
	message: string;
	data: {
		products: Product[];
		pagination: {
			meta: {
				current_page: number;
				last_page: number;
				per_page: number;
				total: number;
			};
			links: {
				first: string;
				last: string;
				next: string | null;
				prev: string | null;
			};
		};
	};
}

export interface CartItem {
	type: 'cart';
	id: number;
	attributes: {
		quantity: number;
		unit_price: number;
		total_price: number;
		products: Product;
	};
}

export interface AddToCartPayload {
	product_id: number;
	quantity: number;
}

export interface CartResponse {
	status: number;
	message: string;
	data: CartItem[];
}

export interface AddToCartResponse {
	status: number;
	message: string;
	data: CartItem;
}

export interface WishlistResponse {
	status: number;
	message: {
		type: string;
		id: number;
		product: Product;
	}[];
	data: [];
}

export const getProducts = async () => {
	const response = await axiosClient.get<ProductsResponse>(
		'/generals/products'
	);
	return response.data;
};

export const addToCart = async (payload: AddToCartPayload) => {
	const response = await axiosClient.post<AddToCartPayload, AddToCartResponse>(
		'/buyers/cart',
		payload
	);
	return response.data;
};

export const getCart = async () => {
	const response = await axiosClient.get<CartResponse>('/buyers/cart');
	return response.data;
};

export const deleteCartItem = async (id: number) => {
	const response = await axiosClient.delete<CartResponse>(`/buyers/cart/${id}`);
	return response.data;
};

export const clearCart = async () => {
	const response = await axiosClient.get<CartResponse>('/buyers/clear-cart');
	return response.data;
};

export const getWishlist = async () => {
	const response = await axiosClient.get<WishlistResponse>('/buyers/wishlist');
	return response.data;
};

export const addToWishlist = async (product_id: number) => {
	const response = await axiosClient.post('/buyers/wishlist', {product_id});
	return response.data;
};

export const removeFromWishlist = async (product_id: number) => {
	const response = await axiosClient.delete(`/buyers/wishlist/${product_id}`);
	return response.data;
};
