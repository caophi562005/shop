// src/api/categoryApi.ts

import http from "./http";
import type { CategoriesResponse } from "../models/category.model";

export const categoryApi = {
  // Lấy tất cả categories (cấp 1)
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await http.get("/categories");
    return response.data;
  },

  // Lấy subcategories theo parentCategoryId
  getSubcategories: async (
    parentCategoryId: number
  ): Promise<CategoriesResponse> => {
    const response = await http.get(
      `/categories?parentCategoryId=${parentCategoryId}`
    );
    return response.data;
  },
};
