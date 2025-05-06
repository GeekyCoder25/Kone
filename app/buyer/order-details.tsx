import React from 'react';
import {View, ScrollView, Image, ActivityIndicator} from 'react-native';
import {Text} from '@/components/ui/Text';
import {useQuery} from '@tanstack/react-query';
import {getOrders, Order} from '@/services/apis/orders';
import PageContainer from '@/components/PageContainer';
import {FontAwesome6, MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';
import {TouchableOpacity} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {amountFormat} from '@/utils';

const OrderDetails = () => {
	const {id} = useLocalSearchParams<{id: string}>();

	const {data: ordersData, isLoading} = useQuery({
		queryKey: ['orders'],
		queryFn: getOrders,
	});

	const order = ordersData?.data.find(order => order.id === Number(id));

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

	if (isLoading) {
		return (
			<PageContainer>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			</PageContainer>
		);
	}

	if (!order) {
		return (
			<PageContainer>
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-gray-600">Order not found</Text>
				</View>
			</PageContainer>
		);
	}

	const statusColor = getStatusColor(order.attributes.status);

	return (
		<PageContainer className="px-5">
			<TouchableOpacity
				className="flex-row items-center gap-x-3 mb-3"
				onPress={router.back}
			>
				<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
				<Text className="text-[#353535] font-poppins-semibold text-lg">
					Order Details
				</Text>
			</TouchableOpacity>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="bg-white rounded-xl py-4 px-2">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-gray-500">
							Order #{order.attributes.reference}
						</Text>
						<View
							className={`rounded-full px-3 py-1 ${statusColor.split(' ')[0]}`}
						>
							<Text
								className={`text-xs font-medium capitalize ${
									statusColor.split(' ')[1]
								}`}
							>
								{order.attributes.status}
							</Text>
						</View>
					</View>
					<View className="mb-2">
						<Text className="text-gray-500 mb-1">Order Date</Text>
						<Text className="font-poppins-medium">
							{formatDate(order.attributes.created_at)}
						</Text>
					</View>
				</View>

				<View className="bg-white rounded-xl px-2 mb-4">
					<Text className="font-poppins-semibold text-base mb-4">
						Order Items
					</Text>
					{order.items.map((item, index) => (
						<View
							key={item.id}
							className={`flex-row ${
								index !== order.items.length - 1 ? 'mb-4' : ''
							}`}
						>
							<Image
								source={{uri: item.product.attributes.thumbnail}}
								className="w-20 h-20 rounded-lg"
							/>
							<View className="flex-1 ml-3">
								<Text className="font-poppins-medium" numberOfLines={2}>
									{item.product.attributes.name}
								</Text>
								<Text className="text-gray-500 text-sm mt-1">
									Quantity: {item.attributes.quantity.toLocaleString()}
								</Text>
								<Text className="font-poppins-semibold mt-1">
									₦{amountFormat(Number(item.attributes.total))}
								</Text>
							</View>
						</View>
					))}
				</View>

				<View className="bg-white rounded-xl p-4 mb-4">
					<Text className="font-poppins-semibold text-base mb-4">
						Price Details
					</Text>
					<View className="flex-row justify-between mb-2">
						<Text className="text-gray-500">Items Total</Text>
						<Text className="font-poppins-medium">
							₦{amountFormat(Number(order.attributes.total_amount))}
						</Text>
					</View>
					<View className="flex-row justify-between mb-2">
						<Text className="text-gray-500">Delivery Fee</Text>
						<Text className="font-poppins-medium">
							₦
							{order.attributes.delivery_fee
								? amountFormat(Number(order.attributes.delivery_fee))
								: '0.00'}
						</Text>
					</View>
					<View className="h-[1px] bg-gray-200 my-2" />
					<View className="flex-row justify-between">
						<Text className="font-poppins-semibold">Total Amount</Text>
						<Text className="font-poppins-semibold text-primary">
							₦
							{amountFormat(
								Number(order.attributes.total_amount) +
									Number(order.attributes.delivery_fee || 0)
							)}
						</Text>
					</View>
				</View>
			</ScrollView>
		</PageContainer>
	);
};

export default OrderDetails;
