import { apiClient } from '@/src/lib/api-client';
import {
  OfferItem,
  CreateOfferPayload,
  UpdateOfferPayload,
  QueryOfferParams,
  OfferListResponse,
} from '../types/offer.types';

export const offersApi = {
  getOffers: async (params?: QueryOfferParams): Promise<OfferListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.status) queryParams.status = params.status;
    if (params?.departmentId) queryParams.departmentId = params.departmentId;
    if (params?.jobDescriptionId) queryParams.jobDescriptionId = params.jobDescriptionId;
    if (params?.search) queryParams.search = params.search;

    const res = await apiClient.get<{ message: string; data: OfferListResponse }>('/offers', {
      params: queryParams,
    });
    return res.data;
  },

  getOfferById: async (id: string): Promise<OfferItem> => {
    const res = await apiClient.get<{ message: string; data: OfferItem }>(`/offers/${id}`);
    return res.data;
  },

  createOffer: async (payload: CreateOfferPayload): Promise<OfferItem> => {
    const res = await apiClient.post<{ message: string; data: OfferItem }>('/offers', payload);
    return res.data;
  },

  updateOffer: async (id: string, payload: UpdateOfferPayload): Promise<OfferItem> => {
    const res = await apiClient.patch<{ message: string; data: OfferItem }>(`/offers/${id}`, payload);
    return res.data;
  },

  sendOffer: async (id: string): Promise<OfferItem> => {
    const res = await apiClient.post<{ message: string; data: OfferItem }>(`/offers/${id}/send`, {});
    return res.data;
  },

  withdrawOffer: async (id: string): Promise<OfferItem> => {
    const res = await apiClient.post<{ message: string; data: OfferItem }>(`/offers/${id}/withdraw`, {});
    return res.data;
  },
};
