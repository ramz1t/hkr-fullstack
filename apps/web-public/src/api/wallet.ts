import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useAxios } from "@repo/hooks/use-axios";
import {
  type TransactionDto,
  type ApiResponse,
  PaymentAction
} from "@repo/types";

export const useWalletTransactions = () => {
  const axios = useAxios();
  return useInfiniteQuery({
    queryKey: ["wallet/transactions"],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get<ApiResponse<TransactionDto>>(
        "/wallet/me/transactions",
        {
          params: { page: pageParam }
        }
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.pagination!.hasMore
        ? lastPage.meta.pagination!.page + 1
        : null;
    },
    select: (data) => [...data.pages.flatMap((page) => page.data!)]
  });
};

export const useWalletBalance = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["wallet/balance"],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<{ balance: number }>>(
        "/wallet/me/balance"
      );
      return res.data;
    }
  });
};

export const useWalletPayment = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { action: PaymentAction; amount: number }) =>
      axios.post("/wallet/me/payment", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wallet/balance"] });
      await queryClient.invalidateQueries({
        queryKey: ["wallet/transactions"]
      });
    }
  });
};
