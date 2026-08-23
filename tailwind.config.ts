import type {Config} from "tailwindcss";
const config:Config={content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{colors:{ink:"#10281f",forest:"#174f3a",lime:"#d8f05e",sand:"#f6f4ed"},boxShadow:{soft:"0 24px 80px rgba(16,40,31,.14)"}}},plugins:[]};
export default config;
