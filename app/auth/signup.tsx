import {
	View,
	TextInput,
	ScrollView,
	Alert,
	TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import AuthHeader from './components/AuthHeader';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/ui/button';
import {useMutation} from '@tanstack/react-query';
import {register} from '@/services/apis/auth';
import {router, useLocalSearchParams} from 'expo-router';
import Text from '@/components/ui/Text';
import Feather from '@expo/vector-icons/Feather';

const Signup = () => {
	const {type} = useLocalSearchParams();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		is_buyer: type === 'buyer' ? 1 : 0,
		is_seller: type === 'seller' ? 1 : 0,
	});

	const [error, setError] = useState({...formData, error: ''});
	const [focusedInput, setFocusedInput] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {mutate: signupMutation, isPending} = useMutation({
		mutationFn: register,
		onSuccess: () => {
			router.push(`/auth/verify-email?email=${formData.email}`);
		},
		onError: (error: any) => {
			console.log(error.response.data || error);
			setError(error.response.data?.errors || {});
		},
	});

	const handleSignup = () => {
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
				password: 'The password field must be at least 6 characters',
			}));
			return;
		}

		signupMutation(formData);
	};

	return (
		<PageContainer>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<AuthHeader
					title="Hello, Welcome"
					sub="Please fill in the form to create an account"
				/>

				<View className="flex-1 justify-center">
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
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.email}
						</Text>
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
						<Text className="text-red-500 text-sm font-poppins-regular">
							{error.password}
						</Text>
					</View>
					<View className="relative">
						<TextInput
							placeholder="Confirm Password"
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
						{error.error}
					</Text>
				</View>
			</ScrollView>
			<View className="my-10">
				<Button title={'Signup'} onPress={handleSignup} isLoading={isPending} />
				<View className="flex-row justify-center items-center gap-x-1 mt-6 text-center">
					<Text className="text-[#353535] text-sm">
						Already have an account?
					</Text>
					<TouchableOpacity onPress={() => router.push('/auth/login')}>
						<Text className="font-poppins-semibold text-button text-base">
							Sign in
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</PageContainer>
	);
};

export default Signup;
