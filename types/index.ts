export interface User {
	id: number;
	name: string;
	email: string;
	wallet_balance: number;
	email_verified_at: string;
	ver_code: string | null;
	status: number;
	is_seller: boolean;
	is_buyer: boolean;
	is_admin: number;
	phone: string;
	alt_phone: string | null;
	address: string;
	state: string;
	city: string;
	country: string;
	bio: string;
	profile_photo: string;
	farm_name: string;
	delivery_fee: string;
	avg_delivery_rating: number;
	avg_quality_rating: number;
	total_reviews: number;
	created_at: string;
	updated_at: string;
}
