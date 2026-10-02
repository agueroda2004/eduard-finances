import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountKeys } from "../../account";
import { useAuth } from "../../auth";
import { transferRepository } from "../../../config/container";
import type {
  CreateTransferInput,
  ListTransfersOptions,
  Transfer,
  TransferId,
  UpdateTransferInput,
} from "../types/transfer";

export const transferKeys = {
  all: ["transfers"] as const,
  list: (ownerId: string, options: ListTransfersOptions) =>
    [...transferKeys.all, "list", ownerId, options] as const,
};

export type CreateTransferPayload = Omit<CreateTransferInput, "ownerId">;

interface UpdateTransferPayload {
  id: TransferId;
  input: UpdateTransferInput;
}

interface UseTransferResult {
  transfers: Transfer[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  createTransfer: (payload: CreateTransferPayload) => Promise<Transfer>;
  updateTransfer: (payload: UpdateTransferPayload) => Promise<Transfer>;
  removeTransfer: (id: TransferId) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function useTransfer(
  options: ListTransfersOptions = {},
): UseTransferResult {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: transferKeys.all });
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
  };

  const transfersQuery = useQuery({
    queryKey: transferKeys.list(userId ?? "anonymous", options),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return transferRepository.findAll(userId, options);
    },
    enabled: Boolean(userId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTransferPayload) => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return transferRepository.create({ ...payload, ownerId: userId });
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdateTransferPayload) =>
      transferRepository.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: TransferId) => transferRepository.remove(id),
    onSuccess: invalidate,
  });

  return {
    transfers: transfersQuery.data ?? [],
    isLoading: transfersQuery.isLoading,
    isError: transfersQuery.isError,
    error: transfersQuery.error,
    refetch: transfersQuery.refetch,
    createTransfer: createMutation.mutateAsync,
    updateTransfer: updateMutation.mutateAsync,
    removeTransfer: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
