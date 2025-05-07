import React, {useState, useRef} from 'react';
import {
	View,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
} from 'react-native';
import {Text} from '@/components/ui/Text';
import PageContainer from '@/components/PageContainer';
import {router} from 'expo-router';
import {
	FontAwesome6,
	MaterialIcons,
	Ionicons,
	Feather,
} from '@expo/vector-icons';
import {Colors} from '@/constants/Colors';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getUserAddresses,
	deleteUserAddress,
	addUserAddress,
	updateUserAddress,
	setDefaultAddress,
	AddressFormData,
	Address,
} from '@/services/apis/address';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {Modal} from 'react-native';

// Validation schema for address form
const AddressSchema = Yup.object().shape({
	recipient_name: Yup.string().required('Recipient name is required'),
	phone: Yup.string().required('Phone number is required'),
	address: Yup.string().required('Address is required'),
	city: Yup.string().required('City is required'),
	state: Yup.string().required('State is required'),
	postal_code: Yup.string().required('Postal code is required'),
	country: Yup.string().required('Country is required'),
});

// List of countries for the picker
const countries = [
	'Nigeria',
	'United States',
	'Canada',
	'United Kingdom',
	'Australia',
	'Germany',
	'France',
	'Japan',
	'India',
	'Brazil',
	'Mexico',
	// Add more countries as needed
];

