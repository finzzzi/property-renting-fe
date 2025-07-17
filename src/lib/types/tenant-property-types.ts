export interface Category {
  id: number;
  name: string;
  tenant_id?: string | null;
}

export interface City {
  id: number;
  type: string;
  name: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
  total: number;
}

export interface Property {
  id: number;
  name: string;
  description: string;
  location: string;
  category_id: number;
  city_id: number;
  category?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property;
}

export interface PropertyFormData {
  name: string;
  description: string;
  location: string;
  category_id: string;
  city_id: string;
}
