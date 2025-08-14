// src/models/category.model.ts

export interface Category {
  id: number;
  name: string;
  logo: string;
  parentCategoryId: number | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  path?: string; // Add path for navigation
}

export interface CategoriesResponse {
  data: Category[];
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
}
