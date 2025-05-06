import React from 'react';
import {
	View,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	FlatList,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getWishlist,
	removeFromWishlist,
	addToCart,
} from '@/services/apis/products';
import PageContainer from '@/components/PageContainer';
import {MaterialCommunityIcons, FontAwesome6} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';
import {router} from 'expo-router';
import {amountFormat} from '@/utils';
import Toast from 'react-native-toast-message';
import {Dimensions} from 'react-native';

export default function WishListScreen() {
	const queryClient = useQueryClient();

	const {data: wishlistData, isLoading} = useQuery({
		queryKey: ['wishlist'],
		queryFn: getWishlist,
	});

	const {mutate: removeFromWishlistMutation} = useMutation({
		mutationFn: removeFromWishlist,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['wishlist']});
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Item removed from wishlist',
			});
		},
	});

	const {mutate: addToCartMutation} = useMutation({
		mutationFn: addToCart,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['cart']});
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Item added to cart',
			});
		},
	});

	const handleRemoveFromWishlist = (productId: number) => {
		removeFromWishlistMutation(productId);
	};

	const handleAddToCart = (productId: number) => {
		addToCartMutation({
			product_id: productId,
			quantity: 1,
		});
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

	const wishlistItems = wishlistData?.message || [];

	const screenWidth = Dimensions.get('window').width;
	const contentPadding = 16; // Padding from screen edges
	const itemSpacing = 4; // Gap between items
	const minItemWidth = 180; // Minimum width for each product card

	// Calculate number of columns that can fit
	const numColumns = Math.max(
		1,
		Math.floor(
			(screenWidth - 2 * contentPadding) / (minItemWidth + itemSpacing)
		)
	);

	return (
		<PageContainer className="pb-0 px-5">
			<TouchableOpacity
				className="flex-row items-center gap-x-3 mb-3"
				onPress={router.back}
			>
				<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
				<Text className="text-[#353535] font-poppins-semibold text-lg">
					My Wishlist
				</Text>
			</TouchableOpacity>

			{wishlistItems.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<MaterialCommunityIcons
						name="heart-outline"
						size={64}
						color={Colors.primary}
					/>
					<Text className="text-lg mt-4 text-gray-600">
						Your wishlist is empty
					</Text>
				</View>
			) : (
				<FlatList
					data={wishlistItems}
					renderItem={({item}) => (
						<TouchableOpacity
							onPress={() =>
								router.push(
									`/buyer/product-details?id=${item.product.id}&wishlist_id=${item.id}`
								)
							}
							className="bg-white rounded-xl mb-4 flex-1 border border-[#cde3d6]"
						>
							<Image
								source={{
									uri: item.product.attributes.thumbnail,
								}}
								className="w-full h-32 rounded-t-xl"
								resizeMode="cover"
							/>
							<View className="p-4">
								<Text className="text-lg font-poppins-semibold text-[#222227]">
									{item.product.attributes.name}
								</Text>
								<Text className="text-sm text-[#848484] my-2" numberOfLines={2}>
									{item.product.attributes.description}
								</Text>
								<View className="flex-row items-center justify-between">
									<Text className="text-base text-[#474747] font-poppins-semibold">
										₦{amountFormat(item.product.attributes.price)}
									</Text>
									<View className="flex-row gap-x-2">
										<TouchableOpacity
											className="bg-red-50 rounded-full p-2"
											onPress={() => handleRemoveFromWishlist(item.id)}
										>
											<MaterialCommunityIcons
												name="heart"
												size={20}
												color="#ef4444"
											/>
										</TouchableOpacity>
										<TouchableOpacity
											className="bg-button rounded-full p-2"
											onPress={() => handleAddToCart(item.product.id)}
										>
											<MaterialCommunityIcons
												name="cart"
												size={20}
												color="#fff"
											/>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					)}
					keyExtractor={item => item.id.toString()}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{paddingBottom: 20}}
					numColumns={numColumns}
					{...(numColumns > 1 && {
						columnWrapperStyle: {gap: itemSpacing, marginBottom: itemSpacing},
					})}
				/>
			)}
		</PageContainer>
	);
}
