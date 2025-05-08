import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

export interface BankAccount {
	type: string;
	id: number;
	attributes: {
		bank_name: string;
		account_name: string;
		account_number: string;
		created_at: string;
	};
}

export interface BankAccountResponse {
	status: number;
	message: string;
	data: BankAccount[];
}

// Bank list interfaces
export interface Bank {
	id: number;
	name: string;
	slug: string;
	code: string;
	longcode: string;
	gateway: string;
	pay_with_bank: boolean;
	supports_transfer: boolean;
	active: boolean;
	country: string;
	currency: string;
	type: string;
	is_deleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface BankListResponse {
	status: number;
	message: string;
	data: {
		banks_count: number;
		banks: Bank[];
	};
}
// Account verification interfaces
export interface AccountVerificationRequest {
	account_number: string;
	bank_code: string;
}
export interface RequestWithdrawalPayload {
	amount: number;
	bank_id: number;
}

export interface AccountVerificationResponse {
	status: number;
	message: string;
	data: {
		status: boolean;
		message: string;
		data: {
			account_number: string;
			account_name: string;
			bank_id: string;
		};
	};
}

export interface BankAccountFormData {
	bank_name: string;
	account_name: string;
	account_number: string;
	bank_code: string;
}

export interface BankAccount {
	type: string;
	id: number;
	attributes: {
		bank_name: string;
		account_name: string;
		account_number: string;
		created_at: string;
	};
}

export interface BankAccountResponse {
	status: number;
	message: string;
	data: BankAccount[];
}

// Get all bank accounts
export const getBankAccounts = async () => {
	const response = await axiosClient.get<BankAccountResponse>('/sellers/bank');
	return response.data;
};

// Add new bank account
export const addBankAccount = async (bankAccount: BankAccountFormData) => {
	const response = await axiosClient.post<BankAccountFormData>(
		'/sellers/bank',
		bankAccount
	);
	return response.data;
};

// Delete bank account
export const deleteBankAccount = async (bankAccountId: number) => {
	const response = await axiosClient.delete(`/sellers/bank/${bankAccountId}`);
	return response.data;
};

// Get all banks
export const getAllBanks = async () => {
	const response = await axiosClient.get<BankListResponse>('/generals/banks');
	return response.data;
};

// Verify account number
export const verifyAccountNumber = async (data: AccountVerificationRequest) => {
	const response = await axiosClient.post<
		AccountVerificationRequest,
		AccountVerificationResponse
	>('/generals/verify-account-number', data);
	return response.data;
};

export const requestWithdrawal = async (data: RequestWithdrawalPayload) => {
	const response = await axiosClient.post<
		RequestWithdrawalPayload,
		AccountVerificationResponse
	>('/sellers/withdraw', data);
	return response.data;
};
