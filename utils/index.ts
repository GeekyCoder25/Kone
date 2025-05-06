import Constants from 'expo-constants';

export const stripIfTarget = (text: string, target: string) => {
	if (text.startsWith(target)) {
		text = text.slice(1);
	}

	if (text.endsWith(target)) {
		text = text.slice(0, text.length - 1);
	}

	return text;
};

export const amountFormat = new Intl.NumberFormat('en-US', {
	style: 'decimal',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
}).format;

export const deepSearch = (obj: any, searchParams: string): boolean => {
	const query = searchParams.toLowerCase();
	if (Array.isArray(obj)) {
		return obj.some(item => deepSearch(item, query));
	}
	if (typeof obj === 'object' && obj !== null) {
		return Object.values(obj).some(value => deepSearch(value, query));
	}
	if (typeof obj === 'string' || typeof obj === 'number') {
		return obj.toString()?.toLowerCase().includes(query);
	}

	return false;
};

export const isExpo = Constants.executionEnvironment === 'storeClient';
