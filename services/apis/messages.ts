import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

// Conversation Types

export interface ConversationData {
	id: string;
	user: {
		id: string;
		name: string;
		avatar: string;
		is_online?: boolean;
	};
	store_name?: string;
	last_message?: string;
	timestamp: string;
	unread_count?: number;
}

export interface ConversationsResponse {
	data: ConversationData[];
	meta?: {
		current_page: number;
		from: number;
		last_page: number;
		per_page: number;
		to: number;
		total: number;
	};
}

// Message Types
export interface MessageAttachment {
	type: 'image' | 'product';
	url: string;
	product_id?: string;
	product_name?: string;
	product_price?: string;
}

export interface MessageData {
	id: string;
	text: string;
	timestamp: string;
	is_mine: boolean;
	is_read?: boolean;
	attachments?: MessageAttachment[];
}

export interface MessagesResponse {
	data: MessageData[];
	meta?: {
		current_page: number;
		from: number;
		last_page: number;
		per_page: number;
		to: number;
		total: number;
	};
}

// axiosClient Functions

// Get all conversations
export const getConversations = async () => {
	try {
		const response = await axiosClient.get<ConversationsResponse>(
			'/conversations'
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch conversations:', error);
		throw error;
	}
};

// Get messages for a specific conversation
export const getChatMessages = async (conversationId: string) => {
	try {
		const response = await axiosClient.get<MessagesResponse>(
			`/conversations/${conversationId}/messages`
		);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch messages:', error);
		throw error;
	}
};

// Send a new message
export interface SendMessageRequest {
	conversation_id: string;
	text: string;
	attachment_id?: string;
	product_id?: string;
}

export const sendMessage = async (data: SendMessageRequest) => {
	try {
		const response = await axiosClient.post<SendMessageRequest, MessageData>(
			'/messages',
			data
		);
		return response.data;
	} catch (error) {
		console.error('Failed to send message:', error);
		throw error;
	}
};

// Mark messages as read
export const markMessagesAsRead = async (
	conversationId: string
): Promise<void> => {
	try {
		await axiosClient.put(`/conversations/${conversationId}/read`);
	} catch (error) {
		console.error('Failed to mark messages as read:', error);
		throw error;
	}
};

// Create a new conversation
export interface CreateConversationRequest {
	recipient_id: string;
	message?: string;
}

export const createConversation = async (data: CreateConversationRequest) => {
	try {
		const response = await axiosClient.post<
			CreateConversationRequest,
			ConversationData
		>('/conversations', data);
		return response.data;
	} catch (error) {
		console.error('Failed to create conversation:', error);
		throw error;
	}
};
