import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAxios } from "@repo/hooks/use-axios";
import { type TransactionDto, type ApiResponse } from "@repo/types";

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
