import {
	View,
	Text,
	Modal,
	Pressable,
	TouchableOpacity,
	FlatList,
} from 'react-native';
import React, {Dispatch, FC, SetStateAction} from 'react';
import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {Address, AddressResponse} from '@/services/apis/address';

const SelectAddressModal: FC<{
	showModal: boolean;
	setShowModal: Dispatch<SetStateAction<boolean>>;
	selectedAddress: Address | null;
	setSelectedAddress: Dispatch<SetStateAction<Address | null>>;
	addressesData: AddressResponse | undefined;
}> = props => {
	const {
		showModal,
		setShowModal,
		addressesData,
		selectedAddress,
		setSelectedAddress,
	} = props;

	return (
		<Modal
			visible={showModal}
			animationType="slide"
			transparent={true}
			onRequestClose={() => setShowModal(false)}
		>
			<Pressable
				onPress={() => setShowModal(false)}
				className="bg-[rgba(0,0,0,0.5)] flex-1 absolute top-0 right-0 left-0 bottom-0"
			/>
			<View className="flex-1 bg-black/50 justify-end">
				<View className="bg-white rounded-t-3xl p-5 max-h-3/4">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-lg font-poppins-semibold">
							Select Delivery Address
						</Text>
						<TouchableOpacity onPress={() => setShowModal(false)}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>
					</View>

					{addressesData?.data && addressesData.data.length > 0 ? (
						<FlatList
							data={addressesData.data}
							keyExtractor={item => item.id.toString()}
							renderItem={({item}) => (
								<TouchableOpacity
									className={`p-4 border border-gray-200 rounded-lg mb-3 ${
										selectedAddress?.id === item.id
											? 'bg-green-50 border-green-500'
											: ''
									}`}
									onPress={() => {
										setSelectedAddress(item);
										setShowModal(false);
									}}
								>
									<View className="flex-row items-start">
										<View className="h-5 w-5 rounded-full border-2 mr-2 items-center justify-center border-green-600">
											{selectedAddress?.id === item.id && (
												<View className="h-2.5 w-2.5 rounded-full bg-green-600" />
											)}
										</View>
										<View className="flex-1">
											<Text className="font-poppins-medium">
												{item.attributes.recipient_name}
											</Text>
											<Text className="text-gray-600 text-sm">
												{item.attributes.address}
											</Text>
											<Text className="text-gray-600 text-sm">
												{item.attributes.city}, {item.attributes.state}
											</Text>
											<Text className="text-gray-600 text-sm">
												{item.attributes.phone}
											</Text>
											{/* {item.attributes.is_default && (
													<View className="bg-green-100 self-start px-2 py-0.5 rounded-full mt-1">
														<Text className="text-xs text-green-700">
															Default
														</Text>
													</View>
												)} */}
										</View>
									</View>
								</TouchableOpacity>
							)}
						/>
					) : (
						<View className="items-center py-10">
							<MaterialIcons name="location-off" size={48} color="#6AAB85" />
							<Text className="text-gray-500 mt-3">No addresses found</Text>
						</View>
					)}

					<TouchableOpacity
						onPress={() => {
							setShowModal(false);
							router.push('/address');
						}}
						className="mt-3 py-3 flex-row justify-center items-center bg-green-50 rounded-lg"
					>
						<Feather name="plus" size={16} color="#6AAB85" />
						<Text className="ml-2 text-green-700 font-poppins-medium">
							Add New Address
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

export default SelectAddressModal;
