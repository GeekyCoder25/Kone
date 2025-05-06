import {View, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState} from 'react';
import AuthHeader from './components/AuthHeader';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/ui/button';
import {useMutation} from '@tanstack/react-query';
import {resetPassword} from '@/services/apis/auth';
import {router, useLocalSearchParams} from 'expo-router';
import Text from '@/components/ui/Text';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';

const ResetPassword = () => {
	const {email, code: token} = useLocalSearchParams();
	const [formData, setFormData] = useState({
		email: email as string,
		token: token as string,
		password: '',
		password_confirmation: '',
	});
	const [error, setError] = useState({password: '', error: ''});
	const [focusedInput, setFocusedInput] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {mutate: resetPasswordMutation, isPending} = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: 'Password reset successful. Please login.',
			});
			router.replace('/auth/login');
		},
		onError: (error: any) => {
			console.log(error.response?.data || error);
			setError(error.response?.data?.errors || {});
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.response?.data?.message || 'Failed to reset password',
			});
		},
	});

	const handleSubmit = () => {
		if (Object.values(formData).some(field => field === '')) {
			setError(err => ({...err, error: 'Please fill in all fields'}));
			return;
		}
		if (formData.password !== formData.password_confirmation) {
			setError(err => ({...err, password: 'Passwords do not match'}));
			return;
		}
		if (formData.password.length < 6) {
			setError(err => ({
				...err,
				password: 'Password must be at least 6 characters',
			}));
			return;
		}
		resetPasswordMutation(formData);
	};

	return (
		<PageContainer>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<AuthHeader title="Reset Password" sub="Enter your new password" />

				<View className="flex-1 justify-center">
					<View className="relative mb-2">
						<TextInput
							placeholder="New Password"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'password'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.password}
							onChangeText={text => {
								setFormData({...formData, password: text});
								setError(err => ({...err, password: '', error: ''}));
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
					<View className="relative mb-2">
						<TextInput
							placeholder="Confirm New Password"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'confirmPassword'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-4`}
							value={formData.password_confirmation}
							onChangeText={text => {
								setFormData({...formData, password_confirmation: text});
								setError(err => ({...err, password: '', error: ''}));
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
					<Text className="text-red-500 text-sm font-poppins-regular">
						{error.password}
					</Text>
					<Text className="text-red-500 text-sm font-poppins-regular text-center">
						{error.error}
					</Text>
				</View>
			</ScrollView>
			<View className="my-10">
				<Button
					title="Reset Password"
					onPress={handleSubmit}
					isLoading={isPending}
				/>
			</View>
		</PageContainer>
	);
};

export default ResetPassword;
