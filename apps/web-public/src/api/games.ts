import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "@repo/hooks/use-axios";
import {
  type CoinflipBetDto,
  type ApiResponse,
  type RevealedSeedsDto,
  type SeedsDto,
  CoinSide
} from "@repo/types";

export const useCoinflipBet = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async ({
      wager,
      side
    }: {
      wager: number;
      side: CoinSide;
    }) => {
      const res = await axios.post<ApiResponse<CoinflipBetDto>>(
        "/api/games/coinflip/bet",
        { wager, side }
      );
      return res.data.data!;
    }
  });
};

export const useBet = (betId: string | null) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["bet", betId],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<CoinflipBetDto>>(
        `/api/bets/${betId}`
      );
      return res.data.data!;
    },
    enabled: !!betId
  });
};

export const useRevealSeeds = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async () => {
      const res = await axios.post<ApiResponse<RevealedSeedsDto>>(
        "/api/provably-fair/reveal"
      );
      return res.data.data!;
    }
  });
};

export const useSetSeed = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async (clientSeed: string) => {
      const res = await axios.post<ApiResponse<SeedsDto>>(
        "/api/provably-fair/seed",
        { clientSeed }
      );
      return res.data.data!;
    }
  });
};
