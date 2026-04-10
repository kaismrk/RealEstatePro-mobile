export interface MessageResponse {
  id: number;
  sender_id: number;
  sender_name?: string;
  sender_email?: string;
  recipient_id: number;
  property_id: number;
  property?: { id: number; title: string; price: number; images?: string[] };
  body: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
}

export interface MessageList {
  total: number;
  items: MessageResponse[];
  page?: number;
  size?: number;
}
