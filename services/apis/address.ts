// Type definitions

import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

export interface Address {
	type: string;
	id: number;
	attributes: {
		recipient_name: string;
		phone: string;
		address: string;
		city: string;
		state: string;
		country: string;
		postal_code: null;
		created_at: string;
	};
}

export interface AddressResponse {
	status: number;
	message: number;
	data: Address[];
}

export interface AddressFormData {
	recipient_name: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
}

// Get all addresses
export const getUserAddresses = async () => {
	const response = await axiosClient.get<AddressResponse>('/buyers/address');
	return response.data;
};

// Add new address
export const addUserAddress = async (address: AddressFormData) => {
	const response = await axiosClient.post<AddressFormData>(
		'/buyers/address',
		address
	);
	return response.data;
};

// Update address
export const updateUserAddress = async (
	id: string,
	address: AddressFormData
) => {
	const response = await axiosClient.put(`/buyers/addresses/${id}`, {
		data: address,
	});
	return response.data;
};

// Delete address
export const deleteUserAddress = async (id: string) => {
	await axiosClient.delete(`/buyers/address/${id}`);
};

// Set address as default
export const setDefaultAddress = async (id: string) => {
	const response = await axiosClient.put(`/user/addresses/${id}/default`);
	return response.data;
};
