import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAxios } from "@repo/hooks/use-axios";
import {
  type CoinflipBetDto,
  type SlotsBetDto,
  type ApiResponse,
  type RevealedSeedsDto,
  type SeedsDto,
  CoinSide,
  type AnyGameBetDto
} from "@repo/types";

export const useCoinflipBet = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async ({ wager, side }: { wager: number; side: CoinSide }) => {
      const res = await axios.post<ApiResponse<CoinflipBetDto>>(
        "/games/coinflip/bet",
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
      const res = await axios.get<ApiResponse<AnyGameBetDto>>(`/bets/${betId}`);
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
        "/provably-fair/reveal"
      );
      return res.data.data!;
    }
  });
};

export const useBets = (gameSlug?: string) => {
  const axios = useAxios();
  return useInfiniteQuery({
    queryKey: ["bets", gameSlug],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get<ApiResponse<AnyGameBetDto>>("/bets", {
        params: { page: pageParam, pageSize: 10, game: gameSlug }
      });
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

export const useCurrentSeeds = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["provably-fair"],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<SeedsDto>>("/provably-fair");
      return res.data.data!;
    }
  });
};

export const useSetSeed = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async (clientSeed: string) => {
      const res = await axios.post<ApiResponse<SeedsDto>>(
        "/provably-fair/seed",
        { clientSeed }
      );
      return res.data.data!;
    }
  });
};

export const useSlotsBet = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: async ({ wager }: { wager: number }) => {
      const res = await axios.post<ApiResponse<SlotsBetDto>>(
        "/games/slots/bet",
        { wager }
      );
      return res.data.data!;
    }
  });
};
