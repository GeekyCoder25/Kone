import {TextInput, View} from 'react-native';
import React, {useState} from 'react';
import Text from '@/components/ui/Text';
import PageContainer from '@/components/PageContainer';
import {TouchableOpacity} from 'react-native';
import {Feather, FontAwesome6} from '@expo/vector-icons';
import {router} from 'expo-router';
import Button from '@/components/ui/button';
import {useMutation} from '@tanstack/react-query';
import {changePassword} from '@/services/apis/auth';
import Toast from 'react-native-toast-message';

const ChangePassword = () => {
	const [formData, setFormData] = useState({
		current_password: '',
		new_password: '',
		new_password_confirmation: '',
	});

	const [focusedInput, setFocusedInput] = useState('');
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {mutate: changePasswordMutation, isPending} = useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Password updated successfully',
			});
			router.back();
		},
		onError: (err: any) => {
			Toast.show({
				type: 'error',
				text1: 'Success',
				text2: err?.response?.data?.message || 'Error updating password',
			});
		},
	});

	const handleUpdate = () => {
		changePasswordMutation(formData);
	};

	return (
		<PageContainer>
			<TouchableOpacity
				className="flex-row items-center gap-x-3 mb-3"
				onPress={router.back}
			>
				<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
				<Text className="text-[#353535] font-poppins-semibold text-lg">
					Change Password
				</Text>
			</TouchableOpacity>

			<View className="my-10 flex-1">
				<View className="relative mb-4">
					<TextInput
						placeholder="Old Password"
						placeholderTextColor={'#848484'}
						className={`bg-[#eef5f1] border ${
							focusedInput === 'old_password'
								? 'border-primary'
								: 'border-secondary'
						} p-5 rounded-xl font-poppins-medium mb-2`}
						value={formData.current_password}
						onChangeText={text => {
							setFormData({...formData, current_password: text});
						}}
						onFocus={() => setFocusedInput('old_password')}
						onBlur={() => setFocusedInput('')}
						secureTextEntry={!showOldPassword}
					/>
					<TouchableOpacity
						className="absolute right-4 top-4 z-10 p-1"
						onPress={() => setShowOldPassword(!showOldPassword)}
					>
						<Feather
							name={showOldPassword ? 'eye-off' : 'eye'}
							size={20}
							color="#7fb796"
						/>
					</TouchableOpacity>
				</View>
				<View className="relative mb-4">
					<TextInput
						placeholder="New password"
						placeholderTextColor={'#848484'}
						className={`bg-[#eef5f1] border ${
							focusedInput === 'password'
								? 'border-primary'
								: 'border-secondary'
						} p-5 rounded-xl font-poppins-medium mb-2`}
						value={formData.new_password}
						onChangeText={text => {
							setFormData({...formData, new_password: text});
						}}
						onFocus={() => setFocusedInput('password')}
						onBlur={() => setFocusedInput('')}
						secureTextEntry={!showPassword}
					/>
					<TouchableOpacity
						className="absolute right-4 top-4 z-10 p-1"
						onPress={() => setShowPassword(!showPassword)}
					>
						<Feather
							name={showPassword ? 'eye-off' : 'eye'}
							size={20}
							color="#7fb796"
						/>
					</TouchableOpacity>
				</View>
				<View className="relative">
					<TextInput
						placeholder="Confirm new password"
						placeholderTextColor={'#848484'}
						className={`bg-[#eef5f1] border ${
							focusedInput === 'confirmPassword'
								? 'border-primary'
								: 'border-secondary'
						} p-5 rounded-xl font-poppins-medium mb-4`}
						value={formData.new_password_confirmation}
						onChangeText={text => {
							setFormData({...formData, new_password_confirmation: text});
						}}
						onFocus={() => setFocusedInput('confirmPassword')}
						onBlur={() => setFocusedInput('')}
						secureTextEntry={!showConfirmPassword}
					/>
					<TouchableOpacity
						className="absolute right-4 top-4 z-10 p-1"
						onPress={() => setShowConfirmPassword(!showConfirmPassword)}
					>
						<Feather
							name={showConfirmPassword ? 'eye-off' : 'eye'}
							size={20}
							color="#7fb796"
						/>
					</TouchableOpacity>
				</View>
			</View>
			<Button
				title="Save"
				onPress={handleUpdate}
				disabled={
					!formData.current_password ||
					!formData.new_password ||
					!formData.new_password_confirmation ||
					formData.new_password !== formData.new_password_confirmation ||
					formData.new_password.length < 6
				}
				isLoading={isPending}
			/>
		</PageContainer>
	);
};

export default ChangePassword;
