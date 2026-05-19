import { useAxios } from "@repo/hooks/use-axios";
import type { ApiResponse, SessionDto } from "@repo/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type InvalidateQueryFilters
} from "@tanstack/react-query";

export const useSessions = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<ApiResponse<SessionDto[]>> => {
      const res = await axios.get("/auth/sessions");
      return res.data;
    }
  });
};

export const useTerminateSession = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await axios.delete(`/auth/sessions/${sessionId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries("sessions" as InvalidateQueryFilters)
  });
};
