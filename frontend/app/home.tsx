import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  command: string;
}

interface Button {
  id: string;
  pageId: string;
  order: number;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  ssh: SSHConfig;
}

interface Page {
  pageId: string;
  pageName: string;
  pageIcon: string;
  order: number;
}

interface AppConfig {
  app_name: string;
  version: string;
  pages: Page[];
  buttons: Button[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [executingButton, setExecutingButton] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configStr = await storage.getItem('app_config');
      if (configStr) {
        const parsedConfig: AppConfig = JSON.parse(configStr);
        
        // Sort pages by order
        parsedConfig.pages.sort((a, b) => a.order - b.order);
        
        // Sort buttons by order
        parsedConfig.buttons.sort((a, b) => a.order - b.order);
        
        setConfig(parsedConfig);
        setSelectedPage(parsedConfig.pages[0]?.pageId || '');
      } else {
        router.replace('/setup');
      }
    } catch (error) {
      console.error('Error loading config:', error);
      Alert.alert('Hata', 'Konfigürasyon yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = (button: Button) => {
    router.push({
      pathname: '/execute',
      params: {
        buttonId: button.id,
        buttonData: JSON.stringify(button),
      },
    });
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!config) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Konfigürasyon bulunamadı</Text>
      </View>
    );
  }

  const currentButtons = config.buttons.filter(
    (btn) => btn.pageId === selectedPage
  );

  const showTabs = config.pages.length > 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/images/eks_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>APP</Text>
        </View>
        <TouchableOpacity onPress={goToSettings} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs for multiple pages */}
      {showTabs && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {config.pages.map((page) => (
            <TouchableOpacity
              key={page.pageId}
              style={[
                styles.tab,
                selectedPage === page.pageId && styles.tabActive,
              ]}
              onPress={() => setSelectedPage(page.pageId)}
            >
              <Ionicons
                name={page.pageIcon as any}
                size={16}
                color={selectedPage === page.pageId ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedPage === page.pageId && styles.tabTextActive,
                ]}
              >
                {page.pageName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Button List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {currentButtons.map((button) => (
          <CommandButton
            key={button.id}
            button={button}
            onPress={() => handleButtonPress(button)}
            isExecuting={executingButton === button.id}
          />
        ))}
        
        {currentButtons.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Bu sayfada buton bulunmuyor</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface CommandButtonProps {
  button: Button;
  onPress: () => void;
  isExecuting: boolean;
}

function CommandButton({ button, onPress, isExecuting }: CommandButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.commandButton,
          { backgroundColor: button.color || '#007AFF' },
          isExecuting && styles.commandButtonExecuting,
        ]}
        onPress={handlePress}
        disabled={isExecuting}
        activeOpacity={0.8}
      >
        <View style={styles.buttonIcon}>
          <Ionicons name={button.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>{button.title}</Text>
          {button.subtitle && (
            <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
          )}
        </View>
        <View style={styles.buttonArrow}>
          {isExecuting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  settingsButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    minHeight: 36,
  },
  tabActive: {
    backgroundColor: '#e3f2ff',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  commandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    marginHorizontal: 2,
    minHeight: 68,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  commandButtonExecuting: {
    opacity: 0.7,
  },
  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
    flexShrink: 1,
  },
  buttonSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    flexShrink: 1,
  },
  buttonArrow: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
