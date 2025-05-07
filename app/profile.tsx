import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import React, {useEffect, useState} from 'react';
import PageContainer from '@/components/PageContainer';
import {router} from 'expo-router';
import {FontAwesome6, MaterialIcons} from '@expo/vector-icons';
import Button from '@/components/ui/button';
import {ScrollView} from 'react-native';
import {useGlobalStore} from '@/context/store';
import {Image} from 'react-native';
import {Colors} from '@/constants/Colors';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
	UpdateProfilePayload,
	updateUserProfile,
	uploadProfilePhoto,
} from '@/services/apis/user';
import Toast from 'react-native-toast-message';
import {launchImageLibraryAsync} from 'expo-image-picker';

const Profile = () => {
	const queryClient = useQueryClient();
	const {user} = useGlobalStore();
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		address: '',
		state: '',
		city: '',
		country: '',
		bio: '',
		profile_photo: '',
	});
	const [profilePhoto, setProfilePhoto] = useState('');
	const [error, setError] = useState({...formData, error: ''});
	const [focusedInput, setFocusedInput] = useState('');
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		setFormData({
			name: user?.name || '',
			phone: user?.phone || '',
			address: user?.address || '',
			state: user?.state || '',
			city: user?.city || '',
			country: user?.country || '',
			bio: user?.bio || '',
			profile_photo: user?.profile_photo || '',
		});
	}, [user]);

	const {mutate: updateProfileMutation, isPending} = useMutation({
		mutationFn: updateUserProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['profile']});

			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Profile updated successfully',
			});
			router.back();
		},
		onError: (err: any) => {
			Toast.show({
				type: 'error',
				text1: 'Success',
				text2: err?.response?.data?.message || 'Error updating profile',
			});
		},
	});

	const handlePickImage = async () => {
		const response = await launchImageLibraryAsync({
			allowsEditing: true,
			quality: 0.1,
			aspect: [1, 1],
		});
		if (response.assets && response.assets.length > 0) {
			const capturedAsset = response.assets[0].uri;
			setFormData(prev => ({
				...prev,
				profile_photo: capturedAsset,
			}));
			setProfilePhoto(capturedAsset);
		}
	};

	const handleUpdate = async () => {
		let body: UpdateProfilePayload;
		const {profile_photo, ...updated} = formData;
		body = updated;
		if (profilePhoto) {
			try {
				setIsUploading(true);
				const formDataToSend = new FormData();
				const uriParts = profilePhoto.split('/');
				const filename = uriParts[uriParts.length - 1];

				let fileType = 'image/jpeg';

				if (filename.toLowerCase().endsWith('.png')) {
					fileType = 'image/png';
				} else if (filename.toLowerCase().endsWith('.gif')) {
					fileType = 'image/gif';
				} else if (filename.toLowerCase().endsWith('.heic')) {
					fileType = 'image/heic';
				} else if (filename.toLowerCase().endsWith('.webp')) {
					fileType = 'image/webp';
				}
				formDataToSend.append('profile_photo', {
					uri: profilePhoto,
					name: filename,
					type: fileType,
				} as any);

				await uploadProfilePhoto(formDataToSend);
			} catch (error: any) {
				Toast.show({
					type: 'error',
					text1: 'Success',
					text2:
						error?.response?.data?.message ||
						error.message ||
						'Error updating profile',
				});
			} finally {
				setIsUploading(false);
			}
		}
		updateProfileMutation(body);
	};

	return (
		<PageContainer>
			<TouchableOpacity
				className="flex-row items-center gap-x-3 mb-3"
				onPress={router.back}
			>
				<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
				<Text className="text-[#353535] font-poppins-semibold text-lg">
					Profile
				</Text>
			</TouchableOpacity>
			<ScrollView className="my-10 flex-1" showsVerticalScrollIndicator={false}>
				<View className="items-center gap-y-8">
					<TouchableOpacity onPress={handlePickImage}>
						{formData?.profile_photo || user?.profile_photo ? (
							<Image
								source={{uri: formData.profile_photo || user?.profile_photo}}
								width={150}
								height={150}
								className="rounded-full"
							/>
						) : (
							<View className="w-40 h-40 rounded-full bg-[#e4f5e5] flex items-center justify-center">
								<MaterialIcons
									name="person"
									size={110}
									color={Colors.primary}
								/>
							</View>
						)}
					</TouchableOpacity>
					<View className="items-center">
						<Text className="font-poppins-semibold text-2xl">{user?.name}</Text>
						<Text className="mt-1">{user?.email}</Text>
					</View>
				</View>

				<View className="my-10">
					<View className="mb-2">
						<TextInput
							placeholder="Name"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'name' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.name}
							onChangeText={text => {
								setFormData({...formData, name: text});
								setError(err => ({...err, name: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('name')}
							onBlur={() => setFocusedInput('')}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.name}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="Phone number"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'phone' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.phone}
							onChangeText={text => {
								setFormData({...formData, phone: text});
								setError(err => ({...err, phone: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('phone')}
							onBlur={() => setFocusedInput('')}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.name}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="Phone number"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'country'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.country}
							onChangeText={text => {
								setFormData({...formData, country: text});
								setError(err => ({...err, country: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('country')}
							onBlur={() => setFocusedInput('')}
							editable={false}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.name}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="State"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'state' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.state}
							onChangeText={text => {
								setFormData({...formData, state: text});
								setError(err => ({...err, state: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('state')}
							onBlur={() => setFocusedInput('')}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.state}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="City"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'city' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.city}
							onChangeText={text => {
								setFormData({...formData, city: text});
								setError(err => ({...err, city: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('city')}
							onBlur={() => setFocusedInput('')}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.city}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="Address"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'address'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.address}
							onChangeText={text => {
								setFormData({...formData, address: text});
								setError(err => ({...err, address: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('address')}
							onBlur={() => setFocusedInput('')}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.address}
						</Text>
					</View>
					<View className="mb-2">
						<TextInput
							placeholder="Bio"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'bio' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.bio}
							onChangeText={text => {
								setFormData({...formData, bio: text});
								setError(err => ({...err, bio: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('bio')}
							onBlur={() => setFocusedInput('')}
							multiline
							numberOfLines={10}
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.bio}
						</Text>
					</View>
				</View>
			</ScrollView>
			<Button
				title="Update"
				onPress={handleUpdate}
				isLoading={isPending || isUploading}
			/>
		</PageContainer>
	);
};

export default Profile;
