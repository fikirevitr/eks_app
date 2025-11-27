import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // First show splash for 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      checkConfig();
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  const checkConfig = async () => {
    try {
      const config = await storage.getItem('app_config');
      setHasConfig(!!config);
    } catch (error) {
      console.error('Error checking config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show splash screen first
  if (showSplash) {
    return <Redirect href="/splash" />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!hasConfig) {
    return <Redirect href="/setup" />;
  }

  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
