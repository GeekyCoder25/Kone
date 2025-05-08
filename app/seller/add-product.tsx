import {
	View,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Image,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';

import PageContainer from '@/components/PageContainer';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/button';
import {
	CategoriesResponse,
	CategoryItem,
	getCategories,
} from '@/services/apis/products';
import {
	createProduct,
	updateProduct,
	getSellerProductById,
} from '@/services/apis/sellerProducts';

interface FormErrors {
	name?: string;
	price?: string;
	category_id?: string;
	thumbnail?: string;
	[key: string]: string | undefined;
}

interface ProductFormData {
	name: string;
	description: string;
	price: string;
	stock_quantity: string;
	unit: string;
	category_id: string | number;
	thumbnail: ImagePicker.ImagePickerAsset | null;
	images: ImagePicker.ImagePickerAsset[];
	thumbnail_url?: string;
	images_urls?: string[];
}

const AddProduct: React.FC = () => {
	const queryClient = useQueryClient();
	const {id} = useLocalSearchParams<{id: string}>();
	const isEditMode = !!id;

	const [formData, setFormData] = useState<ProductFormData>({
		name: '',
		description: '',
		price: '',
		stock_quantity: '',
		unit: 'unit',
		category_id: '',
		thumbnail: null,
		images: [],
		thumbnail_url: '',
		images_urls: [],
	});

	const [focusedInput, setFocusedInput] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>({});
	const [showCategoryDropdown, setShowCategoryDropdown] =
		useState<boolean>(false);
	const [selectedCategory, setSelectedCategory] = useState<string>('');

	// Fetch categories
	const {data: categoriesResponse} = useQuery<CategoriesResponse>({
		queryKey: ['categories'],
		queryFn: getCategories,
	});

	// Fetch product details if in edit mode
	const {data: productData, isLoading: isLoadingProduct} = useQuery({
		queryKey: ['product', id],
		queryFn: () => getSellerProductById(id),
		enabled: isEditMode,
	});

	// Initialize form with product data if in edit mode
	useEffect(() => {
		if (isEditMode && productData?.data) {
			const product = productData.data;
			const attributes = product.product.attributes;

			setFormData({
				name: attributes.name || '',
				description: attributes.description || '',
				price: attributes.price?.toString() || '',
				stock_quantity: attributes.stock_quantity?.toString() || '',
				unit: attributes.unit || 'unit',
				category_id:
					categoriesResponse?.data.find(
						category => category.attributes.name === attributes.category[0]
					)?.id || '',
				thumbnail: null,
				images: [],
				thumbnail_url: attributes.thumbnail || '',
				images_urls: [],
			});

			if (attributes.category) {
				setSelectedCategory(
					categoriesResponse?.data.find(
						category => category.attributes.name === attributes.category[0]
					)?.attributes.name || ''
				);
			}
		}
	}, [isEditMode, productData]);

	const {mutate: addProductMutation, isPending: isAddingProduct} = useMutation({
		mutationFn: createProduct,
		onSuccess: () => {
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Product added successfully',
			});
			queryClient.invalidateQueries({queryKey: ['sellerProducts']});
			router.back();
		},
		onError: (error: any) => {
			console.log(error.response?.data || error);
			setErrors(error.response?.data?.errors || {});
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.response?.data?.message || 'Failed to add product',
			});
		},
	});

	const {mutate: updateProductMutation, isPending: isUpdatingProduct} =
		useMutation({
			mutationFn: (data: FormData) => updateProduct(id, data),
			onSuccess: () => {
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Product updated successfully',
				});
				queryClient.invalidateQueries({queryKey: ['sellerProducts']});
				queryClient.invalidateQueries({queryKey: ['product', id]});
				router.back();
			},
			onError: (error: any) => {
				console.log(error.response?.data || error);
				setErrors(error.response?.data?.errors || {});
				Toast.show({
					type: 'error',
					text1: 'Error',
					text2: error.response?.data?.message || 'Failed to update product',
				});
			},
		});

	const isPending = isAddingProduct || isUpdatingProduct;

	const pickImage = async (isMainImage = false) => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			if (isMainImage) {
				setFormData({
					...formData,
					thumbnail: result.assets[0],
					thumbnail_url: '',
				});
				setErrors({...errors, thumbnail: ''});
			} else {
				setFormData({
					...formData,
					images: [...formData.images, result.assets[0]],
				});
				setErrors({...errors, images: '', thumbnail: ''});
			}
		}
	};

	const removeImage = (index: number) => {
		const updatedImages = [...formData.images];
		updatedImages.splice(index, 1);
		setFormData({...formData, images: updatedImages});
	};

	const removeImageUrl = (index: number) => {
		if (formData.images_urls) {
			const updatedImageUrls = [...formData.images_urls];
			updatedImageUrls.splice(index, 1);
			setFormData({...formData, images_urls: updatedImageUrls});
		}
	};

	const handleSubmit = () => {
		// Validate form
		const newErrors: FormErrors = {};
		if (!formData.name) newErrors.name = 'Product name is required';
		if (!formData.price) newErrors.price = 'Price is required';
		if (!formData.category_id)
			newErrors.category_id = 'Please select a category';

		// Only require thumbnail in create mode or if no existing thumbnail in edit mode
		if (!isEditMode && !formData.thumbnail && !formData.thumbnail_url) {
			newErrors.thumbnail = 'Please upload a thumbnail image';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			Toast.show({
				type: 'error',
				text1: 'Validation Error',
				text2: 'Please fill all required fields',
			});
			return;
		}

		// Format data for API
		const productData = new FormData();
		productData.append('name', formData.name);
		productData.append('description', formData.description);
		productData.append('price', parseFloat(formData.price).toString());
		productData.append(
			'stock_quantity',
			parseInt(formData.stock_quantity || '0').toString()
		);
		if (formData.unit) productData.append('unit', formData.unit.toLowerCase());
		productData.append('category_id', formData.category_id.toString());

		// Append thumbnail if new one selected
		if (formData.thumbnail) {
			const thumbnailUri = formData.thumbnail.uri;
			const thumbnailName = thumbnailUri.split('/').pop() || 'thumbnail.jpg';
			const thumbnailType =
				'image/' + (thumbnailName.split('.').pop() || 'jpeg');
			productData.append('thumbnail', {
				uri: thumbnailUri,
				name: thumbnailName,
				type: thumbnailType,
			} as any);
		}

		// Append additional images
		if (formData.images.length) {
			formData.images.forEach(image => {
				const imageUri = image.uri;
				const imageName = imageUri.split('/').pop() || 'image.jpg';
				const imageType = 'image/' + (imageName.split('.').pop() || 'jpeg');

				productData.append('images[]', {
					uri: imageUri,
					name: imageName,
					type: imageType,
				} as any);
			});
		}

		// If updating, notify if existing images should be kept
		if (isEditMode) {
			productData.append('_method', 'PUT'); // For Laravel API that uses form-method spoofing

			// If we have existing image URLs we want to keep
			if (formData.images_urls && formData.images_urls.length > 0) {
				formData.images_urls.forEach((url, index) => {
					productData.append(`keep_images[${index}]`, url);
				});
			}

			console.log(productData);
			updateProductMutation(productData);
		} else {
			addProductMutation(productData);
		}
	};

	const selectCategory = (categoryId: number, categoryName: string) => {
		setFormData({...formData, category_id: categoryId});
		setSelectedCategory(categoryName);
		setShowCategoryDropdown(false);
		setErrors({...errors, category_id: ''});
	};

	if (isEditMode && isLoadingProduct) {
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
				<Text className="text-xl font-poppins-semibold">
					{isEditMode ? 'Edit product' : 'Add product'}
				</Text>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
				className="flex-1 justify-end"
			>
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{/* Thumbnail Section */}
					<View className="mb-6">
						<TouchableOpacity
							onPress={() => pickImage(true)}
							className="h-48 bg-[#eef5f1] border border-secondary rounded-xl overflow-hidden justify-center items-center mb-2"
						>
							{formData.thumbnail ? (
								<Image
									source={{uri: formData.thumbnail.uri}}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : formData.thumbnail_url ? (
								<Image
									source={{uri: formData.thumbnail_url}}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="items-center">
									<Feather name="plus-circle" size={24} color="#7fb796" />
									<Text className="text-center mt-2 text-[#7fb796] font-poppins-medium">
										Add product image
									</Text>
								</View>
							)}
						</TouchableOpacity>

						{/* Thumbnail gallery */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							className="flex-row"
						>
							{/* Existing image URLs */}
							{formData.images_urls?.map((imageUrl, index) => (
								<View
									key={`url-${index}`}
									className="w-16 h-16 mr-2 rounded-md overflow-hidden border border-secondary relative"
								>
									<Image
										source={{uri: imageUrl}}
										className="w-full h-full"
										resizeMode="cover"
									/>
									<TouchableOpacity
										onPress={() => removeImageUrl(index)}
										className="absolute top-0 right-0 bg-white rounded-full p-1"
									>
										<Feather name="x" size={12} color="red" />
									</TouchableOpacity>
								</View>
							))}

							{/* Newly added images */}
							{formData.images.map((image, index) => (
								<View
									key={`new-${index}`}
									className="w-16 h-16 mr-2 rounded-md overflow-hidden border border-secondary relative"
								>
									<Image
										source={{uri: image.uri}}
										className="w-full h-full"
										resizeMode="cover"
									/>
									<TouchableOpacity
										onPress={() => removeImage(index)}
										className="absolute top-0 right-0 bg-white rounded-full p-1"
									>
										<Feather name="x" size={12} color="red" />
									</TouchableOpacity>
								</View>
							))}
							<TouchableOpacity
								onPress={() => pickImage(false)}
								className="w-16 h-16 mr-2 rounded-md border border-dashed border-secondary justify-center items-center bg-[#f5f5f5]"
							>
								<Feather name="plus" size={20} color="#7fb796" />
							</TouchableOpacity>
						</ScrollView>
						{errors.thumbnail && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.thumbnail}
							</Text>
						)}
					</View>

					{/* Form Fields */}
					<View className="mb-4">
						<TextInput
							placeholder="Product name"
							placeholderTextColor={'#848484'}
							value={formData.name}
							onChangeText={text => {
								setFormData({...formData, name: text});
								setErrors({...errors, name: ''});
							}}
							onFocus={() => setFocusedInput('name')}
							onBlur={() => setFocusedInput('')}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'name' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
						/>
						{errors.name && (
							<Text className="text-red-500 text-sm mb-1">{errors.name}</Text>
						)}
					</View>

					<View className="mb-4 relative">
						<TouchableOpacity
							onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'category'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2 flex-row justify-between items-center`}
						>
							<Text
								className={selectedCategory ? 'text-black' : 'text-[#848484]'}
							>
								{selectedCategory || 'Categories'}
							</Text>
							<Feather
								name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
								size={20}
								color="#848484"
							/>
						</TouchableOpacity>
						{showCategoryDropdown && (
							<View className="absolute top-16 left-0 right-0 bg-white border border-secondary rounded-xl z-10 max-h-60">
								<ScrollView className="p-2">
									{categoriesResponse?.data?.map((category: CategoryItem) => (
										<TouchableOpacity
											key={category.id}
											onPress={() =>
												selectCategory(category.id, category.attributes.name)
											}
											className="p-3 border-b border-gray-100"
										>
											<Text>{category.attributes.name}</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						)}
						{errors.category_id && (
							<Text className="text-red-500 text-sm mb-1">
								{errors.category_id}
							</Text>
						)}
					</View>

					<View className="mb-4">
						<TextInput
							placeholder="Price"
							placeholderTextColor={'#848484'}
							value={formData.price}
							onChangeText={text => {
								// Only allow numbers and decimal point
								if (/^\d*\.?\d*$/.test(text)) {
									setFormData({...formData, price: text});
									setErrors({...errors, price: ''});
								}
							}}
							onFocus={() => setFocusedInput('price')}
							onBlur={() => setFocusedInput('')}
							keyboardType="numeric"
							className={`bg-[#eef5f1] border ${
								focusedInput === 'price' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
						/>
						{errors.price && (
							<Text className="text-red-500 text-sm mb-1">{errors.price}</Text>
						)}
					</View>

					<View className="mb-4">
						<TextInput
							placeholder="Available quantity"
							placeholderTextColor={'#848484'}
							value={formData.stock_quantity}
							onChangeText={text => {
								// Only allow numbers
								if (/^\d*$/.test(text)) {
									setFormData({...formData, stock_quantity: text});
								}
							}}
							onFocus={() => setFocusedInput('stock_quantity')}
							onBlur={() => setFocusedInput('')}
							keyboardType="numeric"
							className={`bg-[#eef5f1] border ${
								focusedInput === 'stock_quantity'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
						/>
					</View>
					<View className="mb-4">
						<TextInput
							placeholder="Unit"
							placeholderTextColor={'#848484'}
							value={formData.unit}
							onChangeText={text => {
								setFormData({...formData, unit: text});
							}}
							onFocus={() => setFocusedInput('unit')}
							onBlur={() => setFocusedInput('')}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'unit' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
						/>
					</View>

					<View className="mb-6">
						<TextInput
							placeholder="Description"
							placeholderTextColor={'#848484'}
							value={formData.description}
							onChangeText={text =>
								setFormData({...formData, description: text})
							}
							onFocus={() => setFocusedInput('description')}
							onBlur={() => setFocusedInput('')}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							className={`bg-[#eef5f1] border ${
								focusedInput === 'description'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2 min-h-[120px]`}
						/>
					</View>
				</ScrollView>
				<View className="my-6">
					<Button
						title={isEditMode ? 'Update Product' : 'Add Product'}
						onPress={handleSubmit}
						isLoading={isPending}
					/>
				</View>
			</KeyboardAvoidingView>
		</PageContainer>
	);
};

export default AddProduct;
