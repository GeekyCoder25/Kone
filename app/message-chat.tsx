import {
	View,
	TextInput,
	TouchableOpacity,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	StatusBar,
	ActivityIndicator,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import {getChatMessages, sendMessage} from '@/services/apis/messages';

// Message interface
interface Message {
	id: string;
	text: string;
	timestamp: string;
	is_mine: boolean;
	is_read?: boolean;
	attachments?: {
		type: 'image' | 'product';
		url: string;
		product_id?: string;
		product_name?: string;
		product_price?: string;
	}[];
}

const Chat: React.FC = () => {
	const {id, name} = useLocalSearchParams<{id: string; name: string}>();
	const [messageText, setMessageText] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const flatListRef = useRef<FlatList>(null);
	const queryClient = useQueryClient();

	// Fetch messages
	const {data: messagesData, isLoading} = useQuery({
		queryKey: ['chat', id],
		queryFn: () => getChatMessages(id),
	});

	// Sample data for preview (you would replace this with actual data from API)
	const sampleMessages: Message[] = [
		{
			id: '1',
			text: "Hello, I'm interested in your products.",
			timestamp: '08:05',
			is_mine: false,
		},
		{
			id: '2',
			text: 'Hi there! Thank you for your interest. What specific products are you looking for?',
			timestamp: '08:06',
			is_mine: true,
			is_read: true,
		},
		{
			id: '3',
			text: 'I want this for your cow order',
			timestamp: '08:10',
			is_mine: false,
			attachments: [
				{
					type: 'product',
					url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1740&auto=format&fit=crop',
					product_id: '123',
					product_name: 'Premium Cow',
					product_price: '120,000',
				},
			],
		},
	];

	const messages = messagesData?.data || [];

	// Send message mutation
	const {mutate: sendMessageMutation, isPending: isSendingMessage} =
		useMutation({
			mutationFn: sendMessage,
			onSuccess: () => {
				setMessageText('');
				queryClient.invalidateQueries({queryKey: ['chat', id]});
			},
		});

	// Auto scroll to bottom when new messages arrive
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({animated: true});
			}, 200);
		}
	}, [messages.length]);

	const handleSend = () => {
		if (messageText.trim() === '') return;

		const newMessage = {
			conversation_id: id,
			text: messageText,
		};

		sendMessageMutation(newMessage);
	};

	const renderMessage = ({item}: {item: Message}) => (
		<View
			className={`max-w-[80%] mb-4 ${item.is_mine ? 'self-end' : 'self-start'}`}
		>
			{/* Message content */}
			<View
				className={`p-3 rounded-xl ${
					item.is_mine
						? 'bg-primary rounded-br-none'
						: 'bg-gray-100 rounded-bl-none'
				}`}
			>
				{/* Product attachment if exists */}
				{item.attachments?.map(
					(attachment, index) =>
						attachment.type === 'product' && (
							<TouchableOpacity
								key={index}
								className="bg-white p-2 rounded-lg mb-2 border border-gray-200"
								onPress={() => {
									if (attachment.product_id) {
										router.push({
											pathname: '/seller/product-details',
											params: {id: attachment.product_id},
										});
									}
								}}
							>
								<View className="flex-row">
									<Image
										source={{uri: attachment.url}}
										className="w-16 h-16 rounded-md"
									/>
									<View className="ml-2 flex-1 justify-center">
										<Text className="font-poppins-medium">
											{attachment.product_name}
										</Text>
										<Text className="text-gray-500">
											₦{attachment.product_price}
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						)
				)}

				{/* Message text */}
				<Text className={`${item.is_mine ? 'text-white' : 'text-black'}`}>
					{item.text}
				</Text>
			</View>

			{/* Timestamp and read status */}
			<View
				className={`flex-row mt-1 ${
					item.is_mine ? 'justify-end' : 'justify-start'
				}`}
			>
				<Text className="text-xs text-gray-500 mr-1">{item.timestamp}</Text>
				{item.is_mine && item.is_read && (
					<Feather name="check-circle" size={12} color="#4CAF50" />
				)}
			</View>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="white" />

			{/* Header */}
			<View className="flex-row items-center px-4 py-3 border-b border-gray-100">
				<TouchableOpacity onPress={() => router.back()} className="mr-3">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>

				<Image
					source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
					className="w-8 h-8 rounded-full mr-3"
				/>

				<View className="flex-1">
					<Text className="font-poppins-medium">{name || 'Chat'}</Text>
					{isTyping ? (
						<Text className="text-xs text-green-600">Typing...</Text>
					) : (
						<Text className="text-xs text-gray-500">Online</Text>
					)}
				</View>

				<TouchableOpacity className="mr-4">
					<Feather name="phone" size={20} color="#000" />
				</TouchableOpacity>

				<TouchableOpacity>
					<Feather name="more-vertical" size={20} color="#000" />z
				</TouchableOpacity>
			</View>

			{/* Messages list */}
			{isLoading ? (
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#4CAF50" />
				</View>
			) : (
				<FlatList
					ref={flatListRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={item => item.id}
					contentContainerStyle={{padding: 16}}
					showsVerticalScrollIndicator={false}
				/>
			)}

			{/* Message input */}
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
			>
				<View className="flex-row items-center p-2 border-t border-gray-200">
					<TouchableOpacity className="p-2">
						<Feather name="plus-circle" size={24} color="#7fb796" />
					</TouchableOpacity>

					<TextInput
						className="flex-1 bg-gray-100 rounded-full px-4 py-2 mx-2"
						placeholder="Type a message..."
						value={messageText}
						onChangeText={setMessageText}
						multiline
					/>

					{messageText.trim() ? (
						<TouchableOpacity
							className="bg-primary w-10 h-10 rounded-full items-center justify-center"
							onPress={handleSend}
							disabled={isSendingMessage}
						>
							{isSendingMessage ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Feather name="send" size={18} color="white" />
							)}
						</TouchableOpacity>
					) : (
						<TouchableOpacity className="p-2">
							<Feather name="mic" size={24} color="#7fb796" />
						</TouchableOpacity>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default Chat;
