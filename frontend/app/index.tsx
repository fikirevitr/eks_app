import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash and check config
    const init = async () => {
      // Wait 3 seconds for splash
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Then check config
      try {
        const config = await storage.getItem('app_config');
        setHasConfig(!!config);
      } catch (error) {
        console.error('Error checking config:', error);
      }
      
      setShowSplash(false);
      setLoading(false);
    };

    init();
  }, []);

  // Show splash screen
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/splash_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.companyName}>Oniks Bilgi Sistemleri</Text>
          <Text style={styles.appName}>Oniks EKS Kontrol Uygulaması</Text>
          <Text style={styles.version}>v2.25</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/splash_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
