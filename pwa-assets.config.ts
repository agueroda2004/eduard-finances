import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

const BRAND_COLOR = "#16a34a";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: { fit: "contain", background: BRAND_COLOR },
    },
    apple: {
      sizes: [180],
      resizeOptions: { fit: "contain", background: BRAND_COLOR },
    },
  },
  images: ["public/pwa-source.svg"],
});
