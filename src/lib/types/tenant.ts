export interface Property {
  id: number;
  name: string;
  address: string;
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export interface RoomFormData {
  name: string;
  description: string;
  price: string;
  max_guests: string;
  quantity: string;
  property_id: string;
}

export interface Room {
  id: number;
  name: string;
}

export interface Unavailability {
  id: number;
  room_id: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
}

export interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    file_path: string;
    public_url: string;
    is_main: boolean;
    created_at: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export interface PropertyImageFormData {
  property_id: string;
  file: File | null;
  is_main: boolean;
}

export interface RoomPicture {
  id: number;
  file_path: string;
  created_at: string;
  public_url: string;
}

export interface RoomWithPictures {
  id: number;
  name: string;
  description: string;
  property_id: number;
  property: {
    id: number;
    name: string;
    location: string;
  };
  pictures: RoomPicture[];
  has_pictures: boolean;
  picture_count?: number;
}

export interface RoomsResponse {
  success: true;
  data: {
    property: {
      id: number;
      name: string;
      location: string;
    };
    rooms: RoomWithPictures[];
    message?: string;
  };
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}
