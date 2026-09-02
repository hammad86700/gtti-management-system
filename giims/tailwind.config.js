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
                govt: {
                    green: {
                        DEFAULT: '#00401A',
                        50: '#EDF7F1',
                        100: '#D5EDDF',
                        200: '#A9DCBE',
                        300: '#72C497',
                        400: '#3EA76E',
                        500: '#006B3F',
                        600: '#005A34',
                        700: '#00401A',
                        800: '#003315',
                        900: '#00240E',
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
                        DEFAULT: '#F8FAF8',
                        50: '#FFFFFF',
                        100: '#FAFCFA',
                        200: '#F4F7F4',
                        300: '#F8FAF8',
                        400: '#E8ECE8',
                        500: '#D2D9D2',
                    },
                    dark: {
                        DEFAULT: '#0F2618',
                        50: '#1F472F',
                        100: '#0F2618',
                        200: '#0B1C12',
                        300: '#07120B',
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
