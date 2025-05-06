import {
	View,
	Image,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import React from 'react';
import {Text} from '@/components/ui/Text';
import {router, useLocalSearchParams} from 'expo-router';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import {amountFormat} from '@/utils';
import {
	getProducts,
	addToCart,
	addToWishlist,
	removeFromWishlist,
	getWishlist,
} from '@/services/apis/products';
import {useGlobalStore} from '@/context/store';
import {Colors} from '@/constants/Colors';
import Toast from 'react-native-toast-message';

const ProductDetails = () => {
	const {cart, setCart} = useGlobalStore();
	const queryClient = useQueryClient();
	const params: {id: string; wishlist_id: string} = useLocalSearchParams();

	const {data: productsData} = useQuery({
		queryKey: ['products'],
		queryFn: getProducts,
	});

	const {data: wishlistData} = useQuery({
		queryKey: ['wishlist'],
		queryFn: getWishlist,
	});

	const product = productsData?.data.products.find(
		p =>
			p.id.toString() === (Array.isArray(params.id) ? params.id[0] : params.id)
	);

	const isInWishlist = wishlistData?.message?.some(
		item => item.product.id === product?.id
	);

	if (!product) {
		return (
			<PageContainer>
				<View className="flex-1 justify-center items-center">
					<Text>Product not found</Text>
				</View>
			</PageContainer>
		);
	}

	const {mutate: addToCartMutation, isPending: isAddingToCart} = useMutation({
		mutationFn: addToCart,
		onSuccess: data => {
			setCart([...(cart || []), data.data]);
			queryClient.invalidateQueries({queryKey: ['cart']});
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Item added to cart',
			});
		},
	});

	const {mutate: toggleWishlistMutation, isPending: isTogglingWishlist} =
		useMutation({
			mutationFn: (productId: number) =>
				isInWishlist
					? removeFromWishlist(Number(params.wishlist_id))
					: addToWishlist(productId),
			onSuccess: () => {
				queryClient.invalidateQueries({queryKey: ['wishlist']});
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: isInWishlist
						? 'Item removed from wishlist'
						: 'Item added to wishlist',
				});
			},
			onError(error: any) {
				console.log(error?.response?.data || error.message);
			},
		});

	const isInCart = cart?.some(
		cartItem => cartItem.attributes.products.id === product.id
	);

	const handleAddToCart = () => {
		if (!isInCart) {
			addToCartMutation({
				product_id: product.id,
				quantity: 1,
			});
		}
	};

	const handleOrder = () => {
		addToCartMutation({
			product_id: product.id,
			quantity: 1,
		});
		router.push('/buyer/(tabs)/store');
	};

	const handleToggleWishlist = () => {
		toggleWishlistMutation(product.id);
	};

	return (
		<PageContainer noPadding className="py-0">
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="relative">
					<Image
						source={{uri: product.attributes.thumbnail}}
						className="w-full h-72"
						resizeMode="cover"
					/>

					<TouchableOpacity
						className="absolute top-4 left-4 rounded-full"
						onPress={router.back}
					>
						<AntDesign name="leftcircle" size={32} color="#ffffff" />
					</TouchableOpacity>
					<TouchableOpacity
						className={`absolute top-4 right-4 ${
							isInWishlist ? 'bg-red-50' : 'bg-white'
						} p-2 rounded-full`}
						onPress={handleToggleWishlist}
						disabled={isTogglingWishlist}
					>
						{isTogglingWishlist ? (
							<ActivityIndicator size="small" color={Colors.primary} />
						) : (
							<MaterialIcons
								name={isInWishlist ? 'favorite' : 'favorite-border'}
								size={24}
								color={isInWishlist ? '#ef4444' : Colors.primary}
							/>
						)}
					</TouchableOpacity>
				</View>

				<View className="mt-2 p-4">
					<View className="flex-row justify-between items-center">
						<View>
							<Text className="text-2xl font-poppins-semibold text-black">
								{product.attributes.name}
							</Text>

							<View className="flex-row items-center mt-1 mb-2">
								<Text className="text-[#848484]">By</Text>
								<Text className="ml-1 text-primary font-poppins-medium">
									Vetchthefarmer
								</Text>
							</View>
						</View>
						<View className="flex-row items-center gap-x-2">
							<Text className="text-black text-2xl">4.0</Text>
							<MaterialIcons name="star" size={26} color="#FFB800" />
						</View>
					</View>

					<View className="mb-4">
						<View className=" justify-between mb-2">
							<Text className="text-[#353535]">Quantity</Text>
							<View className="flex-row items-center">
								<View className="w-3 h-3 rounded-full bg-[#6AAB85] mr-2" />
								<Text>
									{product.attributes.stock_quantity?.toLocaleString()}
								</Text>
							</View>
						</View>

						<Text className="text-[#848484] mt-2">Description</Text>
						<Text className="text-[#474747] mt-1 leading-5">
							{product.attributes.description}
						</Text>
					</View>
				</View>
			</ScrollView>
			<View className="flex-row items-center justify-between mt-4 p-4">
				<View>
					<Text className="text-3xl font-poppins-semibold text-[#292D32]">
						₦{amountFormat(product.attributes.price)}
					</Text>
				</View>
				<View className="flex-row mb-4">
					<TouchableOpacity
						className={`${
							isInCart ? 'bg-[#e4f5e5] border-none' : 'border border-button'
						} rounded-full py-3 px-6 mr-3`}
						onPress={handleAddToCart}
						disabled={isAddingToCart || isInCart}
					>
						{isAddingToCart ? (
							<ActivityIndicator color={Colors.primary} />
						) : (
							<Text className={`${isInCart ? 'text-primary' : 'text-button'}`}>
								{isInCart ? 'Added to cart' : 'Add to cart'}
							</Text>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						className="bg-primary rounded-full py-3 px-8"
						onPress={handleOrder}
					>
						<Text className="text-white">Order</Text>
					</TouchableOpacity>
				</View>
			</View>
		</PageContainer>
	);
};

export default ProductDetails;
