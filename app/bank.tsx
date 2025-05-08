import React, {useState, useEffect, useCallback} from 'react';
import {
	View,
	ScrollView,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Alert,
	RefreshControl,
	Modal,
	FlatList,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import Text from '@/components/ui/Text';
import {
	getBankAccounts,
	getAllBanks,
	verifyAccountNumber,
	addBankAccount,
	deleteBankAccount,
	Bank,
	BankAccount,
	BankAccountFormData,
} from '@/services/apis/bank';
import PageContainer from '@/components/PageContainer';
import {FontAwesome6} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';

const BankScreen: React.FC = () => {
	const navigation = useNavigation();
	const queryClient = useQueryClient();
	const [refreshing, setRefreshing] = useState(false);
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [bankModalVisible, setBankModalVisible] = useState(false);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
	const [accountNumber, setAccountNumber] = useState('');
	const [accountName, setAccountName] = useState('');
	const [bankSearchQuery, setBankSearchQuery] = useState('');
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationError, setVerificationError] = useState('');
	const screenWidth = Dimensions.get('window').width;

	// Fetch bank accounts
	const {
		data: bankAccountsData,
		isLoading: isLoadingAccounts,
		isError: isErrorAccounts,
		refetch: refetchAccounts,
	} = useQuery({
		queryKey: ['bankAccounts'],
		queryFn: getBankAccounts,
	});

	// Fetch all banks
	const {
		data: allBanksData,
		isLoading: isLoadingBanks,
		isError: isErrorBanks,
	} = useQuery({
		queryKey: ['allBanks'],
		queryFn: getAllBanks,
	});

	// Add bank account mutation
	const addBankMutation = useMutation({
		mutationFn: (data: BankAccountFormData) => addBankAccount(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['bankAccounts']});
			resetForm();
			setAddModalVisible(false);
			Alert.alert('Success', 'Bank account added successfully');
		},
		onError: (error: any) => {
			console.log(error.response.data);
			Alert.alert(
				'Error',
				`Failed to add bank account: ${
					error.response?.data?.message || error.message
				}`
			);
		},
	});

	// Delete bank account mutation
	const deleteBankMutation = useMutation({
		mutationFn: (id: number) => deleteBankAccount(id),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['bankAccounts']});
			Alert.alert('Success', 'Bank account removed successfully');
		},
		onError: error => {
			Alert.alert('Error', `Failed to remove bank account: ${error.message}`);
		},
	});

	// Verify account number
	const verifyAccount = useCallback(async () => {
		if (!selectedBank || accountNumber.length !== 10) {
			return;
		}

		try {
			setIsVerifying(true);
			setVerificationError('');
			const response = await verifyAccountNumber({
				account_number: accountNumber,
				bank_code: selectedBank.code,
			});
			setAccountName(response.data.data.account_name);
			setIsVerifying(false);
		} catch (error) {
			setIsVerifying(false);
			setVerificationError(
				'Account verification failed. Please check your details and try again.'
			);
			setAccountName('');
		}
	}, [selectedBank, accountNumber]);

	// Verify account number when conditions are met
	useEffect(() => {
		if (selectedBank && accountNumber.length === 10) {
			verifyAccount();
		} else {
			setAccountName('');
			setVerificationError('');
		}
	}, [selectedBank, accountNumber, verifyAccount]);

	// Handle refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetchAccounts();
		setRefreshing(false);
	}, [refetchAccounts]);

	// Reset form
	const resetForm = () => {
		setSelectedBank(null);
		setAccountNumber('');
		setAccountName('');
		setVerificationError('');
	};

	// Handle adding a bank account
	const handleAddBankAccount = () => {
		if (!selectedBank || !accountNumber || !accountName) {
			Alert.alert('Error', 'Please fill all fields');
			return;
		}

		if (accountNumber.length !== 10) {
			Alert.alert('Error', 'Account number must be 10 digits');
			return;
		}

		addBankMutation.mutate({
			bank_name: selectedBank.name,
			account_name: accountName,
			account_number: accountNumber,
			bank_code: selectedBank.code,
		});
	};

	// Handle delete bank account
	const handleDeleteBankAccount = (bankAccount: BankAccount) => {
		Alert.alert(
			'Remove Bank Account',
			`Are you sure you want to remove ${bankAccount.attributes.bank_name} account?`,
			[
				{text: 'Cancel', style: 'cancel'},
				{
					text: 'Remove',
					style: 'destructive',
					onPress: () => deleteBankMutation.mutate(bankAccount.id),
				},
			]
		);
	};

	// Filter banks based on search query
	const filteredBanks =
		allBanksData?.data.banks.filter(bank =>
			bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
		) || [];

	// Render bank item
	const renderBankItem = ({item}: {item: Bank}) => (
		<TouchableOpacity
			className="p-4 border-b border-gray-200"
			onPress={() => {
				setSelectedBank(item);
				setBankModalVisible(false);
			}}
		>
			<Text className="">{item.name}</Text>
		</TouchableOpacity>
	);

	// Render bank account item
	const renderBankAccountItem = (bankAccount: BankAccount) => (
		<View
			key={bankAccount.id}
			className="bg-white rounded-lg mb-4 p-4 shadow-sm"
		>
			<View className="flex-row justify-between">
				<View>
					<Text className="text-lg font-poppins-semibold">
						{bankAccount.attributes.bank_name}
					</Text>
					<Text className="text-gray-500 mt-1">
						{bankAccount.attributes.account_name}
					</Text>
					<Text className="text-gray-500">
						{bankAccount.attributes.account_number}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => handleDeleteBankAccount(bankAccount)}
					className="justify-center"
				>
					<Feather name="trash-2" size={20} color="#ef4444" />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<PageContainer noPadding>
			{/* Header */}
			<View className="bg-white px-4 py-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<TouchableOpacity
							onPress={() => navigation.goBack()}
							className="mr-4"
						>
							<FontAwesome6 name="chevron-left" size={16} color="#292D32" />
						</TouchableOpacity>
						<Text className="text-xl font-poppins-semibold">Bank Accounts</Text>
					</View>
					<TouchableOpacity
						onPress={() => setAddModalVisible(true)}
						className="bg-green-600 w-8 h-8 rounded-full items-center justify-center"
					>
						<Feather name="plus" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Content */}
			<ScrollView
				className="flex-1 px-4 pt-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{isLoadingAccounts && !refreshing ? (
					<View className="items-center justify-center py-12">
						<ActivityIndicator size="large" color="#16a34a" />
						<Text className="mt-4 text-gray-600">Loading bank accounts...</Text>
					</View>
				) : isErrorAccounts ? (
					<View className="bg-red-50 p-4 rounded-lg my-4">
						<Text className="text-red-700">
							Failed to load bank accounts. Please try again.
						</Text>
						<TouchableOpacity
							onPress={onRefresh}
							className="mt-3 bg-red-100 py-2 px-4 rounded-lg self-start"
						>
							<Text className="text-red-700">Retry</Text>
						</TouchableOpacity>
					</View>
				) : bankAccountsData?.data.length === 0 ? (
					<View className="items-center justify-center py-12">
						<Feather name="credit-card" size={64} color="#d1d5db" />
						<Text className="mt-4 text-gray-500 text-center">
							You don't have any bank accounts yet
						</Text>
						<TouchableOpacity
							onPress={() => setAddModalVisible(true)}
							className="mt-6 bg-green-600 px-6 py-3 rounded-lg"
						>
							<Text className="text-white ">Add Bank Account</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View>
						<Text className="text-gray-500 mb-3">
							These are the bank accounts you can use for withdrawals
						</Text>
						{bankAccountsData?.data.map(renderBankAccountItem)}
					</View>
				)}
			</ScrollView>

			{/* Add Bank Account Modal */}
			<Modal
				visible={addModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setAddModalVisible(false)}
			>
				<SafeAreaView className="flex-1">
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
						className="flex-1 justify-end"
					>
						<View className="flex-1 bg-[rgba(0,0,0,0.5)] bg-opacity-50 justify-end">
							{bankModalVisible ? (
								<View
									className="bg-white rounded-t-2xl p-5"
									style={{maxHeight: screenWidth * 1}}
								>
									<View className="flex-row justify-between items-center mb-4">
										<Text className="text-xl font-poppins-semibold">
											Select Bank
										</Text>
										<TouchableOpacity
											onPress={() => setBankModalVisible(false)}
										>
											<Feather name="x" size={24} color="#000" />
										</TouchableOpacity>
									</View>

									<View className="mb-4">
										<View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
											<Feather name="search" size={20} color="#9ca3af" />
											<TextInput
												value={bankSearchQuery}
												onChangeText={setBankSearchQuery}
												placeholder="Search banks"
												className="flex-1 ml-2 font-poppins"
											/>
										</View>
									</View>

									{isLoadingBanks ? (
										<View className="items-center justify-center py-8">
											<ActivityIndicator size="large" color="#16a34a" />
											<Text className="mt-4 text-gray-600">
												Loading banks...
											</Text>
										</View>
									) : isErrorBanks ? (
										<View className="bg-red-50 p-4 rounded-lg">
											<Text className="text-red-700">
												Failed to load banks. Please try again.
											</Text>
										</View>
									) : (
										<FlatList
											data={filteredBanks}
											renderItem={renderBankItem}
											keyExtractor={item => item.id.toString()}
											ListEmptyComponent={
												<View className="items-center py-8">
													<Text className="text-gray-500">No banks found</Text>
												</View>
											}
										/>
									)}
								</View>
							) : (
								<View className="bg-white rounded-t-2xl p-5 pb-10">
									<View className="flex-row justify-between items-center mb-6">
										<Text className="text-xl font-poppins-semibold">
											Add Bank Account
										</Text>
										<TouchableOpacity
											onPress={() => {
												resetForm();
												setAddModalVisible(false);
											}}
										>
											<Feather name="x" size={24} color="#000" />
										</TouchableOpacity>
									</View>

									<View className="mb-5">
										<Text className="text-gray-600 mb-2">Bank Name</Text>
										<TouchableOpacity
											onPress={() => setBankModalVisible(true)}
											className="bg-gray-100 rounded-lg px-3 py-4 flex-row justify-between items-center"
										>
											<Text
												className={
													selectedBank ? 'text-black' : 'text-gray-400'
												}
											>
												{selectedBank ? selectedBank.name : 'Select Bank'}
											</Text>
											<Feather name="chevron-down" size={20} color="#9ca3af" />
										</TouchableOpacity>
									</View>

									<View className="mb-5">
										<Text className="text-gray-600 mb-2">Account Number</Text>
										<TextInput
											value={accountNumber}
											onChangeText={setAccountNumber}
											placeholder="Enter 10-digit account number"
											keyboardType="numeric"
											maxLength={10}
											className="bg-gray-100 rounded-lg px-3 py-4 font-poppins"
										/>
									</View>

									{isVerifying && (
										<View className="mb-5 flex-row items-center">
											<ActivityIndicator size="small" color="#16a34a" />
											<Text className="ml-2 text-gray-600">
												Verifying account...
											</Text>
										</View>
									)}

									{verificationError ? (
										<View className="mb-5 bg-red-50 p-3 rounded-lg">
											<Text className="text-red-700 text-sm">
												{verificationError}
											</Text>
										</View>
									) : accountName ? (
										<View className="mb-5">
											<Text className="text-gray-600 mb-2">Account Name</Text>
											<View className="bg-gray-100 rounded-lg px-3 py-4">
												<Text className="font-poppins">{accountName}</Text>
											</View>
										</View>
									) : null}

									<TouchableOpacity
										onPress={handleAddBankAccount}
										disabled={
											!selectedBank ||
											!accountNumber ||
											!accountName ||
											isVerifying ||
											addBankMutation.isPending
										}
										className={`py-3 rounded-lg items-center mt-4 ${
											!selectedBank ||
											!accountNumber ||
											!accountName ||
											isVerifying ||
											addBankMutation.isPending
												? 'bg-gray-300'
												: 'bg-green-600'
										}`}
									>
										{addBankMutation.isPending ? (
											<ActivityIndicator color="#fff" size="small" />
										) : (
											<Text
												className={`${
													!selectedBank ||
													!accountNumber ||
													!accountName ||
													isVerifying
														? 'text-gray-500'
														: 'text-white'
												}`}
											>
												Add Bank Account
											</Text>
										)}
									</TouchableOpacity>
								</View>
							)}
						</View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</Modal>

			{/* Bank Selection Modal */}
		</PageContainer>
	);
};

export default BankScreen;
