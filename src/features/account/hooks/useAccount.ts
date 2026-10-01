import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountRepository } from "../../../config/container";
import { useAuth } from "../../auth";
import type {
  Account,
  AccountId,
  CreateAccountInput,
  UpdateAccountInput,
} from "../types/account";

export const accountKeys = {
  all: ["accounts"] as const,
  list: (ownerId: string) => [...accountKeys.all, "list", ownerId] as const,
};

export type CreateAccountPayload = Omit<CreateAccountInput, "ownerId">;

interface UpdateAccountPayload {
  id: AccountId;
  input: UpdateAccountInput;
}

interface UseAccountResult {
  accounts: Account[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  createAccount: (payload: CreateAccountPayload) => Promise<Account>;
  updateAccount: (payload: UpdateAccountPayload) => Promise<Account>;
  removeAccount: (id: AccountId) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function useAccount(): UseAccountResult {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: accountKeys.all });

  const accountsQuery = useQuery({
    queryKey: accountKeys.list(userId ?? "anonymous"),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return accountRepository.findAll(userId);
    },
    enabled: Boolean(userId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return accountRepository.create({ ...payload, ownerId: userId });
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdateAccountPayload) =>
      accountRepository.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: AccountId) => accountRepository.remove(id),
    onSuccess: invalidate,
  });

  return {
    accounts: accountsQuery.data ?? [],
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    error: accountsQuery.error,
    refetch: accountsQuery.refetch,
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    removeAccount: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
