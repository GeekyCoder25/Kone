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
import {getSellerOrders, SellerOrder} from '@/services/apis/sales';
import {amountFormat} from '@/utils';

export default function OrdersScreen() {
	const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

	const {
		data: ordersData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['seller-orders'],
		queryFn: getSellerOrders,
	});

	const renderOrderItem = ({item}: {item: SellerOrder}) => {
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

		const statusColor = getStatusColor(item.order.attributes.status);
		const orderRef = item.order.attributes.reference;
		const totalAmount = amountFormat(
			Number(item.order.attributes.total_amount)
		);
		const createdDate = formatDate(item.order.attributes.created_at);

		const buyer = item.buyer.attributes;

		// Flatten the 2D items array
		const flatItems = item.items.flat();

		return (
			<Pressable
				className="bg-white my-3 rounded-2xl shadow-sm overflow-hidden border border-gray-100"
				style={{elevation: 3}}
				onPress={() =>
					router.push({
						pathname: '/seller/order-details',
						params: {
							id: item.order.id,
							fallbackData: JSON.stringify(item.order),
						},
					})
				}
			>
				<View className="p-4">
					{/* Buyer Info */}
					<View className="mb-4 flex-row justify-between items-center">
						<View>
							<Text className="font-poppins-semibold text-base text-gray-900">
								Buyer: {buyer.name}
							</Text>
							<Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
								📞 {buyer.phone}
								{buyer.city ? ` • ${buyer.city}, ${buyer.country}` : ''}
							</Text>
						</View>
						<Text className="text-sm text-gray-400 mt-1">
							ID: {item.order.attributes.reference || 'N/A'}
						</Text>
					</View>

					{/* Products List */}
					{flatItems.map(orderItem => {
						const product = orderItem.product?.attributes;
						if (!orderItem.product) return null;
						return (
							<View key={orderItem?.id} className="flex-row items-start mb-4">
								<Image
									source={{uri: product.thumbnail}}
									className="w-20 h-20 rounded-lg bg-gray-100"
									resizeMode="cover"
								/>
								<View className="flex-1 pl-4">
									<Text className="text-sm text-gray-900" numberOfLines={1}>
										{product.name}
									</Text>
									<Text className="text-sm text-gray-600 mt-1">
										{orderItem.attributes.quantity} {product.unit} x ₦
										{Number(orderItem.attributes.price).toLocaleString()}
									</Text>
									<Text className="text-sm text-gray-700 mt-1">
										Total: ₦
										{Number(orderItem.attributes.total).toLocaleString()}
									</Text>
								</View>
							</View>
						);
					})}

					{/* Order Summary */}
					<View className="flex-row justify-between items-center pt-2 border-t border-gray-100 mt-2">
						<View>
							<Text className="text-sm text-gray-500">{createdDate}</Text>
							<Text className="text-lg font-poppins-bold text-gray-900 mt-1">
								₦{totalAmount}
							</Text>
						</View>
						<View className="flex-row items-center">
							<View
								className={`rounded-full px-3 py-1 mr-2 ${
									statusColor.split(' ')[0]
								} bg-opacity-10`}
							>
								<Text
									className={`text-sm font-poppins-semibold capitalize ${
										statusColor.split(' ')[1]
									}`}
								>
									{item.order.attributes.status}
								</Text>
							</View>
							<MaterialCommunityIcons
								name="chevron-right"
								size={24}
								color={Colors.primary}
							/>
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
			<Text className="text-[#353535] font-poppins-semibold text-xl mb-2">
				My Orders
			</Text>

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
					data={orders}
					renderItem={renderOrderItem}
					keyExtractor={item => item.order?.id.toString()}
					contentContainerClassName="pb-4"
					showsVerticalScrollIndicator={false}
				/>
			)}
		</PageContainer>
	);
}
