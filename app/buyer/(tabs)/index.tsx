import React, {useState, useEffect} from 'react';
import {
	View,
	TextInput,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	FlatList,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import {
	FontAwesome5,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import {amountFormat} from '@/utils';
import {useGlobalStore} from '@/context/store';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getProducts,
	Product,
	addToCart,
	getCart,
} from '@/services/apis/products';
import {MemoryStorage} from '@/utils/storage';
import PageContainer from '@/components/PageContainer';
import {Dimensions} from 'react-native';
import {router} from 'expo-router';
import Toast from 'react-native-toast-message';

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;

export default function DashboardScreen() {
	const {user} = useGlobalStore();
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [searchFocused, setSearchFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const storage = new MemoryStorage();

	const handleSearchSubmit = (query: string) => {
		addToRecentSearches(query);
		setSearchFocused(false);
	};

	const {data: productsData, isLoading} = useQuery({
		queryKey: ['products'],
		queryFn: getProducts,
	});

	useEffect(() => {
		loadRecentSearches();
	}, []);

	const loadRecentSearches = async () => {
		const searches = await storage.getItem(RECENT_SEARCHES_KEY);
		if (searches) {
			setRecentSearches(JSON.parse(searches));
		}
	};

	const addToRecentSearches = async (query: string) => {
		if (!query.trim()) return;

		const updatedSearches = [
			query,
			...recentSearches.filter(item => item !== query),
		].slice(0, MAX_RECENT_SEARCHES);

		setRecentSearches(updatedSearches);
		await storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
	};

	const removeFromRecentSearches = async (searchToRemove: string) => {
		const updatedSearches = recentSearches.filter(
			item => item !== searchToRemove
		);
		setRecentSearches(updatedSearches);
		await storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		addToRecentSearches(query);
		setSearchFocused(false);
	};

	const filteredProducts =
		productsData?.data.products.filter(
			product =>
				(selectedCategory === 'All'
					? true
					: product.attributes.category.includes(selectedCategory)) &&
				JSON.stringify(product).includes(searchQuery)
		) || [];

	const categories = [
		{
			id: 0,
			name: 'All',
			icon: (
				<MaterialIcons
					name="category"
					size={20}
					color={selectedCategory === 'All' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 1,
			name: 'Fruits',
			icon: (
				<MaterialCommunityIcons
					name="fruit-cherries"
					size={20}
					color={selectedCategory === 'Fruits' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 2,
			name: 'Vegetables',
			icon: (
				<MaterialCommunityIcons
					name="food-apple"
					size={20}
					color={selectedCategory === 'Vegetables' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 3,
			name: 'Dairy Products',
			icon: (
				<FontAwesome5
					name="cheese"
					size={20}
					color={selectedCategory === 'Dairy Products' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 4,
			name: 'Livestock',
			icon: (
				<MaterialCommunityIcons
					name="cow"
					size={20}
					color={selectedCategory === 'Livestock' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 5,
			name: 'Grains & Cereals',
			icon: (
				<MaterialCommunityIcons
					name="grain"
					size={20}
					color={selectedCategory === 'Grains & Cereals' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 6,
			name: 'Tubers & Roots',
			icon: (
				<MaterialCommunityIcons
					name="carrot"
					size={20}
					color={selectedCategory === 'Tubers & Roots' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 7,
			name: 'Poultry',
			icon: (
				<MaterialCommunityIcons
					name="turkey"
					size={20}
					color={selectedCategory === 'Poultry' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 8,
			name: 'Herbs & Spices',
			icon: (
				<FontAwesome5
					name="mortar-pestle"
					size={20}
					color={selectedCategory === 'Herbs & Spices' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 9,
			name: 'Honey & Bee Products',
			icon: (
				<MaterialCommunityIcons
					name="bee"
					size={20}
					color={
						selectedCategory === 'Honey & Bee Products' ? '#fff' : '#022711'
					}
				/>
			),
		},
		{
			id: 10,
			name: 'Nuts & Seeds',
			icon: (
				<FontAwesome5
					name="seedling"
					size={20}
					color={selectedCategory === 'Nuts & Seeds' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 11,
			name: 'Aquaculture',
			icon: (
				<FontAwesome5
					name="fish"
					size={20}
					color={selectedCategory === 'Aquaculture' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 12,
			name: 'Organic Procedure',
			icon: (
				<MaterialCommunityIcons
					name="leaf"
					size={20}
					color={selectedCategory === 'Organic Procedure' ? '#fff' : '#022711'}
				/>
			),
		},
		{
			id: 13,
			name: 'Animal Feed',
			icon: (
				<MaterialCommunityIcons
					name="food-variant"
					size={20}
					color={selectedCategory === 'Animal Feed' ? '#fff' : '#022711'}
				/>
			),
		},
	];

	const ProductCard = ({item}: {item: Product}) => {
		const queryClient = useQueryClient();
		const {setCart} = useGlobalStore();
		const {data: cartData} = useQuery({
			queryKey: ['cart'],
			queryFn: getCart,
		});

		const cart = cartData?.data;

		const isInCart = cart?.some(
			cartItem => cartItem.attributes.products.id === item.id
		);

		const {mutate: addToCartMutation, isPending: isAddingToCart} = useMutation({
			mutationFn: addToCart,
			onSuccess: data => {
				if (cart) setCart([...cart, data.data]);
				queryClient.invalidateQueries({queryKey: ['cart']});
			},
			onError(error: any) {
				Toast.show({
					type: 'error',
					text1: 'Error',
					text2: error?.response?.data.message || error.message,
				});
			},
		});

		const handleAddToCart = (e: any) => {
			e.stopPropagation();
			if (!isInCart) {
				addToCartMutation({
					product_id: item.id,
					quantity: 1,
				});
			}
		};

		return (
			<TouchableOpacity
				onPress={() => router.push(`/buyer/product-details?id=${item.id}`)}
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
							className={`${
								isInCart ? 'bg-[#e4f5e5]' : 'bg-button'
							} rounded-full py-2 px-3 items-center`}
							onPress={handleAddToCart}
							disabled={isAddingToCart || isInCart}
						>
							{isAddingToCart ? (
								<ActivityIndicator color={'#fff'} />
							) : (
								<Text
									className={`${
										isInCart ? 'text-primary' : 'text-white'
									} text-sm`}
								>
									{isInCart ? 'Added to cart' : 'Add to cart'}
								</Text>
							)}
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

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) {
			return 'Good morning';
		} else if (hour < 18) {
			return 'Good afternoon';
		} else {
			return 'Good evening';
		}
	};

	return (
		<PageContainer className="pb-0">
			<View>
				<View className="flex-row justify-between items-center mt-2 mb-6">
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
									<MaterialIcons name="person" size={20} color="#fff" />
								</View>
							)}
						</TouchableOpacity>
						<Text className="text-xl font-poppins-semibold">
							{getGreeting()}, {user?.name}!
						</Text>
					</View>
					<TouchableOpacity onPress={() => router.push('/notifications')}>
						<MaterialIcons name="notifications-none" size={24} color="#333" />
					</TouchableOpacity>
				</View>

				<View
					className={`mt-1 flex-row items-center bg-[#f3f6f4] rounded-xl px-4 py-1 border ${
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
						onSubmitEditing={() => handleSearchSubmit(searchQuery)}
					/>
					{searchQuery && (
						<TouchableOpacity onPress={() => setSearchQuery('')}>
							<MaterialIcons name="close" size={20} color="#848484" />
						</TouchableOpacity>
					)}
				</View>

				{/* <Text className="mt-3 text-[#292D32]">Categories</Text> */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mt-4"
				>
					{categories.map(category => (
						<TouchableOpacity
							key={category.id}
							onPress={() => setSelectedCategory(category.name)}
							className={`mr-4 px-4 py-2 rounded-lg flex-row items-center ${
								selectedCategory === category.name
									? 'bg-primary'
									: 'bg-[#e4f5e5]'
							}`}
						>
							{category.icon}
							<Text
								className={`ml-2 text-sm font-poppins-semibold ${
									selectedCategory === category.name
										? 'text-white'
										: 'text-[#022711]'
								}`}
							>
								{category.name}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				<View className="mt-6 relative">
					{searchQuery && searchFocused && (
						<View className="absolute top-0 left-0 right-0 bg-white p-4 z-10 shadow-sm">
							<Text className="text-base font-poppins-medium text-[#222227] mb-2">
								Recent searches
							</Text>
							{recentSearches.map((search, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center py-2"
								>
									<TouchableOpacity
										className="flex-1 flex-row items-center"
										onPress={() => handleSearch(search)}
									>
										<MaterialIcons name="history" size={20} color="#848484" />
										<Text className="ml-2 text-[#848484]">{search}</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => removeFromRecentSearches(search)}
									>
										<MaterialIcons name="close" size={20} color="#848484" />
									</TouchableOpacity>
								</View>
							))}
						</View>
					)}
				</View>
				<Text className="text-lg font-poppins-semibold mb-4">
					{selectedCategory} just for you
				</Text>
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
						</View>
					)
				}
				numColumns={numColumns}
				contentContainerStyle={{}}
				{...(numColumns > 1 && {
					columnWrapperStyle: {gap: itemSpacing, marginBottom: itemSpacing},
				})}
			/>
		</PageContainer>
	);
}
