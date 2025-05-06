import {View, TextInput, ScrollView} from 'react-native';
import React, {useState} from 'react';
import AuthHeader from './components/AuthHeader';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/ui/button';
import {useMutation} from '@tanstack/react-query';
import {forgotPassword} from '@/services/apis/auth';
import {router} from 'expo-router';
import Text from '@/components/ui/Text';
import Toast from 'react-native-toast-message';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [error, setError] = useState({email: '', error: ''});
	const [focusedInput, setFocusedInput] = useState('');

	const {mutate: forgotPasswordMutation, isPending} = useMutation({
		mutationFn: forgotPassword,
		onSuccess: () => {
			router.push({
				pathname: '/auth/verify-email',
				params: {email, type: 'forgot'},
			});
		},
		onError: (error: any) => {
			console.log(error.response?.data || error);
			setError(error.response?.data?.errors || {});
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.response?.data?.message || 'Failed to send reset email',
			});
		},
	});

	const handleSubmit = () => {
		if (!email) {
			setError(err => ({...err, error: 'Please enter your email'}));
			return;
		}
		forgotPasswordMutation({email});
	};

	return (
		<PageContainer>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<AuthHeader
					title="Forgot Password"
					sub="Enter your email to reset your password"
				/>

				<View className="flex-1 justify-center">
					<View className="mb-2">
						<TextInput
							placeholder="Email"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'email' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={email}
							onChangeText={text => {
								setEmail(text);
								setError(err => ({...err, email: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('email')}
							onBlur={() => setFocusedInput('')}
							inputMode="email"
						/>
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.email}
						</Text>
					</View>
					<Text className="text-red-500 text-sm font-poppins-regular text-center">
						{error.error}
					</Text>
				</View>
			</ScrollView>
			<View className="my-10">
				<Button title="Get Code" onPress={handleSubmit} isLoading={isPending} />
			</View>
		</PageContainer>
	);
};

export default ForgotPassword;
