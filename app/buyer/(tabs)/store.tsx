import React, {useEffect, useState} from 'react';
import {
	View,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {useGlobalStore} from '@/context/store';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getCart,
	addToCart,
	deleteCartItem,
	clearCart,
} from '@/services/apis/products';
import {checkout} from '@/services/apis/orders';
import {amountFormat} from '@/utils';
import {
	Feather,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import Button from '@/components/ui/button';
import {PaystackPayment} from '@/components/ui/PaystackPayment';
import {router} from 'expo-router';
import {Address, getUserAddresses} from '@/services/apis/address';
import SelectAddressModal from '@/components/SelectAddressModal';

export default function StoreScreen() {
	const {setCart} = useGlobalStore();
	const queryClient = useQueryClient();
	const [paymentUrl, setPaymentUrl] = useState('');
	const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
	const [showAddressModal, setShowAddressModal] = useState(false);

	const {data: cartData, isLoading} = useQuery({
		queryKey: ['cart'],
		queryFn: getCart,
		refetchOnWindowFocus: true,
	});

	const {data: addressesData, isSuccess: isAddressSuccess} = useQuery({
		queryKey: ['addresses'],
		queryFn: getUserAddresses,
	});

	const {mutate: updateQuantity} = useMutation({
		mutationFn: addToCart,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['cart']});
		},
		onError(error: any) {
			console.log(error.response.data);
			Toast.show({
				type: 'error',
				text1: 'Failed to update cart',
				text2: error.response?.data?.message || error.message,
			});
		},
	});

	const {mutate: deleteItemMutation, isPending: isDeleting} = useMutation({
		mutationFn: deleteCartItem,
		onSuccess: data => {
			setCart(data.data);
			queryClient.invalidateQueries({queryKey: ['cart']});
		},
	});

	const {mutate: clearCartMutation, isPending: isClearing} = useMutation({
		mutationFn: clearCart,
		onSuccess: data => {
			setCart(data.data);
			queryClient.invalidateQueries({queryKey: ['cart']});
		},
	});

	const {mutate: checkoutMutation, isPending: isCheckingOut} = useMutation({
		mutationFn: checkout,
		onSuccess: async data => {
			try {
				setPaymentUrl(data.data.payment_url);
			} catch (error) {
				Toast.show({
					type: 'error',
					text1: 'Failed to open payment page',
					text2: 'Please try again',
				});
			}
		},
		onError: (error: any) => {
			Toast.show({
				type: 'error',
				text1: 'Checkout Failed',
				text2: error.response?.data?.message || error.message,
			});
			queryClient.invalidateQueries({queryKey: ['cart']});
		},
	});

	useEffect(() => {
		if (isAddressSuccess && addressesData.data?.length) {
			setSelectedAddress(addressesData.data[0]);
		}
	}, [isAddressSuccess]);

	const handleQuantityChange = (
		id: number,
		currentQuantity: number,
		increase: boolean,
		stockQuantity: number
	) => {
		const newQuantity = increase ? currentQuantity + 1 : currentQuantity - 1;
		if (newQuantity >= 1) {
			if (increase && newQuantity > stockQuantity) {
				Toast.show({
					type: 'error',
					text1: 'Maximum quantity reached',
					text2: `Only ${stockQuantity} items available in stock`,
				});
				return;
			}
			updateQuantity({product_id: id, quantity: newQuantity});
		}
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#6AAB85" />
			</View>
		);
	}

	const cartItems = cartData?.data || [];
	const deliveryFee = 700;
	const subtotal = cartItems.reduce(
		(sum, item) => sum + Number(item.attributes.total_price),
		0
	);
	const total = subtotal + deliveryFee;

	if (cartItems.length === 0) {
		return (
			<PageContainer>
				<View className="flex-1 items-center justify-center">
					<MaterialCommunityIcons
						name="cart-outline"
						size={64}
						color="#6AAB85"
					/>
					<Text className="text-lg mt-4 text-gray-600">Your cart is empty</Text>
				</View>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-xl font-poppins-semibold">
					My Cart ({cartItems.length})
				</Text>
				<TouchableOpacity
					onPress={() => clearCartMutation()}
					disabled={isClearing}
					className="py-2 px-4 rounded-full bg-red-50"
				>
					<Text className="text-red-500">Clear Cart</Text>
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				{cartItems.map(item => (
					<View
						key={item.id}
						className="flex-row bg-white p-4 rounded-xl mb-4 items-center"
					>
						<Image
							source={{uri: item.attributes.products.attributes.thumbnail}}
							className="w-20 h-20 rounded-xl"
							resizeMode="cover"
						/>
						<View className="flex-1 flex-row justify-between items-center ml-4">
							<View className="flex-1 items-start">
								<View className="flex-1">
									<Text className="font-poppins-medium text-base">
										{item.attributes.products.attributes.name}
									</Text>
									<Text className="text-gray-500">
										@{item.attributes.products.attributes.slug.split('-')[0]}
									</Text>
								</View>
								<Text className="font-poppins-semibold text-lg mt-2">
									₦{amountFormat(Number(item.attributes.unit_price))}
								</Text>
							</View>
							<View className="flex-1 flex-row justify-between items-center">
								<View className="flex-row items-center">
									<TouchableOpacity
										onPress={() =>
											handleQuantityChange(
												item.attributes.products.id,
												item.attributes.quantity,
												false,
												item.attributes.products.attributes.stock_quantity
											)
										}
										className={`w-7 h-7 justify-center items-center rounded-full ${
											item.attributes.quantity <= 1
												? 'bg-[#70bf73]'
												: 'bg-button'
										}`}
									>
										<Text className="text-white text-2xl">-</Text>
									</TouchableOpacity>
									<Text className="mx-2 text-black text-2xl">
										×{item.attributes.quantity}
									</Text>
									<TouchableOpacity
										onPress={() =>
											handleQuantityChange(
												item.attributes.products.id,
												item.attributes.quantity,
												true,
												item.attributes.products.attributes.stock_quantity
											)
										}
										className={`w-7 h-7 justify-center items-center rounded-full bg-button`}
									>
										<Text className="text-white text-2xl">+</Text>
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									onPress={() => deleteItemMutation(item.id)}
									disabled={isDeleting}
								>
									<Ionicons name="trash" size={24} color="#822d20" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				))}
				<View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
					<View className="flex-row justify-between items-center mb-3">
						<Text className="font-poppins-semibold text-base">
							Delivery Address
						</Text>
						<TouchableOpacity
							onPress={() => setShowAddressModal(true)}
							className="py-1 px-3 bg-gray-100 rounded-full"
						>
							<Text className="text-green-700 text-sm font-poppins-medium">
								{selectedAddress ? 'Change' : 'Select'}
							</Text>
						</TouchableOpacity>
					</View>

					{selectedAddress ? (
						<View className="flex-row items-start">
							<MaterialIcons name="location-on" size={20} color="#6AAB85" />
							<View className="ml-2 flex-1">
								<Text className="font-poppins-medium">
									{selectedAddress.attributes.recipient_name}
								</Text>
								<Text className="text-gray-600 text-sm">
									{selectedAddress.attributes.address}
								</Text>
								<Text className="text-gray-600 text-sm">
									{selectedAddress.attributes.city},{' '}
									{selectedAddress.attributes.state}
								</Text>
								<Text className="text-gray-600 text-sm">
									{selectedAddress.attributes.phone}
								</Text>
							</View>
						</View>
					) : (
						<View className="items-center py-3">
							<Text className="text-gray-500">No address selected</Text>
						</View>
					)}

					<TouchableOpacity
						onPress={() => router.push('/address')}
						className="mt-3 py-2 flex-row justify-center items-center bg-gray-100 rounded-lg"
					>
						<Feather name="plus" size={16} color="#6AAB85" />
						<Text className="ml-2 text-green-700 font-poppins-medium">
							Add New Address
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<View className="mt-4 rounded-xl">
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-600">Subtotal</Text>
					<Text className="font-poppins-medium">₦{amountFormat(subtotal)}</Text>
				</View>
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-600">Delivery Fee</Text>
					<Text className="font-poppins-medium">
						₦{amountFormat(deliveryFee)}
					</Text>
				</View>
				<View className="flex-row justify-between mb-4 pt-2 border-t border-gray-100">
					<Text className="text-gray-900 font-poppins-medium">Total</Text>
					<Text className="font-poppins-semibold text-lg">
						₦{amountFormat(total)}
					</Text>
				</View>
				{selectedAddress && (
					<Button
						title="Pay"
						onPress={() =>
							checkoutMutation({
								callback_url: 'https://google.com',
								user_address_id: selectedAddress.id,
							})
						}
						isLoading={isCheckingOut}
					/>
				)}
				<PaystackPayment
					isVisible={!!paymentUrl}
					onSuccess={() => {
						setPaymentUrl('');
						router.navigate('/buyer/(tabs)/orders');
						queryClient.invalidateQueries({queryKey: ['orders']});
					}}
					onClose={() => {
						setPaymentUrl('');
						queryClient.invalidateQueries({queryKey: ['cart']});
					}}
					paymentUrl={paymentUrl}
				/>
			</View>
			<SelectAddressModal
				showModal={showAddressModal}
				setShowModal={setShowAddressModal}
				selectedAddress={selectedAddress}
				setSelectedAddress={setSelectedAddress}
				addressesData={addressesData}
			/>
		</PageContainer>
	);
}
