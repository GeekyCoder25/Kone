import {User} from '@/types';
import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

interface UserProfileResponse {
	status: number;
	message: string;
	data: {
		type: string;
		id: number;
		attributes: User;
	};
}

export interface UpdateProfilePayload {
	name?: string;
	phone?: string;
	alt_phone?: string;
	address?: string;
	state?: string;
	city?: string;
	country?: string;
	bio?: string;
	farm_name?: string;
	delivery_fee?: string;
}

export const getUserProfile = async () => {
	const response = await axiosClient.get<UserProfileResponse>('/users/profile');
	return response.data;
};

export const updateUserProfile = async (payload: UpdateProfilePayload) => {
	const response = await axiosClient.post('/users/profile', payload);
	return response.data;
};

export const uploadProfilePhoto = async (formData: any) => {
	const response = await axiosClient.post('/users/profile', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const switchMode = async () => {
	const response = await axiosClient.get('/users/toggle');
	return response.data;
};
