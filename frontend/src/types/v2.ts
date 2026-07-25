export interface Translation {
  en: string;
  ta: string;
}

export interface Size {
  value: number;
  unit: 'mg' | 'g' | 'kg' | 'ml' | 'L' | 'capsule' | 'tablet' | 'pcs';
}

export interface CategoryV2 {
  _id: string;
  name: Translation;
  slug: Translation;
  description: Translation;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductV2 {
  _id: string;
  name: Translation;
  slug: Translation;
  productMotto: Translation;
  shortDescription: Translation;
  description: Translation;
  expiryDuration: Translation;
  category: CategoryV2 | string;
  price: number;
  discountPrice: number;
  stock: number;
  size: Size;
  ingredients: Translation[];
  benefits: Translation[];
  usageInstructions: Translation[];
  safetyInstructions: Translation[];
  storageInstructions: Translation[];
  tags: Translation[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
