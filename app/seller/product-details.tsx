import {
	View,
	Image,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
} from 'react-native';
import React from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';

import PageContainer from '@/components/PageContainer';
import Text from '@/components/ui/Text';
import {
	getSellerProductById,
	deleteProduct,
} from '@/services/apis/sellerProducts';

const ProductDetails: React.FC = () => {
	const queryClient = useQueryClient();
	const {id} = useLocalSearchParams<{id: string}>();

	// Fetch product details
	const {data: productData, isLoading} = useQuery({
		queryKey: ['product', id],
		queryFn: () => getSellerProductById(id),
		enabled: !!id,
	});

	const product = productData?.data.product;

	// Delete product mutation
	const {mutate: deleteProductMutation, isPending: isDeleting} = useMutation({
		mutationFn: deleteProduct,
		onSuccess: () => {
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Product deleted successfully',
			});
			queryClient.invalidateQueries({queryKey: ['sellerProducts']});
			router.back();
		},
		onError: (error: any) => {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.response?.data?.message || 'Failed to delete product',
			});
		},
	});

	const handleDelete = () => {
		Alert.alert(
			'Delete Product',
			'Are you sure you want to delete this product?',
			[
				{text: 'Cancel', style: 'cancel'},
				{
					text: 'Delete',
					onPress: () => deleteProductMutation(id),
					style: 'destructive',
				},
			]
		);
	};

	const handleEdit = () => {
		router.push({
			pathname: '/seller/add-product',
			params: {id: id},
		});
	};

	// Thumbnail gallery images
	const thumbnailImages = [1, 2, 3]; // Replace with actual product images if available

	if (isLoading) {
		return (
			<PageContainer>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#7fb796" />
				</View>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<View className="flex-row items-center mb-4">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text className="text-xl font-poppins-semibold">Product Details</Text>
				<View className="flex-1" />
				<TouchableOpacity onPress={() => {}} className="ml-2">
					<Feather name="heart" size={24} color="#ccc" />
				</TouchableOpacity>
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Main Product Image */}
				<View className="h-72 rounded-xl overflow-hidden bg-[#f5f5f5] mb-4">
					{product?.attributes?.thumbnail ? (
						<Image
							source={{uri: product.attributes.thumbnail}}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<View className="w-full h-full items-center justify-center">
							<Feather name="image" size={48} color="#ccc" />
						</View>
					)}
				</View>

				{/* Thumbnail Gallery */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="flex-row mb-6"
				>
					{thumbnailImages.map((_, index) => (
						<View
							key={index}
							className="w-24 h-16 mr-2 rounded-md overflow-hidden border border-gray-200"
						>
							{product?.attributes?.thumbnail ? (
								<Image
									source={{uri: product.attributes.thumbnail}}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="w-full h-full bg-[#f5f5f5] items-center justify-center">
									<Feather name="image" size={16} color="#ccc" />
								</View>
							)}
						</View>
					))}
				</ScrollView>

				{/* Product Info */}
				<View className="mb-4">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-2xl font-poppins-semibold">
							{product?.attributes?.name || 'Product Name'}
						</Text>
						<View className="flex-row items-center">
							<Text className="text-lg mr-1">{'4.0'}</Text>
							<Feather name="star" size={18} color="#FFD700" />
						</View>
					</View>

					<View className="flex-row items-center mb-4">
						<Text className="text-gray-500 font-poppins-medium">
							@{product?.attributes?.slug || 'seller'}
						</Text>
					</View>

					{/* Quantity Section */}
					<View className="flex-row items-center mb-4">
						<Text className="font-poppins-medium mr-2">Quantity</Text>
						<View className="flex-row items-center">
							<View className="w-6 h-6 bg-[#eef5f1] rounded-full items-center justify-center">
								<Text className="text-xs">-</Text>
							</View>
							<Text className="mx-3 font-poppins-medium">
								{product?.attributes?.stock_quantity || '0'}
							</Text>
							<View className="w-6 h-6 bg-[#eef5f1] rounded-full items-center justify-center">
								<Text className="text-xs">+</Text>
							</View>
						</View>
					</View>

					{/* Description */}
					<View className="mb-6">
						<Text className="font-poppins-medium mb-2">Description</Text>
						<Text className="text-gray-600 leading-5">
							{product?.attributes?.description || 'No description available'}
						</Text>
					</View>

					{/* Price */}
					<View className="mb-6">
						<Text className="text-3xl font-poppins-semibold">
							₦{product?.attributes?.price?.toLocaleString() || '0'}
						</Text>
					</View>
				</View>
			</ScrollView>

			{/* Action Buttons */}
			<View className="flex-row gap-x-2 my-4">
				<TouchableOpacity
					onPress={handleDelete}
					className="flex-1 bg-red-500 py-4 rounded-xl items-center justify-center"
					disabled={isDeleting}
				>
					{isDeleting ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text className="text-white font-poppins-medium">Delete</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleEdit}
					className="flex-1 bg-primary py-4 rounded-xl items-center justify-center"
				>
					<Text className="text-white font-poppins-medium">Edit</Text>
				</TouchableOpacity>
			</View>
		</PageContainer>
	);
};

export default ProductDetails;
