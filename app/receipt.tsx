import {
	View,
	TouchableOpacity,
	Image,
	StatusBar,
	ScrollView,
} from 'react-native';
import React from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import PageContainer from '@/components/PageContainer';
import {useQuery} from '@tanstack/react-query';
import {getSellerOrderDetails} from '@/services/apis/sales';
import {amountFormat} from '@/utils';

interface ReceiptData {
	id: string;
	order_id: string;
	order_number: string;
	date: string;
	vendor: string;
	total_amount: string;
	name: string;
	delivery_address: string;
	phone_number: string;
	items: {
		image: string;
		title: string;
		vendor_username: string;
		order_id: string;
		quantity: number;
	}[];
}

const Receipt: React.FC = () => {
	const params = useLocalSearchParams();
	const orderId = params.id as string;

	const {data: receiptData} = useQuery({
		queryKey: ['seller-order-details', orderId],
		queryFn: () => getSellerOrderDetails(orderId),
		staleTime: 5 * 60 * 1000,
	});

	// In a real app, you would fetch this data from your API based on the orderId

	// Info rows component for reusability
	const InfoRow = ({label, value}: {label: string; value: string}) => (
		<View className="flex-row justify-between py-3 border-b border-gray-100">
			<Text className="text-gray-700">{label}</Text>
			<Text className="font-poppins-medium">{value}</Text>
		</View>
	);

	return (
		<PageContainer>
			<StatusBar barStyle="dark-content" backgroundColor="white" />

			{/* Header */}
			<View className="flex-row items-center pb-3 border-b border-gray-100">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text className="text-xl font-poppins-semibold">Receipt</Text>
				<View className="flex-1" />
				<View className="relative">
					<Feather name="bell" size={22} color="#000" />
					<View className="w-2 h-2 bg-green-600 rounded-full absolute top-0 right-0" />
				</View>
			</View>

			<ScrollView className="flex-1">
				{/* Item Information */}
				{receiptData?.data.items.map((item, index) => (
					<View
						key={index}
						className="mx-4 my-4 p-3 border border-blue-200 rounded-lg bg-blue-50"
					>
						<View className="flex-row">
							<Image
								source={{uri: item.product.attributes.thumbnail}}
								className="w-16 h-16 rounded-md"
							/>
							<View className="ml-3 flex-1 justify-center">
								<Text className="font-poppins-medium">
									{item.product.attributes.name}
								</Text>
								<View className="flex-row items-center mt-1">
									<View className="w-2 h-2 bg-gray-600 rounded-full mr-1" />
									<Text className="text-gray-600 text-sm">
										{item.product.attributes.slug}
									</Text>
								</View>
							</View>
							<View className="justify-center items-end">
								<Text className="text-gray-500 text-xs">
									Order Id: {receiptData.data.attributes.reference}
								</Text>
								<Text className="text-gray-500 text-xs mt-1">
									Quantity: {item.attributes.quantity}
								</Text>
							</View>
						</View>
					</View>
				))}

				{/* Receipt Details */}
				{receiptData && (
					<View className="px-4 py-2">
						<InfoRow
							label="Order Number"
							value={receiptData?.data.attributes.reference}
						/>
						<InfoRow
							label="Date"
							value={receiptData?.data.attributes.created_at}
						/>
						<InfoRow
							label="Total Amount"
							value={amountFormat(
								Number(receiptData?.data.attributes.total_amount)
							)}
						/>
						<InfoRow
							label="Name"
							value={receiptData?.data.buyer_address.attributes.recipient_name}
						/>
						<InfoRow
							label="Delivery address"
							value={receiptData?.data.buyer_address.attributes.address}
						/>
						<InfoRow
							label="Phone number"
							value={receiptData?.data.buyer_address.attributes.phone}
						/>
					</View>
				)}

				{/* Action Buttons */}
				{/* <View className="px-4 py-6 space-y-3">
					<TouchableOpacity className="bg-green-600 py-3 rounded-lg items-center">
						<Text className="text-white font-poppins-medium">
							Download Receipt
						</Text>
					</TouchableOpacity>

					<TouchableOpacity className="border border-green-600 py-3 rounded-lg items-center">
						<Text className="text-green-600 font-poppins-medium">
							Contact Seller
						</Text>
					</TouchableOpacity>
				</View> */}
			</ScrollView>
		</PageContainer>
	);
};

export default Receipt;
