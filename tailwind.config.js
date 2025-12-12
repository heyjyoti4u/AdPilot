/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Yeh aapki saari files ko scan karega
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'], // Aapka Inter font
      },
      
      // Animations aur Keyframes yahaan hain
      animation: {
        // Yeh animation sirf fade karega
        'fade-in': 'fadeIn 0.5s ease-out', 
        
        // Yeh animation neeche se upar slide hoke fade-in karega
        'slide-in-up': 'slideInUp 0.5s ease-out', 
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}