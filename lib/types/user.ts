export interface UserResponse {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  is_active: boolean;
  phone_e164?: string | null;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface UserUpdateProfileInput {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_e164?: string | null;
}

export interface ListingQuotaResponse {
  free_remaining: number;
  paid_remaining: number;
  country_code: string;
  updated_at: string;
}
