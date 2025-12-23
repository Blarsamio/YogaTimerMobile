import { AsanaList } from '../components/AsanaList';
import { Asana } from '../types';
import { Loading } from '../components/common/Loading';
import { Error } from '../components/common/Error';
import { useAsanas } from '../hooks/useAsanas';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Asanas'>;

export const AsanasScreen: React.FC<Props> = ({ navigation }) => {
  const { data: asanas = [], isLoading, error, refetch } = useAsanas();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={(error as Error).message || 'Failed to fetch asanas'} onRetry={refetch} />;
  }

  return <AsanaList asanas={asanas} />;
};
