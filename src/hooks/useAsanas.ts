import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../config/api';

export const useAsanas = () => {
  return useQuery({
    queryKey: ['asanas'],
    queryFn: async () => {
      const { data, error } = await ApiService.getAsanas();
      if (error) throw new Error(error);
      return data || [];
    },
  });
};

export const useAsana = (id: number) => {
  return useQuery({
    queryKey: ['asanas', id],
    queryFn: async () => {
      const { data, error } = await ApiService.getAsana(id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
};
