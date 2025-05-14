import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

export default function LandingScreen() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (segments[0] !== undefined) {
      router.replace('/appointments');
    }
  }, [segments]);

  return null;
}