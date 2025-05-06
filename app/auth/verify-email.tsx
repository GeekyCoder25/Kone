import {
	ActivityIndicator,
	AppState,
	AppStateStatus,
	Keyboard,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import AuthHeader from './components/AuthHeader';
import PageContainer from '@/components/PageContainer';
import Text from '@/components/ui/Text';
import {router, useLocalSearchParams} from 'expo-router';
import Button from '@/components/ui/button';
import * as Clipboard from 'expo-clipboard';
import {MemoryStorage} from '@/utils/storage';
import {LAST_OTP} from '@/constants';
import {useMutation} from '@tanstack/react-query';
import {
	verifyEmail,
	resendEmailVerification,
	VerifyEmailResponse,
	verifyCode,
	forgotPassword,
} from '@/services/apis/auth';
import Toast from 'react-native-toast-message';
import {Colors} from '@/constants/Colors';

const VerifyEmail = () => {
	const {email, type}: {email: string; type: 'forgot' | 'register'} =
		useLocalSearchParams();
	const [timeLeft, setTimeLeft] = useState(60);
	const [focusedBox, setFocusedBox] = useState(0);
	const [isError1, setIsError1] = useState(false);
	const [isError2, setIsError2] = useState(false);
	const [isError3, setIsError3] = useState(false);
	const [isError4, setIsError4] = useState(false);
	const [isError5, setIsError5] = useState(false);
	const [isError6, setIsError6] = useState(false);
	const [otpCode1, setOtpCode1] = useState('');
	const [otpCode2, setOtpCode2] = useState('');
	const [otpCode3, setOtpCode3] = useState('');
	const [otpCode4, setOtpCode4] = useState('');
	const [otpCode5, setOtpCode5] = useState('');
	const [otpCode6, setOtpCode6] = useState('');
	const inputRef = useRef<TextInput>(null);
	const inputRef2 = useRef<TextInput>(null);
	const inputRef3 = useRef<TextInput>(null);
	const inputRef4 = useRef<TextInput>(null);
	const inputRef5 = useRef<TextInput>(null);
	const inputRef6 = useRef<TextInput>(null);
	const [hasAutoPasted, setHasAutoPasted] = useState(false);
	const [retry, setRetry] = useState(1);
	const appState = useRef<AppStateStatus>(AppState.currentState);
	const endTime = useRef<number | null>(null);

	const {mutate: verifyEmailMutation, isPending} = useMutation({
		mutationFn: type === 'forgot' ? verifyCode : verifyEmail,
		onSuccess: () => {
			if (type === 'forgot') {
				router.replace({
					pathname: '/auth/reset-password',
					params: {
						email,
						token:
							otpCode1 + otpCode2 + otpCode3 + otpCode4 + otpCode5 + otpCode6,
					},
				});
			} else {
				router.replace('/auth/register-success');
			}
		},
		onError: (error: any) => {
			setIsError1(true);
			setIsError2(true);
			setIsError3(true);
			setIsError4(true);
			setIsError5(true);
			setIsError6(true);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
			setTimeout(() => {
				clearOTP();
				inputRef.current?.focus();
			}, 1500);
		},
	});

	const {mutate: resendMutation, isPending: isResending} = useMutation({
		mutationFn: type === 'forgot' ? forgotPassword : resendEmailVerification,
		onSuccess: () => {
			setTimeLeft(60);
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: `OTP sent to ${email} successfully`,
			});
		},
		onError: (error: any) => {
			console.log('err', error.response?.data);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
		},
	});

	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);

		startTimer();

		return () => {
			clearInterval(timerRef.current!);
			subscription.remove();
		};
	}, []);

	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const startTimer = () => {
		const endTimestamp = Date.now() + timeLeft * 1000; // Calculate target end time
		endTime.current = endTimestamp;

		timerRef.current = setInterval(() => {
			const currentTime = Date.now();
			const remainingTime = Math.round((endTime.current! - currentTime) / 1000);
		}, 1000);
	};

	const handleAppStateChange = (nextAppState: AppStateStatus) => {
		if (
			appState.current.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			const currentTime = Date.now();
			const remainingTime = Math.round((endTime.current! - currentTime) / 1000);
			setTimeLeft(remainingTime > 0 ? remainingTime : 0);
		}

		appState.current = nextAppState;
	};

	useEffect(() => {
		setInterval(() => {
			setTimeLeft(prev => (prev ? prev - 1 : prev));
		}, 1000);
	}, []);

	useEffect(() => {
		const storage = new MemoryStorage();
		const getLastSaved = async () => {
			const savedOTP = await storage.getItem(LAST_OTP);
			return savedOTP;
		};

		const getClipboard = async () => {
			const clipboard = await Clipboard.getStringAsync();
			const savedOTP = await getLastSaved();
			const hasPasted = clipboard === savedOTP;
			if (!hasPasted && clipboard.length === 6 && !isNaN(Number(clipboard))) {
				setOtpCode1(clipboard[0]);
				setOtpCode2(clipboard[1]);
				setOtpCode3(clipboard[2]);
				setOtpCode4(clipboard[3]);
				setOtpCode5(clipboard[4]);
				setOtpCode6(clipboard[5]);
				setHasAutoPasted(hasPasted);
				Keyboard.dismiss();

				await storage.setItem(LAST_OTP, clipboard);

				setTimeout(() => {
					setFocusedBox(0);
					inputRef.current?.blur();
				});
				await handleSubmit(true);
			}
		};

		getLastSaved().then(savedOTP => {
			Clipboard.getStringAsync().then(clipboard => {
				const hasPasted = clipboard === savedOTP;

				setHasAutoPasted(hasPasted);

				if (!hasPasted) {
					getClipboard();
				}
			});
		});

		const interval = setInterval(() => {
			if (!hasAutoPasted) {
				getClipboard();
			}
			setRetry(prev => prev + 1);
		}, 5000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [retry, hasAutoPasted]);

	const handleSubmit = async (isClipboard = false) => {
		try {
			const clipboard = await Clipboard.getStringAsync();
			let otp;
			if (isClipboard) {
				otp =
					clipboard[0] +
					clipboard[1] +
					clipboard[2] +
					clipboard[3] +
					clipboard[4] +
					clipboard[5];
			} else {
				if (!otpCode1) setIsError1(true);
				if (!otpCode2) setIsError2(true);
				if (!otpCode3) setIsError3(true);
				if (!otpCode4) setIsError4(true);
				if (!otpCode5) setIsError5(true);
				if (!otpCode6) setIsError6(true);

				if (
					!otpCode1 ||
					!otpCode2 ||
					!otpCode3 ||
					!otpCode4 ||
					!otpCode5 ||
					!otpCode6
				) {
					return;
				}
				otp = otpCode1 + otpCode2 + otpCode3 + otpCode4 + otpCode5 + otpCode6;
			}

			verifyEmailMutation({email, code: otp});
		} catch (error: any) {
			console.log(
				error.response?.data?.message || error.response?.data || error.message
			);
		}
	};

	const clearOTP = () => {
		setOtpCode1('');
		setOtpCode2('');
		setOtpCode3('');
		setOtpCode4('');
		setOtpCode5('');
		setOtpCode6('');
		setIsError1(false);
		setIsError2(false);
		setIsError3(false);
		setIsError4(false);
		setIsError5(false);
		setIsError6(false);
	};

	const handleResend = () => {
		resendMutation({email});
	};

	return (
		<PageContainer>
			<AuthHeader
				title="Get your code"
				sub={`6 digits OTP code has been sent to ${email}`}
			/>

			<View className="flex-1">
				<View className="flex-row justify-between gap-x-3 mt-5 mx-auto">
					<TouchableOpacity onPress={() => inputRef.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text && inputRef2.current?.focus();
								setOtpCode1(text);
								setIsError1(false);
							}}
							onFocus={() => setFocusedBox(1)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef}
							maxLength={1}
							textAlign="center"
							value={otpCode1}
							autoFocus
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8]  ${
								isError1 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 1
									? 'border-primary'
									: isError1
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRef2.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text ? inputRef3.current?.focus() : inputRef.current?.focus();
								setOtpCode2(text);
								setIsError2(false);
							}}
							onFocus={() => setFocusedBox(2)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef2}
							maxLength={1}
							textAlign="center"
							value={otpCode2}
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8]  ${
								isError2 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 2
									? 'border-primary'
									: isError2
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRef3.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text ? inputRef4.current?.focus() : inputRef2.current?.focus();
								setOtpCode3(text);
								setIsError3(false);
							}}
							onFocus={() => setFocusedBox(3)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef3}
							maxLength={1}
							textAlign="center"
							value={otpCode3}
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8]  ${
								isError3 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 3
									? 'border-primary'
									: isError3
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRef4.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text ? inputRef5.current?.focus() : inputRef3.current?.focus();
								setOtpCode4(text);
								setIsError4(false);
							}}
							onFocus={() => setFocusedBox(4)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef4}
							maxLength={1}
							textAlign="center"
							value={otpCode4}
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8]  ${
								isError4 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 4
									? 'border-primary'
									: isError4
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRef5.current?.focus()}>
						<TextInput
							onChangeText={text => {
								text ? inputRef6.current?.focus() : inputRef4.current?.focus();
								setOtpCode5(text);
								setIsError5(false);
							}}
							onFocus={() => setFocusedBox(5)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef5}
							maxLength={1}
							textAlign="center"
							value={otpCode5}
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8]  ${
								isError5 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 5
									? 'border-primary'
									: isError5
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => inputRef6.current?.focus()}>
						<TextInput
							onChangeText={text => {
								setOtpCode6(text);
								setIsError6(false);
								if (!text) {
									return inputRef5.current?.focus();
								}
								Keyboard.dismiss();
								setFocusedBox(0);
							}}
							onFocus={() => setFocusedBox(6)}
							onBlur={() => setFocusedBox(0)}
							inputMode="numeric"
							ref={inputRef6}
							maxLength={1}
							textAlign="center"
							value={otpCode6}
							className={`border-[1px] w-16 h-16 rounded-2xl text-4xl text-center bg-[#f7fbf8] ${
								isError6 ? 'text-red-500' : 'text-primary'
							} ${
								focusedBox === 6
									? 'border-primary'
									: isError6
									? 'border-red-500'
									: 'border-secondary'
							}`}
						/>
					</TouchableOpacity>
				</View>
				<View className="flex-row justify-center py-5">
					{isResending ? (
						<ActivityIndicator color={Colors.primary} />
					) : (
						<>
							<View>
								<Text>Didn't get code{''} </Text>
							</View>
							{timeLeft ? (
								<Text className="text-secondary"> Resend ({timeLeft})s</Text>
							) : (
								<TouchableOpacity onPress={handleResend}>
									<Text className="text-secondary font-poppins-semibold">
										{' '}
										Resend OTP
									</Text>
								</TouchableOpacity>
							)}
						</>
					)}
				</View>
			</View>
			<View className="my-10">
				<Button
					title={'Next'}
					onPress={() => handleSubmit()}
					isLoading={isPending}
				/>
			</View>
		</PageContainer>
	);
};

export default VerifyEmail;
