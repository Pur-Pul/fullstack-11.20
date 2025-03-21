import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	root: 'client',
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3003',
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true, // also necessary
	},
})
