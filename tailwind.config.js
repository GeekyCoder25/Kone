/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primary: '#077433',
				secondary: '#7fb796',
				button: '#4CAF50',
			},
			fontFamily: {
				'poppins-thin': ['Poppins-Thin'],
				'poppins-extralight': ['Poppins-ExtraLight'],
				'poppins-light': ['Poppins-Light'],
				'poppins-regular': ['Poppins-Regular'],
				'poppins-medium': ['Poppins-Medium'],
				'poppins-semibold': ['Poppins-SemiBold'],
				'poppins-bold': ['Poppins-Bold'],
				'poppins-extrabold': ['Poppins-ExtraBold'],
				'poppins-black': ['Poppins-Black'],
			},
		},
	},
	plugins: [],
};
