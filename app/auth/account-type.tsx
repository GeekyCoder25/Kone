import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import PageContainer from '@/components/PageContainer';
import AuthHeader from './components/AuthHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Colors} from '@/constants/Colors';
import {router} from 'expo-router';
import Button from '@/components/ui/button';

const AccountType = () => {
	const [selectedType, setSelectedType] = useState('');

	const handleAccountTypeSelection = (type: string) => {
		setSelectedType(type);
	};

	const accountTypes = [
		{label: 'Buyer', value: 'buyer'},
		{label: 'Seller', value: 'seller'},
	];

	return (
		<PageContainer>
			<AuthHeader
				title="Choose account type"
				sub="Please select your account type"
			/>

			<View className="flex-1 justify-center">
				{accountTypes.map(type => (
					<TouchableOpacity
						key={type.value}
						onPress={() => handleAccountTypeSelection(type.value)}
						className="p-6 bg-[#f0f7f3] rounded-md mb-4 flex-row justify-between items-center"
					>
						<Text className="text-[#222227] font-poppins-semibold text-lg">
							Sign up as a {type.label}
						</Text>
						<Ionicons
							name={
								selectedType === type.value
									? 'radio-button-on'
									: 'radio-button-off'
							}
							size={24}
							color={Colors.primary}
						/>
					</TouchableOpacity>
				))}
			</View>

			<View className="flex-1 justify-end my-10">
				{selectedType && (
					<Button
						title="Get started"
						onPress={() => router.push(`/auth/signup?type=${selectedType}`)}
					/>
				)}
			</View>
		</PageContainer>
	);
};

export default AccountType;
