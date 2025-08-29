import http from "./http";

export interface ProductImage {
  id?: number;
  url: string;
}

export interface ProductVariant {
  value: string;
  options: string[];
}

export interface ProductCategory {
  id: number;
}

export interface Product {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  publishedAt: string;
  images: string[];
  variants: ProductVariant[];
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productTranslations: any[];
  categories: ProductCategory[];
}

export interface GetProductsResponse {
  data: Product[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "price" | "sale";
  orderBy?: "asc" | "desc";
  name?: string;
  categories?: number[];
  minPrice?: number;
  maxPrice?: number;
  createdById?: number;
}

export const productApi = {
  getProducts: async (
    params: GetProductsParams = {}
  ): Promise<GetProductsResponse> => {
    const response = await http.get("/products", { params });
    return response.data;
  },

  getNewProducts: async (limit: number = 10): Promise<GetProductsResponse> => {
    const response = await http.get("/products", {
      params: {
        page: 1,
        limit,
        sortBy: "createdAt",
        orderBy: "desc",
      },
    });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await http.get(`/products/${id}`);
    return response.data;
  },
};
