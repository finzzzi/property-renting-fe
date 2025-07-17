import { Property } from "./tenant-property-types";

export interface PropertyPicture {
  id: number;
  property_id: number;
  file_path: string;
  is_main: boolean;
  created_at: string;
  public_url: string;
  property: Property;
}

export interface PicturesResponse {
  success: boolean;
  data: PropertyPicture[];
}

export interface DeleteResponse {
  success: boolean;
  data: {
    message: string;
  };
}
