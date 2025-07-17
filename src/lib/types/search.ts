export interface Property {
  property_id: number;
  name: string;
  location: string;
  category: string;
  city_id: number;
  property_pictures: string;
  price: number;
  available_rooms: number;
}

export interface Category {
  name: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: Property[];
  categories: Category[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_properties: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export interface SearchParams {
  city_id: string;
  check_in: string;
  check_out: string;
  guests: string;
  page: string;
  property_name?: string;
  category_name?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CategoryWithCount {
  name: string;
  count: number;
}

export interface SortOption {
  value: string;
  label: string;
  sort_by: string;
  sort_order: string;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    value: "price-asc",
    label: "Harga Terendah",
    sort_by: "price",
    sort_order: "asc",
  },
  {
    value: "price-desc",
    label: "Harga Tertinggi",
    sort_by: "price",
    sort_order: "desc",
  },
  {
    value: "name-asc",
    label: "Nama A ke Z",
    sort_by: "name",
    sort_order: "asc",
  },
  {
    value: "name-desc",
    label: "Nama Z ke A",
    sort_by: "name",
    sort_order: "desc",
  },
];
