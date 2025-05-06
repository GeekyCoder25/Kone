import {View, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState} from 'react';
import AuthHeader from './components/AuthHeader';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/ui/button';
import {useMutation} from '@tanstack/react-query';
import {login} from '@/services/apis/auth';
import {router} from 'expo-router';
import Text from '@/components/ui/Text';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY, LAST_LOGIN} from '@/constants';
import {useGlobalStore} from '@/context/store';

const Login = () => {
	const {setUser} = useGlobalStore();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState({email: '', password: '', error: ''});
	const [focusedInput, setFocusedInput] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const {mutate: loginMutation, isPending} = useMutation({
		mutationFn: login,
		onSuccess: async response => {
			if (response.data.user.is_seller) {
				router.replace('/seller/(tabs)');
			} else {
				router.replace('/buyer/(tabs)');
			}
			const storage = new MemoryStorage();
			await storage.setItem(ACCESS_TOKEN_KEY, response.data.token);
			await storage.setItem(LAST_LOGIN, new Date().toISOString());
			setUser(response.data.user);
		},
		onError: (error: any) => {
			console.log(error.response?.data || error);
			setError(error.response?.data?.errors || {});
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: error.response?.data?.message || 'Login failed',
			});
		},
	});

	const handleLogin = () => {
		if (Object.values(formData).some(field => field === '')) {
			setError(err => ({...err, error: 'Please fill in all fields'}));
			return;
		}
		loginMutation(formData);
	};

	return (
		<PageContainer>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<AuthHeader title="Welcome Back" sub="Please sign in to continue" />

				<View className="flex-1 justify-center">
					<View className="mb-2">
						<TextInput
							placeholder="Email"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'email' ? 'border-primary' : 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.email}
							onChangeText={text => {
								setFormData({...formData, email: text});
								setError(err => ({...err, email: '', error: ''}));
							}}
							onFocus={() => setFocusedInput('email')}
							onBlur={() => setFocusedInput('')}
							inputMode="email"
						/>
					</View>
					<View className="relative mb-2">
						<TextInput
							placeholder="Password"
							placeholderTextColor={'#848484'}
							className={`bg-[#eef5f1] border ${
								focusedInput === 'password'
									? 'border-primary'
									: 'border-secondary'
							} p-5 rounded-xl font-poppins-medium mb-2`}
							value={formData.password}
							onChangeText={text => {
								setFormData({...formData, password: text});
								setError(err => ({...err, email: '', password: '', error: ''}));
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
					<Text className="text-red-500 text-sm font-poppins-regular">
						{error.email}
					</Text>
					<TouchableOpacity
						onPress={() => router.push('/auth/forgot-password')}
						className="mb-6"
					>
						<Text className="text-button text-right font-poppins-medium">
							Forgot Password?
						</Text>
					</TouchableOpacity>
					<Text className="text-red-500 text-sm font-poppins-regular text-center">
						{error.error}
					</Text>
				</View>
			</ScrollView>
			<View className="my-10">
				<Button title="Sign in" onPress={handleLogin} isLoading={isPending} />
				<View className="flex-row justify-center items-center gap-x-1 mt-6 text-center">
					<Text className="text-[#353535] text-sm">Don't have an account?</Text>
					<TouchableOpacity onPress={() => router.push('/auth/signup')}>
						<Text className="font-poppins-semibold text-button text-base">
							Sign up
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</PageContainer>
	);
};

export default Login;
