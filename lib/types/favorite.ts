import type { PropertySchema } from './property';

export interface FavoriteResponse {
  id: number;
  user_id: number;
  property_id: number;
  created_at: string;
  property: PropertySchema;
}

export interface FavoriteList {
  total: number;
  items: FavoriteResponse[];
}
