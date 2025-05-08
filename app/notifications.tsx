import {
	View,
	TouchableOpacity,
	FlatList,
	StatusBar,
	SafeAreaView,
} from 'react-native';
import React from 'react';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import {MaterialIcons} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';

// Notification item interface
interface NotificationItem {
	id: string;
	title: string;
	description: string;
	icon: string;
	iconBgColor: string;
	date: string;
	isRead: boolean;
}

// Group notifications by date
interface NotificationGroup {
	title: string;
	data: NotificationItem[];
}

const Notifications: React.FC = () => {
	// In a real app, you would fetch notifications from an API
	// const { data: notifications, isLoading } = useQuery({
	//   queryKey: ['notifications'],
	//   queryFn: getNotifications,
	// });

	// Sample data based on the screenshot
	const sampleNotifications: NotificationGroup[] = [
		// {
		// 	title: 'Today',
		// 	data: [
		// 		{
		// 			id: '1',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: new Date().toISOString(),
		// 			isRead: false,
		// 		},
		// 		{
		// 			id: '2',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: new Date().toISOString(),
		// 			isRead: true,
		// 		},
		// 	],
		// },
		// {
		// 	title: 'Yesterday',
		// 	data: [
		// 		{
		// 			id: '3',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: new Date(Date.now() - 86400000).toISOString(),
		// 			isRead: true,
		// 		},
		// 		{
		// 			id: '4',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: new Date(Date.now() - 86400000).toISOString(),
		// 			isRead: true,
		// 		},
		// 	],
		// },
		// {
		// 	title: '25th of June,2025',
		// 	data: [
		// 		{
		// 			id: '5',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: '2025-06-25T10:30:00.000Z',
		// 			isRead: true,
		// 		},
		// 		{
		// 			id: '6',
		// 			title: 'You just got refunded',
		// 			description: 'You were sent 150k for your cow order',
		// 			icon: 'dollar-sign',
		// 			iconBgColor: '#4CAF50',
		// 			date: '2025-06-25T14:45:00.000Z',
		// 			isRead: true,
		// 		},
		// 	],
		// },
	];

	// For testing empty state, uncomment this line
	// const sampleNotifications: NotificationGroup[] = [];

	const handleNotificationPress = (notification: NotificationItem) => {
		// Handle notification press - navigate to relevant screen
		console.log('Notification pressed:', notification.id);
	};

	const renderNotificationItem = ({item}: {item: NotificationItem}) => (
		<TouchableOpacity
			onPress={() => handleNotificationPress(item)}
			className="flex-row items-center px-4 py-3 border-b border-gray-100"
		>
			{/* Icon */}
			<View
				className="w-10 h-10 rounded-full items-center justify-center mr-3"
				style={{backgroundColor: item.iconBgColor}}
			>
				<Feather name={item.icon as any} size={18} color="white" />
			</View>

			{/* Content */}
			<View className="flex-1">
				<Text className="font-poppins-medium text-base">{item.title}</Text>
				<Text className="text-gray-500 text-sm">{item.description}</Text>
			</View>

			{/* Arrow */}
			<Feather name="chevron-right" size={20} color="#9CA3AF" />
		</TouchableOpacity>
	);

	const renderSectionHeader = ({title}: {title: string}) => (
		<View className="bg-gray-50 px-4 py-2">
			<Text className="text-gray-500 font-poppins-medium text-sm">{title}</Text>
		</View>
	);

	// Empty state component
	const renderEmptyList = () => (
		<View className="flex-1 justify-center items-center py-20">
			<View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
				<Feather name="bell" size={50} color="#9CA3AF" />
			</View>
			<Text className="font-poppins-semibold text-lg text-gray-800 mb-2">
				No notifications yet
			</Text>
			<Text className="text-gray-500 text-center px-10">
				We'll notify you when there's something new
			</Text>
		</View>
	);

	// Render the notifications grouped by date
	const renderContent = () => {
		if (sampleNotifications.length === 0) {
			return renderEmptyList();
		}

		return (
			<FlatList
				data={sampleNotifications}
				keyExtractor={item => item.title}
				renderItem={({item}) => (
					<View>
						{renderSectionHeader({title: item.title})}
						{item.data.map(notification => (
							<View key={notification.id}>
								{renderNotificationItem({item: notification})}
							</View>
						))}
					</View>
				)}
			/>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="white" />

			{/* Header */}
			<View className="flex-row items-center px-4 py-3 border-b border-gray-100">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text className="text-xl font-poppins-semibold">Notification</Text>
				<View className="flex-1" />
				<View className="relative">
					<MaterialIcons
						name="notifications-none"
						size={24}
						color={Colors.primary}
					/>
				</View>
			</View>

			{/* Content - Notifications list or empty state */}
			<View className="flex-1">{renderContent()}</View>
		</SafeAreaView>
	);
};

export default Notifications;
