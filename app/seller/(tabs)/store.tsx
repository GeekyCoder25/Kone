import React, {useState} from 'react';
import {
	View,
	TextInput,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	FlatList,
	Dimensions,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {MaterialIcons} from '@expo/vector-icons';
import {amountFormat} from '@/utils';
import {useGlobalStore} from '@/context/store';
import {useQuery} from '@tanstack/react-query';
import {getSellerProducts, Product} from '@/services/apis/sellerProducts';
import PageContainer from '@/components/PageContainer';
import {router} from 'expo-router';

export default function SellerProductsScreen() {
	const {user} = useGlobalStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchFocused, setSearchFocused] = useState(false);

	const {data: productsData, isLoading} = useQuery({
		queryKey: ['sellerProducts'],
		queryFn: getSellerProducts,
	});

	const filteredProducts =
		productsData?.data.products.filter(product =>
			JSON.stringify(product).includes(searchQuery)
		) || [];

	const ProductCard = ({item}: {item: Product}) => {
		return (
			<TouchableOpacity
				onPress={() => router.push(`/seller/product-details?id=${item.id}`)}
				className="bg-white rounded-xl mb-4 flex-1 mx-2 border border-[#cde3d6]"
			>
				<Image
					source={{uri: item.attributes.thumbnail}}
					className="w-full h-32 rounded-xl mb-2"
					resizeMode="cover"
				/>
				<View className="px-3 py-4">
					<Text className="text-lg font-poppins-semibold text-[#222227]">
						{item.attributes.name}
					</Text>
					<Text className="text-sm text-[#848484] my-2" numberOfLines={2}>
						{item.attributes.description}
					</Text>
					<View className="flex-row items-center justify-between">
						<Text className="text-base text-[#474747] font-poppins-semibold">
							₦{amountFormat(item.attributes.price)}
						</Text>
						<TouchableOpacity
							className="bg-button rounded-full py-2 px-3 items-center"
							onPress={() =>
								router.push(`/seller/product-details?id=${item.id}`)
							}
						>
							<Text className="text-white text-sm">View Details</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	const screenWidth = Dimensions.get('window').width;
	const contentPadding = 16; // Padding from screen edges
	const itemSpacing = 2; // Gap between items
	const minItemWidth = 180; // Minimum width for each product card
	const maxItemWidth = 200; // Maximum width for each product card

	// Calculate number of columns that can fit
	const numColumns = Math.max(
		1,
		Math.floor(
			(screenWidth - 2 * contentPadding) / (minItemWidth + itemSpacing)
		)
	);

	// Calculate actual item width based on available space
	const itemWidth = Math.min(
		maxItemWidth,
		(screenWidth - 2 * contentPadding - itemSpacing * (numColumns - 1)) /
			numColumns
	);

	return (
		<PageContainer className="pb-0">
			<View>
				<View className="flex-row gap-x-3 items-center">
					<TouchableOpacity onPress={() => router.push('/profile')}>
						{user?.profile_photo ? (
							<Image
								source={{uri: user.profile_photo}}
								width={40}
								height={40}
								className="rounded-full"
							/>
						) : (
							<View className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
								<MaterialIcons name="person" size={24} color="#fff" />
							</View>
						)}
					</TouchableOpacity>
					<Text className="text-xl font-poppins-semibold">My Products</Text>
				</View>

				<View
					className={`mt-4 flex-row items-center bg-[#f3f6f4] rounded-xl px-4 py-1 border ${
						searchFocused ? 'border-primary' : 'border-[#67B179]'
					}`}
				>
					<MaterialIcons name="search" size={20} color="#848484" />
					<TextInput
						placeholder="Search for a product"
						className="flex-1 ml-2 font-poppins-medium text-md h-12"
						placeholderTextColor="#848484"
						value={searchQuery}
						onChangeText={setSearchQuery}
						onFocus={() => setSearchFocused(true)}
						onBlur={() =>
							setTimeout(() => {
								setSearchFocused(false);
							}, 100)
						}
						returnKeyType="search"
					/>
					{searchQuery && (
						<TouchableOpacity onPress={() => setSearchQuery('')}>
							<MaterialIcons name="close" size={24} color="#848484" />
						</TouchableOpacity>
					)}
				</View>

				<View className="flex-row justify-between items-center mt-6">
					<Text className="text-lg font-poppins-semibold">Your Products</Text>
					<TouchableOpacity
						className="bg-primary px-4 py-2 rounded-lg"
						onPress={() => router.push('/seller/add-product')}
					>
						<Text className="text-white">Add New</Text>
					</TouchableOpacity>
				</View>
			</View>

			<FlatList
				showsVerticalScrollIndicator={false}
				data={filteredProducts}
				renderItem={({item}) => <ProductCard key={item.id} item={item} />}
				ListEmptyComponent={
					isLoading ? (
						<View className="flex-1 justify-center items-center py-8">
							<ActivityIndicator size="large" color="#6AAB85" />
						</View>
					) : (
						<View className="flex-1 justify-center items-center py-8">
							<Text className="text-base text-[#848484]">
								No products found
							</Text>
							<TouchableOpacity
								className="mt-4 bg-primary px-6 py-3 rounded-lg"
								onPress={() => router.push('/seller/add-product')}
							>
								<Text className="text-white font-poppins-medium">
									Add Your First Product
								</Text>
							</TouchableOpacity>
						</View>
					)
				}
				numColumns={numColumns}
				contentContainerStyle={{paddingTop: 16, paddingBottom: 80}}
				{...(numColumns > 1 && {
					columnWrapperStyle: {gap: itemSpacing, marginBottom: itemSpacing},
				})}
			/>
		</PageContainer>
	);
}
