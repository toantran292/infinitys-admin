import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/common/api";

interface CreateProblemData {
  name: string;
}

export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProblemData) => {
      const response = await instance.post("/problems", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate và refetch danh sách problems
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    }
  });
}