export default function AddressScreen() {
	const queryClient = useQueryClient();
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [showModal, setShowModal] = useState(false);
	// Fetch addresses
	const {
		data: addressesData,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['addresses'],
		queryFn: getUserAddresses,
	});

	// Delete address mutation
	const deleteMutation = useMutation({
		mutationFn: deleteUserAddress,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['addresses']});
			Alert.alert('Success', 'Address deleted successfully');
		},
		onError: (error: any) => {
			console.error('Failed to delete address:', error.response?.status);
			Alert.alert('Error', 'Failed to delete address. Please try again.');
		},
	});

	// Add address mutation
	const addMutation = useMutation({
		mutationFn: addUserAddress,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['addresses']});
			handleCloseBottomSheet();
			Alert.alert('Success', 'Address added successfully');
		},
		onError: (error: any) => {
			console.error('Failed to add address:', error.response?.data);
			Alert.alert('Error', 'Failed to add address. Please try again.');
		},
	});

	// Update address mutation
	const updateMutation = useMutation({
		mutationFn: ({id, data}: {id: string; data: AddressFormData}) =>
			updateUserAddress(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['addresses']});
			handleCloseBottomSheet();
			Alert.alert('Success', 'Address updated successfully');
		},
		onError: error => {
			console.error('Failed to update address:', error);
			Alert.alert('Error', 'Failed to update address. Please try again.');
		},
	});

	// Set default address mutation
	const setDefaultMutation = useMutation({
		mutationFn: setDefaultAddress,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['addresses']});
			Alert.alert('Success', 'Default address updated');
		},
		onError: error => {
			console.error('Failed to set default address:', error);
			Alert.alert(
				'Error',
				'Failed to update default address. Please try again.'
			);
		},
	});

	// Handle opening the bottom sheet for adding/editing an address
	const handleOpenBottomSheet = (address?: Address) => {
		if (address) {
			setEditingAddress(address);
		} else {
			setEditingAddress(null);
		}
		setShowModal(true);
	};

	// Handle closing the bottom sheet
	const handleCloseBottomSheet = () => {
		setShowModal(false);
		setTimeout(() => {
			setEditingAddress(null);
		}, 300);
	};

	// Handle deleting an address with confirmation
	const handleDeleteAddress = (id: string) => {
		Alert.alert(
			'Delete Address',
			'Are you sure you want to delete this address?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete',
					onPress: () => deleteMutation.mutate(id),
					style: 'destructive',
				},
			]
		);
	};

	// Handle setting an address as default
	const handleSetDefaultAddress = (id: string) => {
		setDefaultMutation.mutate(id);
	};

	return (
		<PageContainer className="bg-[#fafafa]">
			{/* Header */}
			<View className="flex-row items-center justify-between mb-4">
				<TouchableOpacity
					className="flex-row items-center gap-x-3"
					onPress={router.back}
				>
					<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
					<Text className="text-[#353535] font-poppins-semibold text-lg">
						Manage Addresses
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => handleOpenBottomSheet()}
					className="flex-row items-center bg-[#e4f5e5] rounded-full px-4 py-2"
				>
					<Ionicons name="add" size={20} color={Colors.primary} />
					<Text className="text-[#353535] font-poppins-medium ml-1">
						Add New
					</Text>
				</TouchableOpacity>
			</View>

			{/* Content */}
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : isError ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-red-500 mb-4">Failed to load addresses</Text>
					<TouchableOpacity
						onPress={() => refetch()}
						className="bg-[#e4f5e5] rounded-full px-6 py-3"
					>
						<Text className="text-[#353535] font-poppins-medium">Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<>
					{addressesData && addressesData.data.length > 0 ? (
						<ScrollView className="flex-1 mt-2">
							{addressesData.data.map(address => (
								<View
									key={address.id}
									className="bg-white rounded-lg mb-4 p-4 shadow-sm"
								>
									<View className="flex-row justify-between items-start">
										<View>
											<Text className="font-poppins-semibold text-lg">
												{address.attributes.recipient_name}
											</Text>
											<Text className="">{address.attributes.phone}</Text>
										</View>
										<View className="flex-row">
											<TouchableOpacity
												onPress={() => handleOpenBottomSheet(address)}
												className="mr-4"
											>
												<Feather name="edit" size={18} color="#666" />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() =>
													handleDeleteAddress(address.id.toString())
												}
											>
												<Feather name="trash-2" size={18} color="#FF4040" />
											</TouchableOpacity>
										</View>
									</View>
									<View className="flex-row mt-3">
										<MaterialIcons
											name="location-on"
											size={20}
											color="#6AAB85"
										/>

										<View className="ml-3">
											<Text className="text-[#666] mb-1">
												{address.attributes.address}
											</Text>
											<Text className="text-[#666] mb-1">
												{address.attributes.city}, {address.attributes.state}{' '}
												{address.attributes.postal_code}
											</Text>
											<Text className="text-[#666] mb-3">
												{address.attributes.country}
											</Text>

											{/* {address.attributes.is_default ? (
											<View className="bg-[#e4f5e5] self-start rounded-full px-3 py-1 mt-1">
                                            <Text className="text-[#353535] font-poppins-medium text-xs">
                                            Default Address
												</Text>
											</View>
										) : (
											<TouchableOpacity
                                            onPress={() => handleSetDefaultAddress(address.id)}
                                            className="border border-[#ddd] self-start rounded-full px-3 py-1 mt-1"
											>
												<Text className="text-[#666] font-poppins-medium text-xs">
                                                Set as Default
												</Text>
											</TouchableOpacity>
										)} */}
										</View>
									</View>
								</View>
							))}
						</ScrollView>
					) : (
						<View className="flex-1 items-center justify-center">
							<MaterialIcons name="location-off" size={60} color="#ccc" />
							<Text className="text-[#666] mt-4 font-poppins-medium text-lg">
								No addresses found
							</Text>
							<Text className="text-[#999] mt-2 text-center">
								Add a new address to get started
							</Text>
							<TouchableOpacity
								onPress={() => handleOpenBottomSheet()}
								className="bg-[#e4f5e5] rounded-full px-6 py-3 mt-6"
							>
								<Text className="text-[#353535] font-poppins-medium">
									Add Address
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</>
			)}

			{/* Bottom Sheet for Adding/Editing Address */}
			<Modal
				animationType="slide"
				visible={showModal}
				transparent={true}
				onRequestClose={() => setShowModal(false)}
			>
				<Pressable
					onPress={() => setShowModal(false)}
					className="bg-[rgba(0,0,0,0.5)] flex-1 absolute top-0 right-0 left-0 bottom-0"
				/>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
					className="flex-1 justify-end"
				>
					<View className="flex-1 max-h-[70vh] bg-white px-4 pt-5 rounded-t-3xl">
						<Text className="font-poppins-semibold text-xl mb-6 text-center">
							{editingAddress ? 'Edit Address' : 'Add New Address'}
						</Text>

						<Formik
							initialValues={{
								recipient_name: editingAddress?.attributes.recipient_name || '',
								address: editingAddress?.attributes.address || '',
								phone: editingAddress?.attributes.phone || '',
								city: editingAddress?.attributes.city || '',
								state: editingAddress?.attributes.state || '',
								postal_code: editingAddress?.attributes.postal_code || '',
								country: editingAddress?.attributes.country || 'Nigeria',
								is_default: false,
							}}
							validationSchema={AddressSchema}
							onSubmit={values => {
								if (editingAddress) {
									updateMutation.mutate({
										id: editingAddress.id.toString(),
										data: values,
									});
								} else {
									addMutation.mutate(values);
								}
							}}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								values,
								errors,
								touched,
								setFieldValue,
							}) => (
								<ScrollView
									className="flex-1"
									showsVerticalScrollIndicator={false}
								>
									<View className="mb-4">
										<Text className="font-poppins-medium text-[#353535] mb-2">
											Name*
										</Text>
										<TextInput
											value={values.recipient_name}
											onChangeText={handleChange('recipient_name')}
											onBlur={handleBlur('recipient_name')}
											placeholder="Recipient name"
											className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
										/>
									</View>
									<View className="mb-4">
										<Text className="font-poppins-medium text-[#353535] mb-2">
											Phone number*
										</Text>
										<TextInput
											value={values.phone}
											onChangeText={handleChange('phone')}
											onBlur={handleBlur('phone')}
											placeholder=""
											className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
										/>
									</View>
									<View className="mb-4">
										<Text className="font-poppins-medium text-[#353535] mb-2">
											Address Line *
										</Text>
										<TextInput
											value={values.address}
											onChangeText={handleChange('address')}
											onBlur={handleBlur('address')}
											placeholder="Street address"
											className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
										/>
										{touched.address && errors.address && (
											<Text className="text-red-500 text-xs">
												{errors.address}
											</Text>
										)}
									</View>

									<View className="mb-4">
										<Text className="font-poppins-medium text-[#353535] mb-2">
											City*
										</Text>
										<TextInput
											value={values.city}
											onChangeText={handleChange('city')}
											onBlur={handleBlur('city')}
											placeholder="City"
											className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
										/>
										{touched.city && errors.city && (
											<Text className="text-red-500 text-xs">
												{errors.city}
											</Text>
										)}
									</View>

									<View className="flex-row mb-4">
										<View className="flex-1 mr-2">
											<Text className="font-poppins-medium text-[#353535] mb-2">
												State*
											</Text>
											<TextInput
												value={values.state}
												onChangeText={handleChange('state')}
												onBlur={handleBlur('state')}
												placeholder="State"
												className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
											/>
											{touched.state && errors.state && (
												<Text className="text-red-500 text-xs">
													{errors.state}
												</Text>
											)}
										</View>

										<View className="flex-1 ml-2">
											<Text className="font-poppins-medium text-[#353535] mb-2">
												Postal Code*
											</Text>
											<TextInput
												value={values.postal_code}
												onChangeText={handleChange('postal_code')}
												onBlur={handleBlur('postal_code')}
												placeholder="Postal Code"
												className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
												keyboardType="number-pad"
											/>
											{touched.postal_code && errors.postal_code && (
												<Text className="text-red-500 text-xs">
													{errors.postal_code}
												</Text>
											)}
										</View>
									</View>

									<View className="mb-4">
										<Text className="font-poppins-medium text-[#353535] mb-2">
											Country*
										</Text>
										<TextInput
											value={'Nigeria'}
											placeholder="Country"
											className="border border-[#ddd] rounded-lg px-4 py-3 mb-1"
											editable={false}
										/>
										{touched.country && errors.country && (
											<Text className="text-red-500 text-xs">
												{errors.country}
											</Text>
										)}
									</View>

									<View className="flex-row items-center mb-6">
										<TouchableOpacity
											onPress={() =>
												setFieldValue('is_default', !values.is_default)
											}
											className="flex-row items-center"
										>
											<View
												className={`w-5 h-5 rounded-sm border mr-2 ${
													values.is_default
														? 'bg-[#4CAF50] border-[#4CAF50]'
														: 'border-[#ccc]'
												}`}
											>
												{values.is_default && (
													<Ionicons name="checkmark" size={16} color="white" />
												)}
											</View>
											<Text className="font-poppins-medium text-[#353535]">
												Set as default address
											</Text>
										</TouchableOpacity>
									</View>

									<View className="flex-row mb-6">
										<TouchableOpacity
											onPress={handleCloseBottomSheet}
											className="flex-1 bg-[#f5f5f5] rounded-lg py-3 mr-2"
										>
											<Text className="text-center font-poppins-medium text-[#666]">
												Cancel
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => handleSubmit()}
											className="flex-1 bg-[#4CAF50] rounded-lg py-3 ml-2"
											disabled={
												addMutation.isPending || updateMutation.isPending
											}
										>
											{addMutation.isPending || updateMutation.isPending ? (
												<ActivityIndicator size="small" color="white" />
											) : (
												<Text className="text-center font-poppins-medium text-white">
													{editingAddress ? 'Update' : 'Save'}
												</Text>
											)}
										</TouchableOpacity>
									</View>
								</ScrollView>
							)}
						</Formik>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</PageContainer>
	);
}
