import React, { useState, useEffect } from 'react';
import { AsanaList } from '../components/AsanaList';
import { Asana } from '../types';
import { Loading } from '../components/common/Loading';
import { Error } from '../components/common/Error';
import { API_URL } from '../config/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Asanas'>;

export const AsanasScreen: React.FC<Props> = ({ navigation }) => {
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsanas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/asanas`);
      if (!response.ok) {
        setError('Failed to fetch asanas');
        return;
      }

      const data = (await response.json()) as Asana[];
      setAsanas(data);
    } catch (err) {
      setError('An unexpected error occurred');
      // Error loading asanas
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsanas();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={fetchAsanas} />;
  }

  return <AsanaList asanas={asanas} />;
};
