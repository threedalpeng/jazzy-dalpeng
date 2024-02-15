import daisyui from 'daisyui';
import themes from 'daisyui/src/theming/themes';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'primary-light': 'oklch(var(--primary-light) / <alpha-value>)'
			},
			fontFamily: {
				jazz: 'FinaleJazz',
				chord: 'FinaleJazzChord'
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				dalpeng: {
					...themes['light'],
					'--primary-light': '86.99% 0.062 274.04',
					primary: '#4338ca'
				}
			},
			'cupcake'
		]
	}
};
