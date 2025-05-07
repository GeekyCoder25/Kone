import React, {useState} from 'react';
import {
	View,
	FlatList,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	Pressable,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {useQuery} from '@tanstack/react-query';
import {getOrders, Order} from '@/services/apis/orders';
import PageContainer from '@/components/PageContainer';
import {FontAwesome6, MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import BagTickIcon from '@/assets/icons/bag-tick';
import BagTimerIcon from '@/assets/icons/bag-timer';
import {router} from 'expo-router';

export default function OrdersScreen() {
	const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

	const {
		data: ordersData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['orders'],
		queryFn: getOrders,
	});

	const renderOrderItem = ({item}: {item: Order}) => {
		const getStatusColor = (status: string) => {
			switch (status) {
				case 'processing':
					return 'bg-amber-100 text-amber-700';
				case 'paid':
					return 'bg-green-100 text-green-700';
				case 'cancelled':
					return 'bg-red-100 text-red-700';
				default:
					return 'bg-gray-100 text-gray-700';
			}
		};

		// Format date nicely
		const formatDate = (dateString: string) => {
			const date = new Date(dateString);
			return `${date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})} - ${date.toLocaleTimeString(undefined, {
				hour12: true,
				timeStyle: 'short',
			})}`;
		};

		const statusColor = getStatusColor(item.attributes.status);
		const productName = item.items[0].product.attributes.name;
		const thumbnailUrl = item.items[0].product.attributes.thumbnail;
		const orderRef = item.attributes.reference;
		const totalAmount = Number(item.attributes.total_amount).toLocaleString();
		const createdDate = formatDate(item.attributes.created_at);

		return (
			<Pressable
				className="bg-white my-2 rounded-xl shadow-sm overflow-hidden border border-gray-100"
				style={{elevation: 2}}
				onPress={() => router.push(`/buyer/order-details?id=${item.id}`)}
			>
				<View className="flex-row p-3">
					<Image
						source={{uri: thumbnailUrl}}
						className="w-24 h-24 rounded-lg"
					/>

					<View className="flex-1 pl-3 justify-between">
						<View>
							<Text className="font-semibold text-base" numberOfLines={1}>
								{productName}
							</Text>

							<Text className="text-xs text-gray-500 mt-1">
								Order #{orderRef}
							</Text>
						</View>

						<View className="flex-row items-center justify-between mt-2">
							<View>
								<Text className="text-xs text-gray-500">{createdDate}</Text>

								<Text className="font-bold text-base mt-1">₦{totalAmount}</Text>
							</View>

							<View className="flex-row items-center">
								<View
									className={`rounded-full px-3 py-1 mr-2 ${
										statusColor.split(' ')[0]
									}`}
								>
									<Text
										className={`text-xs font-medium capitalize ${
											statusColor.split(' ')[1]
										}`}
									>
										{item.attributes.status}
									</Text>
								</View>

								<MaterialCommunityIcons
									name="chevron-right"
									size={22}
									color={Colors.primary}
								/>
							</View>
						</View>
					</View>
				</View>
			</Pressable>
		);
	};

	if (isLoading) {
		return (
			<PageContainer>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			</PageContainer>
		);
	}

	const orders = ordersData?.data || [];

	return (
		<PageContainer className="pb-0 px-5">
			<Text className="text-[#353535] font-poppins-semibold text-lg">
				My Orders
			</Text>
			<View className="flex-row items-center py-3 rounded-t-xl mb-4 gap-x-5">
				<TouchableOpacity
					className={`flex-row justify-center items-center gap-x-2 py-2 px-4 rounded-md ${
						activeTab === 'current' ? 'bg-primary' : 'bg-[#e4f5e5]'
					}`}
					onPress={() => setActiveTab('current')}
				>
					<BagTickIcon
						color={activeTab === 'current' ? '#FFF' : Colors.primary}
					/>
					<Text
						className={`${
							activeTab === 'current' ? 'text-white' : 'text-[#022711]'
						}`}
					>
						My orders
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={`flex-row justify-center items-center gap-x-2 py-2 px-4 rounded-md ${
						activeTab === 'history' ? 'bg-primary' : 'bg-[#e4f5e5]'
					}`}
					onPress={() => setActiveTab('history')}
				>
					<BagTimerIcon
						color={activeTab === 'history' ? '#FFF' : Colors.primary}
					/>
					<Text
						className={`${
							activeTab === 'history' ? 'text-white' : 'text-[#022711]'
						}`}
					>
						Order History
					</Text>
				</TouchableOpacity>
			</View>

			{orders.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<MaterialCommunityIcons
						name="receipt"
						size={64}
						color={Colors.primary}
					/>
					<Text className="text-lg mt-4 text-gray-600">No orders found</Text>
				</View>
			) : (
				<FlatList
					data={orders.filter(order =>
						activeTab === 'current'
							? ['pending', 'processing'].includes(order.attributes.status)
							: ['paid', 'cancelled'].includes(order.attributes.status)
					)}
					renderItem={renderOrderItem}
					keyExtractor={item => item?.id.toString()}
					contentContainerClassName="pb-4"
					showsVerticalScrollIndicator={false}
				/>
			)}
		</PageContainer>
	);
}
