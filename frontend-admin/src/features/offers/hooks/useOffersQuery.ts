import { useQuery } from '@tanstack/react-query'
import { offersApi } from '../services/offers.api'
import { OfferItem, QueryOfferParams } from '../types/offer.types'

export const offerKeys = {
  all: ['offers'] as const,
  lists: () => [...offerKeys.all, 'list'] as const,
  list: (params: QueryOfferParams) => [...offerKeys.lists(), params] as const,
  details: () => [...offerKeys.all, 'detail'] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const
}

interface UseOffersQueryOptions {
  params: QueryOfferParams
  initialData?: { items: OfferItem[]; total: number }
  enabled?: boolean
}

export function useOffersQuery({ params, initialData, enabled = true }: UseOffersQueryOptions) {
  return useQuery({
    queryKey: offerKeys.list(params),
    queryFn: () => offersApi.getOffers(params),
    placeholderData: (previousData) => previousData,
    initialData,
    enabled,
    staleTime: 60 * 1000 // 1 minute
  })
}
