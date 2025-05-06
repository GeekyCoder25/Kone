import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

interface LoginPayload {
	email: string;
	password: string;
}

interface LoginResponse {
	status: number;
	message: string;
	data: {
		token: string;
		token_type: string;
		user: {
			id: number;
			name: string;
			email: string;
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
		};
	};
}

interface RegisterPayload {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	is_buyer: number;
}

export interface VerifyEmailResponse {
	code: string;
	message?: string;
}

interface VerifyEmailPayload {
	email: string;
	code: string;
}

interface ResendEmailPayload {
	email: string;
}

interface ForgotPasswordPayload {
	email: string;
}

interface ResetPasswordPayload {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
}

interface ChangePasswordPayload {
	current_password: string;
	new_password: string;
	new_password_confirmation: string;
}

export const register = async (payload: RegisterPayload) => {
	const response = await axiosClient.post('/auth/register', payload);
	return {data: response.data, status: response.status};
};

export const verifyEmail = async (payload: VerifyEmailPayload) => {
	const response = await axiosClient.post<
		VerifyEmailPayload,
		VerifyEmailResponse
	>('/auth/verify-email', payload);
	return response.data;
};

export const resendEmailVerification = async (payload: ResendEmailPayload) => {
	const response = await axiosClient.post(
		'/auth/resend-verification-code',
		payload
	);
	return response.data;
};

export const login = async (payload: LoginPayload) => {
	const response = await axiosClient.post<LoginPayload, LoginResponse>(
		'/auth/login',
		payload
	);
	return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
	const response = await axiosClient.post('/auth/forgot-password', payload);
	return response.data;
};

export const verifyCode = async (payload: VerifyEmailPayload) => {
	const response = await axiosClient.post<
		VerifyEmailPayload,
		VerifyEmailResponse
	>('/auth/verify-code', payload);
	return response.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
	const response = await axiosClient.post('/auth/reset-password', payload);
	return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
	const response = await axiosClient.post('/auth/change-password', payload);
	return response.data;
};
