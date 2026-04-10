import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface InquiryPayload {
  body: string;
}

interface MessageResponse {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id: number;
  body: string;
  created_at: string;
}

export function useSendInquiry(propertyId: number | string | undefined) {
  return useMutation<MessageResponse, Error, InquiryPayload>({
    mutationFn: (payload) =>
      api
        .post<MessageResponse>(`/messages/properties/${propertyId}/inquire`, payload)
        .then((r) => r.data),
  });
}
