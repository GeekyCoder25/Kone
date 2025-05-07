import {AxiosClient} from '@/utils/axios';

export interface SalesStats {
	completed_sales: number;
	sales_in_progress: number;
	total_earned: string;
	earned_this_month: string | null;
}

export interface SalesStatsResponse {
	status: number;
	message: string;
	data: SalesStats;
}

export interface RevenueStatsItem {
	label: string;
	value: string | number;
}

export interface RevenueStats {
	byWeek: RevenueStatsItem[];
	byMonth: RevenueStatsItem[];
}

export interface RevenueStatsResponse {
	status: number;
	message: string;
	data: {
		total_revenue: string;
		revenue_stats: RevenueStats;
	};
}

export interface SalesData {
	revenue_chart: number[];
	performance_chart: number[];
	recent_orders?: SellerOrder[];
}

export interface SellerOrder {
	order: Order;
	buyer: User;
	items: OrderItem[][];
}

export interface Order {
	type: string;
	id: number;
	attributes: OrderAttributes;
	buyer: User;
}

interface OrderAttributes {
	reference: string;
	total_amount: string;
	delivery_fee: string;
	status: string;
	created_at: string;
}

interface User {
	type: string;
	id: number;
	attributes: UserAttributes;
}

interface UserAttributes {
	name: string;
	email: string;
	wallet_balance: number;
	is_buyer: boolean;
	is_seller: boolean;
	phone: string;
	address: string | null;
	state: string | null;
	city: string | null;
	country: string;
	bio: string | null;
	profile_photo: string;
	farm_name: string | null;
	delivery_fee: string | null;
	avg_delivery_rating: number;
	avg_quality_rating: number;
	total_reviews: number;
	created_at: string;
}

interface OrderItem {
	type: string;
	id: number;
	attributes: OrderItemAttributes;
	product: Product;
}

interface OrderItemAttributes {
	quantity: number;
	price: string;
	total: string;
	created_at: string;
}

interface Product {
	type: string;
	id: number;
	attributes: ProductAttributes;
}

interface ProductAttributes {
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
}

export interface OrdersResponse {
	status: number;
	message: string;
	data: SellerOrder[];
}
export interface OrderDetailsResponse {
	status: number;
	message: string;
	data: OrderData;
}

export interface OrderData {
	type: 'Order';
	id: number;
	attributes: OrderAttributes;
	items: OrderItem[];
	buyer: User;
	buyer_address: UserAddressEntity;
}

export interface OrderDetailItem {
	type: 'OrderItem';
	id: number;
	attributes: OrderItemAttributes;
	seller: User;
	product: Product;
}

export interface UserAddressEntity {
	type: 'user_address';
	id: number;
	attributes: UserAddressAttributes;
}

export interface UserAddressAttributes {
	recipient_name: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	created_at: string;
}

const axiosClient = new AxiosClient();

/**
 * Get seller statistics (completed sales, in-progress sales, earnings)
 */
export const getSellerStats = async () => {
	const response = await axiosClient.get<SalesStatsResponse>('/sellers/stats');
	return response.data;
};

/**
 * Get revenue statistics for a given time frame
 * @param timeFrame - 'This Week' or 'This Month'
 */
export const getRevenueStats = async (timeFrame: string) => {
	const queryParam = timeFrame === 'This Week' ? 'week' : 'month';
	const response = await axiosClient.get<RevenueStatsResponse>(
		`/sellers/revenue-stats?period=${queryParam}`
	);
	return response.data;
};

/**
 * Get seller orders
 */
export const getSellerOrders = async () => {
	const response = await axiosClient.get<OrdersResponse>(
		'/sellers/orders?include=buyer,products'
	);
	return response.data;
};

export const getSellerOrderDetails = async (orderId: string) => {
	const response = await axiosClient.get<OrderDetailsResponse>(
		`/sellers/orders/${orderId}`
	);
	return response.data;
};

/**
 * Get sales data for dashboard charts based on time frame
 * This function combines and processes the data for the dashboard charts
 * @param timeFrame - 'This Week' or 'This Month'
 */
export const getSalesData = async (timeFrame: string): Promise<SalesData> => {
	// Get revenue stats
	const revenueStats = await getRevenueStats(timeFrame);

	// Get recent orders
	const orders = await getSellerOrders();

	// Process revenue data for charts
	const revenueData =
		timeFrame === 'This Week'
			? revenueStats.data.revenue_stats.byWeek
			: revenueStats.data.revenue_stats.byMonth;

	// Convert string values to numbers for the chart
	const revenueChartData = revenueData.map(item =>
		typeof item.value === 'string' ? parseFloat(item.value) : item.value
	);

	// For performance chart, we'll create simulated data based on the revenue
	// In a real app, this would come from another API endpoint
	const performanceChartData = revenueChartData.map(value => value); // Simulated monthly performance
	// Take only the 5 most recent orders
	const recentOrders = orders.data.slice(0, 5);

	return {
		revenue_chart: revenueChartData,
		performance_chart: performanceChartData,
		recent_orders: recentOrders,
	};
};

export const updateOrderStatus = async (orderId: string, payload: any) => {
	const response = await axiosClient.post(
		`/sellers/orders/${orderId}`,
		payload
	);

	return response.data;
};
