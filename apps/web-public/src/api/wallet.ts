import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@repo/hooks/use-axios";
import type { ApiResponse, WalletDto } from "@repo/types";

export const useWallet = () => {
  const axios = useAxios();
  return useQuery<WalletDto>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<WalletDto>>("/api/wallet/me");
      return res.data.data!;
    }
  });
};
