import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import axios from 'axios';

const API_URL = 'https://remote-pi-commander.preview.emergentagent.com';
const BASE_URL = 'https://oniksbilgi.com.tr/cdn/jsons/';

export default function SetupScreen() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fileName.trim()) {
      Alert.alert('Hata', 'Lütfen dosya adı giriniz');
      return;
    }

    setLoading(true);
    try {
      // Construct full URL - automatically add .json extension
      const fileNameWithExtension = fileName.trim() + '.json';
      const fullUrl = BASE_URL + fileNameWithExtension;
      
      // Fetch JSON through backend proxy to avoid CORS issues
      const response = await axios.get(`${API_URL}/api/config/fetch`, {
        params: { url: fullUrl },
        timeout: 60000, // 60 seconds
      });
      const config = response.data;

      // Validate config structure
      if (!config.app_name || !config.pages || !config.buttons) {
        throw new Error('Invalid configuration format');
      }

      // Store config, file name, and full URL
      await storage.setItem('app_config', JSON.stringify(config));
      await storage.setItem('config_file_name', fileName.trim());
      await storage.setItem('config_url', fullUrl);

      Alert.alert('Başarılı', 'Konfigürasyon yüklendi', [
        { text: 'Tamam', onPress: () => router.replace('/home') },
      ]);
    } catch (error: any) {
      console.error('Error loading config:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.detail || error.message || 'JSON yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/eks_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Konfigürasyon Kurulumu</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Konfigürasyon Dosya Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="config dosya adı"
              placeholderTextColor="#999"
              value={fileName}
              onChangeText={setFileName}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Başlat</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Eğer konfigürasyon dosya adına sahip değilseniz{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => Linking.openURL('https://oniksbilgi.com')}
                >
                  Oniks Bilgi Sistemleri
                </Text>
                {' '}ile iletişime geçiniz.
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:oniksbilgi@gmail.com')}>
                <Text style={styles.emailText}>oniksbilgi@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 240,
    height: 80,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emailText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
