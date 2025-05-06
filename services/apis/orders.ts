import {AxiosClient} from '@/utils/axios';
import {Product} from './products';

export interface OrderItem {
	type: string;
	id: number;
	attributes: {
		quantity: number;
		price: string;
		total: string;
		created_at: string;
	};
	product: Product;
}

export interface Order {
	type: string;
	id: number;
	attributes: {
		reference: string;
		total_amount: string;
		delivery_fee: string;
		status: string;
		created_at: string;
	};
	items: OrderItem[];
}

export interface OrdersResponse {
	data: Order[];
}

export interface CheckoutPayload {
	callback_url: string;
	user_address_id: number;
}

export interface CheckoutResponse {
	status: number;
	message: string;
	data: {
		reference: string;
		order: {
			type: string;
			id: number;
			attributes: {
				reference: string;
				total_amount: number;
				delivery_fee: number | null;
				status: string;
				created_at: string;
			};
		};
		payment_url: string;
	};
}

const axiosClient = new AxiosClient();

export const getOrders = async () => {
	const response = await axiosClient.get<OrdersResponse>(
		'/buyers/orders?include=items.product'
	);
	return response.data;
};

export const checkout = async (payload: CheckoutPayload) => {
	const response = await axiosClient.post<CheckoutPayload, CheckoutResponse>(
		'/buyers/checkout',
		payload
	);
	return response.data;
};
