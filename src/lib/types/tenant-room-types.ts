export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  max_guests: number;
  quantity: number;
  property_id: number;
  property_name: string;
  created_at: string;
  updated_at: string;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface RoomFormData {
  name: string;
  description: string;
  price: string;
  max_guests: string;
  quantity: string;
}
