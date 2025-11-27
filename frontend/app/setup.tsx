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
} from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || 'http://localhost:8001';
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
      // Construct full URL
      const fullUrl = BASE_URL + fileName.trim();
      
      // Fetch JSON from URL
      const response = await axios.get(fullUrl);
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
          <Text style={styles.title}>Oniks EKS APP</Text>
          <Text style={styles.subtitle}>Konfigürasyon Kurulumu</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Ana Link:</Text>
            <Text style={styles.infoValue}>{BASE_URL}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Konfigürasyon Dosya Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="config.json"
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
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
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
});
