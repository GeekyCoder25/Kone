import {
	View,
	Text,
	Image,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	Modal,
} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getSellerOrderDetails,
	OrderData,
	updateOrderStatus,
} from '@/services/apis/sales';
import {FontAwesome6, Ionicons} from '@expo/vector-icons';
import {useState} from 'react';
import PageContainer from '@/components/PageContainer';

export default function OrderDetails() {
	const {id, fallbackData} = useLocalSearchParams<{
		id: string;
		fallbackData?: string;
	}>();

	const [statusModalVisible, setStatusModalVisible] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState('');

	const queryClient = useQueryClient();

	const parsedFallback: OrderData = fallbackData
		? JSON.parse(fallbackData)
		: null;
	const {data} = useQuery({
		queryKey: ['seller-order-details', id],
		queryFn: () => getSellerOrderDetails(id),
		staleTime: 5 * 60 * 1000,
	});

	// Mock update status mutation - replace with your actual API call
	const {mutate: updateMutate, isPending: updateLoading} = useMutation({
		mutationFn: () =>
			updateOrderStatus(`${order.id}`, {status: selectedStatus}),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({queryKey: ['seller-orders']});
			queryClient.invalidateQueries({queryKey: ['seller-order-details', id]});
			setStatusModalVisible(false);
		},
	});

	const order = data?.data || parsedFallback;

	if (!order) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50">
				<Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
				<Text className="text-gray-600 mt-4 font-medium">
					No order data available.
				</Text>
				<TouchableOpacity className="mt-6 bg-emerald-600 px-4 py-2 rounded-lg">
					<Text className="text-white font-medium">Return to Orders</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const handleStatusUpdate = () => {
		if (selectedStatus && selectedStatus !== status) {
			updateMutate();
		} else {
			setStatusModalVisible(false);
		}
	};

	const {reference, total_amount, delivery_fee, status, created_at} =
		order.attributes;
	const buyer = order.buyer.attributes;
	const address = order.buyer_address?.attributes;

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

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'processing':
				return 'hourglass-outline';
			case 'paid':
				return 'checkmark-circle-outline';
			case 'cancelled':
				return 'close-circle-outline';
			default:
				return 'information-circle-outline';
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

	return (
		<PageContainer>
			<ScrollView
				className="bg-gray-50 flex-1"
				showsVerticalScrollIndicator={false}
			>
				{/* Header Bar */}
				<View className="bg-white py-4 px-4 shadow-sm mb-5 flex-row items-center gap-x-3">
					<TouchableOpacity
						className="flex-row items-center gap-x-3"
						onPress={router.back}
					>
						<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
					</TouchableOpacity>
					<View className="flex-1">
						<View className="flex-row items-center justify-between">
							<Text className="text-xl font-bold text-gray-800">
								Order #{reference}
							</Text>

							<View
								className={`px-3 py-1 rounded-full ${getStatusColor(status)}`}
							>
								<View className="flex-row items-center">
									<Ionicons
										name={getStatusIcon(status)}
										size={16}
										color={
											status === 'paid'
												? '#047857'
												: status === 'processing'
												? '#B45309'
												: '#B91C1C'
										}
									/>
									<Text
										className={`ml-1 font-medium ${getStatusColor(status)}`}
									>
										{status.toUpperCase()}
									</Text>
								</View>
							</View>
						</View>
						<Text className="text-gray-500 text-xs mt-1">
							<Ionicons
								name="calendar-outline"
								size={12}
								color="#6B7280"
								className="mr-1"
							/>
							{formatDate(created_at)}
						</Text>
					</View>
				</View>

				{/* Main Content */}
				<View className="px-4 mb-4">
					{/* Buyer Info Card */}
					<View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
						<View className="bg-emerald-50 py-2 px-4 border-l-4 border-emerald-500">
							<Text className="font-semibold text-emerald-800">
								Buyer Information
							</Text>
						</View>
						<View className="p-4">
							<View className="flex-row items-center mb-2">
								<Ionicons
									name="person-circle-outline"
									size={20}
									color="#047857"
								/>
								<Text className="text-gray-800 font-medium ml-2">
									{buyer.name}
								</Text>
							</View>
							<View className="flex-row items-center mb-2">
								<Ionicons name="call-outline" size={18} color="#6B7280" />
								<Text className="text-gray-600 ml-2">{buyer.phone}</Text>
							</View>
							<View className="flex-row items-start">
								<Ionicons name="location-outline" size={18} color="#6B7280" />
								<Text className="text-gray-600 ml-2">
									{[buyer.city, buyer.state, buyer.country]
										.filter(Boolean)
										.join(', ')}
								</Text>
							</View>
						</View>
					</View>

					{/* Delivery Address Card */}
					{address && (
						<View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
							<View className="bg-blue-50 py-2 px-4 border-l-4 border-blue-500">
								<Text className="font-semibold text-blue-800">
									Delivery Address
								</Text>
							</View>
							<View className="p-4">
								<View className="flex-row items-center mb-2">
									<Ionicons name="person-outline" size={18} color="#1D4ED8" />
									<Text className="text-gray-800 font-medium ml-2">
										{address.recipient_name}
									</Text>
								</View>
								<View className="flex-row items-center mb-2">
									<Ionicons name="call-outline" size={18} color="#6B7280" />
									<Text className="text-gray-600 ml-2">{address.phone}</Text>
								</View>
								<View className="flex-row items-start mb-2">
									<Ionicons name="home-outline" size={18} color="#6B7280" />
									<Text className="text-gray-600 ml-2">{address.address}</Text>
								</View>
								<View className="flex-row items-start">
									<Ionicons name="location-outline" size={18} color="#6B7280" />
									<Text className="text-gray-600 ml-2">
										{address.city}, {address.state}
									</Text>
								</View>
							</View>
						</View>
					)}

					{/* Products Card */}
					<View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
						<View className="bg-purple-50 py-2 px-4 border-l-4 border-purple-500">
							<Text className="font-semibold text-purple-800">Products</Text>
						</View>
						<View className="p-4">
							{order.items?.flat().map(item => {
								const product = item.product.attributes;
								const itemAttr = item.attributes;
								return (
									<View
										key={item.id}
										className="flex-row mb-4 last:mb-0 bg-gray-50 rounded-lg p-2"
									>
										<Image
											source={{uri: product.thumbnail}}
											className="w-20 h-20 rounded-lg"
										/>
										<View className="ml-3 flex-1 justify-between">
											<View>
												<Text className="font-semibold text-gray-800">
													{product.name}
												</Text>
												<Text
													className="text-gray-500 text-xs mt-1"
													numberOfLines={1}
												>
													{product.description || 'No description available'}
												</Text>
											</View>
											<View className="flex-row items-center justify-between mt-2">
												<View className="bg-gray-200 px-2 py-1 rounded-full">
													<Text className="text-xs text-gray-700">
														{itemAttr.quantity} {product.unit}
													</Text>
												</View>
												<View>
													<Text className="text-xs text-gray-600">
														₦{Number(itemAttr.price).toLocaleString()}
													</Text>
													<Text className="text-xs font-medium text-emerald-700 text-right">
														₦{Number(itemAttr.total).toLocaleString()}
													</Text>
												</View>
											</View>
										</View>
									</View>
								);
							})}
						</View>
					</View>

					{/* Order Summary Card */}
					<View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
						<View className="bg-amber-50 py-2 px-4 border-l-4 border-amber-500">
							<Text className="font-semibold text-amber-800">
								Order Summary
							</Text>
						</View>
						<View className="p-4">
							<View className="flex-row justify-between mb-2">
								<Text className="text-gray-600">Subtotal:</Text>
								<Text className="text-gray-800">
									₦{Number(total_amount).toLocaleString()}
								</Text>
							</View>
							<View className="flex-row justify-between mb-2">
								<Text className="text-gray-600">Delivery Fee:</Text>
								<Text className="text-gray-800">
									₦{Number(delivery_fee).toLocaleString()}
								</Text>
							</View>
							<View className="border-t border-gray-200 mt-2 pt-2">
								<View className="flex-row justify-between">
									<Text className="text-gray-800 font-medium">Total:</Text>
									<Text className="text-lg font-bold text-emerald-700">
										₦
										{(
											Number(total_amount) + Number(delivery_fee)
										).toLocaleString()}
									</Text>
								</View>
							</View>
						</View>
					</View>

					{/* Order Status Card */}
					<View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
						<View className="bg-emerald-50 py-2 px-4 border-l-4 border-emerald-500">
							<Text className="font-semibold text-emerald-800">
								Order Status
							</Text>
						</View>
						<View className="p-4">
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center">
									<Ionicons
										name={getStatusIcon(status)}
										size={20}
										color={
											status === 'paid'
												? '#047857'
												: status === 'processing'
												? '#B45309'
												: '#B91C1C'
										}
									/>
									<Text className="ml-2 text-gray-800 font-medium">
										Current Status:{' '}
										<Text className="font-bold">{status.toUpperCase()}</Text>
									</Text>
								</View>
								<TouchableOpacity
									className="bg-emerald-100 px-3 py-1 rounded-lg"
									onPress={() => {
										setSelectedStatus(status);
										setStatusModalVisible(true);
									}}
								>
									<Text className="text-emerald-700 font-medium">Update</Text>
								</TouchableOpacity>
							</View>

							<View className="mt-4 bg-gray-50 p-3 rounded-lg">
								<Text className="text-xs text-gray-500">
									<Ionicons
										name="information-circle-outline"
										size={14}
										color="#6B7280"
									/>{' '}
									Status updates are immediately communicated to the customer
									via email and SMS.
								</Text>
							</View>
						</View>
					</View>

					{/* Action Buttons */}
					<View className="flex-row gap-x-3 mb-8">
						<TouchableOpacity className="flex-1 bg-emerald-600 py-3 rounded-lg items-center justify-center flex-row">
							<Ionicons name="print-outline" size={18} color="white" />
							<Text className="text-white font-medium ml-2">Print Invoice</Text>
						</TouchableOpacity>
						<TouchableOpacity className="flex-1 bg-gray-200 py-3 rounded-lg items-center justify-center flex-row">
							<Ionicons name="chatbox-outline" size={18} color="#4B5563" />
							<Text className="text-gray-700 font-medium ml-2">
								Contact Buyer
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Loading Overlay */}
				{/* {isLoading && (
					<View className="absolute inset-0 bg-white/70 justify-center items-center">
						<View className="bg-white p-6 rounded-xl shadow-lg items-center">
							<ActivityIndicator size="large" color="#047857" />
							<Text className="mt-4 text-gray-700 font-medium">
								Fetching latest details...
							</Text>
						</View>
					</View>
				)} */}

				{/* Status Update Modal */}
				<Modal
					visible={statusModalVisible}
					transparent={true}
					animationType="fade"
					onRequestClose={() => setStatusModalVisible(false)}
				>
					<View className="flex-1 bg-black/50 justify-center items-center p-4">
						<View className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
							<View className="bg-emerald-100 p-4 border-b border-emerald-200">
								<Text className="font-bold text-emerald-800 text-lg">
									Update Order Status
								</Text>
							</View>

							<View className="p-4">
								<Text className="text-gray-700 mb-4">
									Select a new status for this order:
								</Text>

								{/* Status Options */}
								<View className="gap-y-2 mb-6">
									{[
										'processing',
										'paid',
										'shipped',
										'delivered',
										'cancelled',
									].map(statusOption => (
										<TouchableOpacity
											key={statusOption}
											className={`flex-row items-center p-3 rounded-lg border ${
												selectedStatus === statusOption
													? 'border-emerald-500 bg-emerald-50'
													: 'border-gray-200'
											}`}
											onPress={() => setSelectedStatus(statusOption)}
										>
											<View
												className={`h-5 w-5 rounded-full mr-3 border-2 ${
													selectedStatus === statusOption
														? 'border-emerald-600 bg-primary'
														: 'border-gray-400'
												}`}
											>
												{selectedStatus === statusOption && (
													<View className="h-full w-full items-center justify-center">
														<Ionicons
															name="checkmark"
															size={12}
															color="white"
														/>
													</View>
												)}
											</View>
											<Text
												className={`${
													selectedStatus === statusOption
														? 'text-emerald-700 font-medium'
														: 'text-gray-700'
												}`}
											>
												{statusOption.charAt(0).toUpperCase() +
													statusOption.slice(1)}
											</Text>
										</TouchableOpacity>
									))}
								</View>

								{/* Action Buttons */}
								<View className="flex-row gap-x-3">
									<TouchableOpacity
										className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
										onPress={() => setStatusModalVisible(false)}
									>
										<Text className="text-gray-700 font-medium">Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										className="flex-1 bg-primary py-3 rounded-lg items-center flex-row justify-center"
										onPress={handleStatusUpdate}
										disabled={updateLoading}
									>
										{updateLoading ? (
											<ActivityIndicator size="small" color="white" />
										) : (
											<>
												<Ionicons name="save-outline" size={18} color="white" />
												<Text className="text-white font-medium ml-2">
													Update
												</Text>
											</>
										)}
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</PageContainer>
	);
}
