import type { Config } from 'tailwindcss';

/**
 * Sistema visual PES — direccion industrial tecnica.
 *
 * Colores tomados del logotipo y de las piezas graficas oficiales de PES:
 *   navy 900 = #040B1D   azul marino oscuro (tono de los flyers oficiales)
 *   gold 500 = #C68605   dorado del logotipo
 *   gold 400 = #E0A402   dorado de interfaz
 *
 * Decisiones deliberadas: esquinas practicamente rectas, sin sombras suaves,
 * y una sola familia tipográfica neutra para texto y cifras. La jerarquia la construyen las reglas y el
 * espaciado, no las tarjetas flotantes.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF1F7',
          100: '#D6DEEB',
          200: '#AEBED6',
          300: '#7690B8',
          400: '#456694',
          500: '#264873',
          600: '#173257',
          700: '#0E2140',
          800: '#08152C',
          900: '#040B1D',
          950: '#020610',
        },
        gold: {
          50: '#FDF6E7',
          100: '#FAE9C0',
          200: '#F5D48A',
          300: '#EFBC4A',
          400: '#E0A402',
          500: '#C68605',
          600: '#A66E04',
          700: '#815503',
          800: '#5E3E03',
          900: '#3D2802',
        },
        canvas: '#FFFFFF',
        mist: '#F7F9FC',
      },
      borderRadius: {
        // Casi rectas: 2px es suficiente para no verse tosco en pantalla.
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        card: '2px',
        full: '9999px',
      },
      boxShadow: {
        card: 'none',
        'card-hover': 'none',
        panel: '0 16px 48px -12px rgba(0, 23, 60, 0.22)',
      },
      fontFamily: {
        display: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
        wide2: '0.12em',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(7px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'drawer-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'page-in': 'page-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'dialog-in': 'dialog-in 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
        'drawer-in': 'drawer-in 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
