import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../config/api';
import { Session } from '../types';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await ApiService.getSessions();
      if (error) throw new Error(error);
      return data || [];
    },
  });
};

export const useSession = (id: number) => {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const { data, error } = await ApiService.getSession(id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionData: { name: string; description?: string }) => {
      const { data, error } = await ApiService.createSession(sessionData);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await ApiService.deleteSession(id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
