// src/config/api.ts

const ENV: "dev" | "prod" = "prod"; // ganti "prod" jika mau produksi

const API_URLS = {
  dev: "http://localhost:3015",
  prod: "https://api.rakevserver.site",
};

export const baseUrl = API_URLS[ENV];
