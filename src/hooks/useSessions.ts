import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../config/api';
import { Session } from '../types';
import { useDeviceUser } from './useDeviceUser';

export const useSessions = () => {
  const { deviceId, isLoading: isDeviceLoading } = useDeviceUser();
  return useQuery({
    queryKey: ['sessions', 'list', deviceId],
    enabled: !isDeviceLoading,
    queryFn: async () => {
      const { data, error } = await ApiService.getSessions(deviceId ?? undefined);
      if (error) throw new Error(error);
      return (data || []).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
};

export const useSession = (id: number | string) => {
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
    mutationFn: async (sessionData: { name: string; description?: string; deviceId?: string; timers?: any[] }) => {
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
  const { deviceId } = useDeviceUser();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { error } = await ApiService.deleteSession(id, deviceId ?? undefined);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
