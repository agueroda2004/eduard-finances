import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountKeys } from "../../account";
import { useAuth } from "../../auth";
import { transactionRepository } from "../../../config/container";
import type {
  CreateTransactionInput,
  ListTransactionsOptions,
  Transaction,
  TransactionId,
  UpdateTransactionInput,
} from "../types/transaction";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (ownerId: string, options: ListTransactionsOptions) =>
    [...transactionKeys.all, "list", ownerId, options] as const,
};

export type CreateTransactionPayload = Omit<
  CreateTransactionInput,
  "ownerId"
>;

interface UpdateTransactionPayload {
  id: TransactionId;
  input: UpdateTransactionInput;
}

interface UseTransactionResult {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  createTransaction: (
    payload: CreateTransactionPayload,
  ) => Promise<Transaction>;
  updateTransaction: (
    payload: UpdateTransactionPayload,
  ) => Promise<Transaction>;
  removeTransaction: (id: TransactionId) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function useTransaction(
  options: ListTransactionsOptions = {},
): UseTransactionResult {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
  };

  const transactionsQuery = useQuery({
    queryKey: transactionKeys.list(userId ?? "anonymous", options),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return transactionRepository.findAll(userId, options);
    },
    enabled: Boolean(userId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTransactionPayload) => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return transactionRepository.create({ ...payload, ownerId: userId });
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdateTransactionPayload) =>
      transactionRepository.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: TransactionId) => transactionRepository.remove(id),
    onSuccess: invalidate,
  });

  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    removeTransaction: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
