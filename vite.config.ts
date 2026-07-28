import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],

	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
						return "vendor";
					}
				},
			},
		},
	},

	server: {
		port: 5173,
		host: "0.0.0.0",
	},

	preview: {
		port: 4173,
		host: "0.0.0.0",
	},
});
