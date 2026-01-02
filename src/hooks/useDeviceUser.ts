import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'YOGA_TIMER_DEVICE_ID';

export const useDeviceUser = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeviceId();
  }, []);

  const loadDeviceId = async () => {
    try {
      setIsLoading(true);
      let id = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      }

      setDeviceId(id);
    } catch (error) {
      console.error('Failed to load device ID', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { deviceId, isLoading };
};
