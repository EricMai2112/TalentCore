import { useMutation, useQueryClient } from '@tanstack/react-query'
import { offersApi } from '../services/offers.api'
import { offerKeys } from './useOffersQuery'

export function useSendOfferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offerId: string) => offersApi.sendOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
    }
  })
}

export function useWithdrawOfferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offerId: string) => offersApi.withdrawOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all })
    }
  })
}
