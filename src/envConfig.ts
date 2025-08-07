// src/config.ts
import { z } from "zod";

// Chỉ lấy các biến môi trường cần thiết ra
const configSchema = z.object({
  VITE_API_END_POINT: z.string().url(),
  VITE_BANK_CODE: z.string(),
  VITE_BANK_ACCOUNT: z.string(),
  VITE_ORDER_PREFIX: z.string(),
});

const parsed = configSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Lỗi .env:", parsed.error.issues);
  throw new Error("ENV không hợp lệ. Kiểm tra lại .env file.");
}

const config = parsed.data;

export default config;
