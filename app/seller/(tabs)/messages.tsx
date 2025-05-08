import {
	View,
	TouchableOpacity,
	FlatList,
	Image,
	StatusBar,
	SafeAreaView,
} from 'react-native';
import React from 'react';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import {ConversationData, getConversations} from '@/services/apis/messages';
import {useGlobalStore} from '@/context/store';
import {MaterialIcons} from '@expo/vector-icons';

// Message conversation item interface

const Messages: React.FC = () => {
	const {user} = useGlobalStore();
	// Fetch conversations
	const {data: conversations, isLoading} = useQuery({
		queryKey: ['conversations'],
		// queryFn: getConversations,
		queryFn: () => ({data: []}),
	});

	// Sample data for preview (you would replace this with actual data from API)
	const sampleConversations = [
		{
			id: '1',
			user: {
				id: '101',
				name: 'Hey! store',
				avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
				is_online: true,
			},
			store_name: 'Just joined',
			last_message: '',
			timestamp: '8:10',
		},
		{
			id: '2',
			user: {
				id: '102',
				name: 'Real store',
				avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
			},
			store_name: '',
			last_message: 'I want this for your cow order',
			timestamp: '8:10',
			unread_count: 1,
		},
		{
			id: '3',
			user: {
				id: '103',
				name: 'Veee store',
				avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
			},
			store_name: '',
			last_message: 'I want this for your cow order',
			timestamp: '8:10',
		},
	];

	const actualConversations = conversations?.data || [];

	const navigateToChat = (conversation: ConversationData) => {
		router.push({
			pathname: '/message-chat',
			params: {id: conversation.id, name: conversation.user.name},
		});
	};

	const renderConversationItem = ({item}: {item: ConversationData}) => (
		<TouchableOpacity
			onPress={() => navigateToChat(item)}
			className="flex-row items-center px-4 py-3 border-b border-gray-100"
		>
			{/* Avatar */}
			<View className="relative mr-3">
				<Image
					source={{uri: item.user.avatar}}
					className="w-12 h-12 rounded-full"
				/>
				{item.user.is_online && (
					<View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
				)}
			</View>

			{/* Message content */}
			<View className="flex-1">
				<View className="flex-row justify-between">
					<Text className="font-poppins-medium text-base">
						{item.user.name}
					</Text>
					<Text className="text-gray-500 text-xs">{item.timestamp}</Text>
				</View>

				{item.store_name ? (
					<View className="flex-row items-center">
						<View className="w-4 h-4 bg-yellow-500 rounded-full items-center justify-center mr-1">
							<Feather name="star" size={10} color="white" />
						</View>
						<Text className="text-gray-500 text-sm">{item.store_name}</Text>
					</View>
				) : (
					<Text numberOfLines={1} className="text-gray-500 text-sm">
						{item.last_message}
					</Text>
				)}
			</View>

			{/* Unread indicator */}
			{item.unread_count && item.unread_count > 0 && (
				<View className="w-5 h-5 rounded-full bg-green-600 items-center justify-center ml-2">
					<Text className="text-white text-xs font-poppins-medium">
						{item.unread_count}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);

	const renderEmptyList = () => (
		<View className="flex-1 justify-center items-center py-20">
			<View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
				<Feather name="message-circle" size={50} color="#9CA3AF" />
			</View>
			<Text className="font-poppins-semibold text-lg text-gray-800 mb-2">
				No messages yet
			</Text>
			<Text className="text-gray-500 text-center px-10 mb-6">
				{user?.is_buyer
					? 'Start a conversation with stores to see your messages here'
					: 'Chats between you and your buyers will show up here'}
			</Text>
			{user?.is_buyer && (
				<TouchableOpacity
					onPress={() => router.push('/buyer/(tabs)')}
					className="bg-green-600 px-6 py-3 rounded-full"
				>
					<Text className="text-white font-poppins-medium">Browse stores</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="white" />

			{/* Header */}
			<View className="flex-row items-center px-4 py-3 border-b border-gray-100">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text className="text-xl font-poppins-semibold">Messages</Text>
				<View className="flex-1" />
				<TouchableOpacity onPress={() => router.push('/notifications')}>
					<MaterialIcons name="notifications-none" size={24} color="#333" />
				</TouchableOpacity>
			</View>

			{/* Conversations list */}
			<FlatList
				data={actualConversations}
				renderItem={renderConversationItem}
				keyExtractor={item => item.id}
				ListEmptyComponent={renderEmptyList}
				contentContainerStyle={
					actualConversations.length === 0 ? {flex: 1} : null
				}
			/>
		</SafeAreaView>
	);
};

export default Messages;
