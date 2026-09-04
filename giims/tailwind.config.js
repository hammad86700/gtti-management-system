import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                brand: {
                    pine: '#0B3B24',
                    'pine-hover': '#124E31',
                    'pine-active': '#175C3B',
                    'pine-dark': '#062114',
                    'pine-surface': '#082D1B',
                    emerald: '#10B981',
                    'emerald-dark': '#059669',
                    canvas: '#F4F6F8',
                    surface: '#FFFFFF',
                },
                tier: {
                    exceeding: {
                        bg: '#ECFDF5',
                        text: '#047857',
                        border: '#A7F3D0',
                    },
                    meeting: {
                        bg: '#F0F9FF',
                        text: '#0369A1',
                        border: '#BAE6FD',
                    },
                    approaching: {
                        bg: '#FFFBEB',
                        text: '#B45309',
                        border: '#FDE68A',
                    },
                    below: {
                        bg: '#FFF1F2',
                        text: '#BE123C',
                        border: '#FECDD3',
                    },
                },
                govt: {
                    green: {
                        DEFAULT: '#0B3B24',
                        50: '#EDF7F1',
                        100: '#D5EDDF',
                        200: '#A9DCBE',
                        300: '#72C497',
                        400: '#3EA76E',
                        500: '#006B3F',
                        600: '#175C3B',
                        700: '#124E31',
                        800: '#0B3B24',
                        900: '#062114',
                    },
                    gold: {
                        DEFAULT: '#C49A1A',
                        50: '#FDF9EB',
                        100: '#FBF1CE',
                        200: '#F7E298',
                        300: '#EDCB57',
                        400: '#D9AD27',
                        500: '#C49A1A',
                        600: '#A37B10',
                        700: '#7D5C0A',
                        800: '#5C4206',
                        900: '#3D2A03',
                    },
                    cream: {
                        DEFAULT: '#F4F6F8',
                        50: '#FFFFFF',
                        100: '#F8FAFC',
                        200: '#F4F6F8',
                        300: '#EDF2F7',
                        400: '#E2E8F0',
                        500: '#CBD5E1',
                    },
                    dark: {
                        DEFAULT: '#0B3B24',
                        50: '#175C3B',
                        100: '#124E31',
                        200: '#0B3B24',
                        300: '#062114',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                serif: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
            },
            boxShadow: {
                'govt': '0 1px 3px 0 rgba(0, 64, 26, 0.08), 0 1px 2px -1px rgba(0, 64, 26, 0.06)',
                'govt-md': '0 4px 6px -1px rgba(0, 64, 26, 0.08), 0 2px 4px -2px rgba(0, 64, 26, 0.06)',
                'govt-lg': '0 10px 15px -3px rgba(0, 64, 26, 0.08), 0 4px 6px -4px rgba(0, 64, 26, 0.06)',
                'gold': '0 1px 3px 0 rgba(196, 154, 26, 0.15), 0 1px 2px -1px rgba(196, 154, 26, 0.1)',
                'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
                'card-hover': '0 6px 16px -2px rgba(0, 64, 26, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            },
        },
    },

    plugins: [forms],
};
