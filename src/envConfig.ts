// src/config.ts
import { z } from "zod";

// Chỉ lấy các biến môi trường cần thiết ra
const configSchema = z.object({
  VITE_API_END_POINT: z.string().url(), // hoặc z.string() nếu không chắc là URL
});

const parsed = configSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Lỗi .env:", parsed.error.issues);
  throw new Error("ENV không hợp lệ. Kiểm tra lại .env file.");
}

const config = parsed.data;

export default config;
