/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-headings': theme('colors.emerald.500'),
            '--tw-prose-links': theme('colors.emerald.400'),
            '--tw-prose-bold': theme('colors.gray.100'),
            '--tw-prose-counters': theme('colors.gray.400'),
            '--tw-prose-bullets': theme('colors.gray.400'),
            '--tw-prose-quotes': theme('colors.gray.300'),
            '--tw-prose-code': theme('colors.gray.200'),
            '--tw-prose-pre-code': theme('colors.gray.200'),
            '--tw-prose-pre-bg': theme('colors.gray.800'),
            '--tw-prose-th-borders': theme('colors.gray.600'),
            '--tw-prose-td-borders': theme('colors.gray.700'),
            maxWidth: 'none',
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.emerald.400'),
              '&:hover': {
                color: theme('colors.emerald.300'),
              },
            },
            h1: {
              color: theme('colors.emerald.500'),
            },
            h2: {
              color: theme('colors.emerald.500'),
            },
            h3: {
              color: theme('colors.emerald.500'),
            },
            h4: {
              color: theme('colors.emerald.500'),
            },
            h5: {
              color: theme('colors.emerald.500'),
            },
            h6: {
              color: theme('colors.emerald.500'),
            },
            strong: {
              color: theme('colors.gray.100'),
            },
            code: {
              color: theme('colors.emerald.300'),
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.emerald.500'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
