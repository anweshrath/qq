
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
				'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
				'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
				'2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
				'3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
				'4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
				'5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
				'7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'glow': '0 0 30px rgba(139, 92, 246, 0.4)',
				'glow-lg': '0 0 50px rgba(139, 92, 246, 0.6)',
				'premium': '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(139, 92, 246, 0.1)',
				'premium-dark': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
					},
					'50%': {
						boxShadow: '0 0 60px rgba(139, 92, 246, 0.8)',
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) scale(1)',
					},
					'50%': {
						transform: 'translateY(-15px) scale(1.02)',
					}
				},
				'glow': {
					'0%': {
						boxShadow: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
					},
					'100%': {
						boxShadow: '0 0 50px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.4)',
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0',
					},
					'100%': {
						backgroundPosition: '200% 0',
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-5px)',
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 3s ease-in-out infinite alternate',
				'shimmer': 'shimmer 2s infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'scale-in': 'scale-in 0.3s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
			},
			transitionTimingFunction: {
				'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
