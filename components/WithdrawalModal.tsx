import React, {useState, useEffect} from 'react';
import {
	View,
	Modal,
	TouchableOpacity,
	TextInput,
	TouchableWithoutFeedback,
	Keyboard,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	ScrollView,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import Text from '@/components/ui/Text';
import {getBankAccounts} from '@/services/apis/bank';
import {amountFormat} from '@/utils';
import {router} from 'expo-router';

interface BankAccount {
	type: string;
	id: number;
	attributes: {
		bank_name: string;
		account_name: string;
		account_number: string;
		created_at: string;
	};
}

interface WithdrawalModalProps {
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (
		amount: number,
		bankDetails: {
			bankId: number;
			bankName: string;
			accountNumber: string;
			accountName: string;
		}
	) => void;
	currentBalance: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
	isVisible,
	onClose,
	onSubmit,
	currentBalance,
}) => {
	const [amount, setAmount] = useState('');
	const [bankName, setBankName] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [accountName, setAccountName] = useState('');
	const [step, setStep] = useState(1); // 1: Amount, 2: Bank Selection
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

	// Format balance for display (remove currency symbol and commas)
	const numericBalance = parseFloat(
		currentBalance.replace('₦', '').replace(/,/g, '').trim()
	);

	// Fetch bank accounts when modal is visible
	useEffect(() => {
		if (isVisible) {
			fetchBankAccounts();
		}
	}, [isVisible]);

	const fetchBankAccounts = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await getBankAccounts();
			setBankAccounts(response.data);

			// Pre-select first bank if available
			if (response.data && response.data.length > 0) {
				const firstBank = response.data[0];
				setSelectedBankId(firstBank.id);
				setBankName(firstBank.attributes.bank_name);
				setAccountNumber(firstBank.attributes.account_number);
				setAccountName(firstBank.attributes.account_name);
			}
		} catch (err) {
			setError('Failed to load bank accounts. Please try again.');
			console.error('Error fetching bank accounts:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleNext = () => {
		// Validate amount
		const numAmount = parseFloat(amount.replace(/,/g, ''));
		if (isNaN(numAmount) || numAmount <= 0) {
			// Show error - would use a proper error state in a real app
			alert('Please enter a valid amount');
			return;
		} else if (numAmount > numericBalance) {
			alert('Insufficient funds');
			return;
		}
		if (numAmount < 1000) {
			// Check if minimum withdrawal amount requirement is met
			alert('Minimum withdrawal amount is ₦1,000');
			return;
		}

		setStep(2);
	};

	const handleSubmit = () => {
		// Validate bank selection
		if (!selectedBankId || !bankName || !accountNumber || !accountName) {
			alert('Please select a bank account');
			return;
		}
		onSubmit(Number(amount.replaceAll(',', '')), {
			bankId: selectedBankId,
			bankName,
			accountNumber,
			accountName,
		});

		// Reset form
		resetForm();
	};

	const resetForm = () => {
		setAmount('');
		setBankName('');
		setAccountNumber('');
		setAccountName('');
		setSelectedBankId(null);
		setStep(1);
		onClose();
	};

	const formatAmount = (value: string) => {
		// Remove non-numeric characters
		const numeric = value.replace(/[^0-9]/g, '');

		// Format with commas
		return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	const handleAmountChange = (value: string) => {
		setAmount(formatAmount(value));
	};

	const handleBankSelection = (bank: BankAccount) => {
		setSelectedBankId(bank.id);
		setBankName(bank.attributes.bank_name);
		setAccountNumber(bank.attributes.account_number);
		setAccountName(bank.attributes.account_name);
	};

	const dismissKeyboard = () => {
		Keyboard.dismiss();
	};

	const renderBankItem = (bank: BankAccount) => {
		const isSelected = selectedBankId === bank.id;

		return (
			<TouchableOpacity
				key={bank.id}
				onPress={() => handleBankSelection(bank)}
				className={`border rounded-lg p-4 mb-3 ${
					isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200'
				}`}
			>
				<View className="flex-row justify-between">
					<View className="flex-1">
						<Text className="font-poppins-medium">
							{bank.attributes.bank_name}
						</Text>
						<Text className="text-gray-600 mt-1">
							{bank.attributes.account_name}
						</Text>
						<Text className="text-gray-600">
							{bank.attributes.account_number}
						</Text>
					</View>
					{isSelected && (
						<View className="justify-center">
							<Feather name="check-circle" size={22} color="#16a34a" />
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<Modal
			visible={isVisible}
			transparent
			animationType="slide"
			onRequestClose={resetForm}
		>
			<TouchableWithoutFeedback onPress={dismissKeyboard}>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.container}
				>
					<View className="bg-white rounded-t-2xl w-full p-5 pb-10">
						{/* Header */}
						<View className="flex-row justify-between items-center mb-5">
							<Text className="text-xl font-poppins-semibold">
								{step === 1 ? 'Withdraw Funds' : 'Select Bank Account'}
							</Text>
							<TouchableOpacity onPress={resetForm}>
								<Feather name="x" size={24} color="#000" />
							</TouchableOpacity>
						</View>

						{step === 1 ? (
							/* Step 1: Amount Entry */
							<View>
								<Text className="text-gray-600 mb-2">Available Balance</Text>
								<Text className="text-2xl font-poppins-semibold mb-6">
									{amountFormat(Number(currentBalance))}
								</Text>

								<Text className="text-gray-600 mb-2">
									Enter Amount to Withdraw
								</Text>
								<View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-4 mb-4">
									<Text className="text-xl font-poppins-medium mr-2">₦</Text>
									<TextInput
										value={amount}
										onChangeText={handleAmountChange}
										placeholder="0.00"
										keyboardType="numeric"
										className="flex-1 text-xl font-poppins-medium"
										autoFocus
									/>
								</View>

								<View className="flex-row justify-between mt-4">
									<TouchableOpacity
										onPress={() =>
											setAmount(
												formatAmount(String(Math.floor(numericBalance * 0.25)))
											)
										}
										className="bg-gray-100 rounded-lg px-3 py-2"
									>
										<Text className="text-gray-700">25%</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={() =>
											setAmount(
												formatAmount(String(Math.floor(numericBalance * 0.5)))
											)
										}
										className="bg-gray-100 rounded-lg px-3 py-2"
									>
										<Text className="text-gray-700">50%</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={() =>
											setAmount(
												formatAmount(String(Math.floor(numericBalance * 0.75)))
											)
										}
										className="bg-gray-100 rounded-lg px-3 py-2"
									>
										<Text className="text-gray-700">75%</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={() =>
											setAmount(
												formatAmount(String(Math.floor(numericBalance)))
											)
										}
										className="bg-gray-100 rounded-lg px-3 py-2"
									>
										<Text className="text-gray-700">Max</Text>
									</TouchableOpacity>
								</View>

								<View className="bg-yellow-50 rounded-lg p-3 mt-5 mb-5">
									<Text className="text-yellow-800 text-xs">
										Withdrawals are processed within 24 hours. Minimum
										withdrawal amount is ₦1,000.
									</Text>
								</View>

								<TouchableOpacity
									onPress={handleNext}
									className="bg-green-600 py-3 rounded-lg items-center mt-4"
								>
									<Text className="text-white font-poppins-medium">
										Continue
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							/* Step 2: Bank Selection */
							<View className="min-h-96">
								<Text className="text-gray-600 mb-2">Selected Amount</Text>
								<Text className="text-xl font-poppins-semibold mb-4">
									₦ {amount}
								</Text>

								{loading ? (
									<View className="items-center justify-center py-8">
										<ActivityIndicator size="large" color="#16a34a" />
										<Text className="mt-4 text-gray-600">
											Loading bank accounts...
										</Text>
									</View>
								) : error ? (
									<View className="bg-red-50 p-4 rounded-lg mb-4">
										<Text className="text-red-700">{error}</Text>
										<TouchableOpacity
											onPress={fetchBankAccounts}
											className="mt-3 bg-red-100 py-2 px-4 rounded-lg self-start"
										>
											<Text className="text-red-700">Retry</Text>
										</TouchableOpacity>
									</View>
								) : bankAccounts.length === 0 ? (
									<View className="bg-yellow-50 p-4 rounded-lg mb-4">
										<Text className="text-yellow-700 mb-3">
											No bank accounts found. Please add a bank account first.
										</Text>
										<TouchableOpacity
											onPress={() => {
												resetForm();
												router.push('/bank');
											}}
											className="bg-green-600 py-3 rounded-lg items-center"
										>
											<Text className="text-white font-poppins-medium">
												Add Bank Account
											</Text>
										</TouchableOpacity>
									</View>
								) : (
									<ScrollView className="max-h-64 mb-4">
										{bankAccounts.map(renderBankItem)}
									</ScrollView>
								)}

								<View className="flex-row mt-4">
									<TouchableOpacity
										onPress={() => setStep(1)}
										className="flex-1 border border-green-600 py-3 rounded-lg items-center mr-2"
									>
										<Text className="text-green-600 font-poppins-medium">
											Back
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										onPress={handleSubmit}
										disabled={
											loading || bankAccounts.length === 0 || !selectedBankId
										}
										className={`flex-1 py-3 rounded-lg items-center ml-2 ${
											loading || bankAccounts.length === 0 || !selectedBankId
												? 'bg-gray-300'
												: 'bg-green-600'
										}`}
									>
										<Text
											className={`font-poppins-medium ${
												loading || bankAccounts.length === 0 || !selectedBankId
													? 'text-gray-500'
													: 'text-white'
											}`}
										>
											Submit
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
});

export default WithdrawalModal;
