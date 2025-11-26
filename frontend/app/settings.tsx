import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function SettingsScreen() {
  const router = useRouter();
  const [jsonUrl, setJsonUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    try {
      const url = await storage.getItem('config_url');
      if (url) {
        setCurrentUrl(url);
        setJsonUrl(url);
      }
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  };

  const handleUpdate = async () => {
    if (!jsonUrl.trim()) {
      Alert.alert('Hata', 'Lütfen JSON URL giriniz');
      return;
    }

    setLoading(true);
    try {
      // Fetch new config
      const response = await axios.get(jsonUrl);
      const config = response.data;

      // Validate
      if (!config.app_name || !config.pages || !config.buttons) {
        throw new Error('Invalid configuration format');
      }

      // Update storage
      await storage.setItem('app_config', JSON.stringify(config));
      await storage.setItem('config_url', jsonUrl);

      Alert.alert('Başarılı', 'Konfigürasyon güncellendi', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating config:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.detail || error.message || 'JSON yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUrl) {
      Alert.alert('Hata', 'Mevcut konfigürasyon URL bulunamadı');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(currentUrl);
      const config = response.data;

      await storage.setItem('app_config', JSON.stringify(config));

      Alert.alert('Başarılı', 'Konfigürasyon yenilendi', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error refreshing config:', error);
      Alert.alert('Hata', 'Konfigürasyon yenilenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Veri Temizle',
      'Tüm uygulama verileri silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await storage.clear();
            Alert.alert('Başarılı', 'Veriler temizlendi', [
              { text: 'Tamam', onPress: () => router.replace('/setup') },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ayarlar</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Current URL Info */}
          {currentUrl && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Mevcut Konfigürasyon URL:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {currentUrl}
              </Text>
            </View>
          )}

          {/* URL Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>JSON Konfigürasyon URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/config.json"
              placeholderTextColor="#999"
              value={jsonUrl}
              onChangeText={setJsonUrl}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>URL Güncelle ve İndir</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.refreshButton, loading && styles.buttonDisabled]}
              onPress={handleRefresh}
              disabled={loading || !currentUrl}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Mevcut Konfigürasyonu Yenile</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Tehlikeli Alan</Text>
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleClearData}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Tüm Verileri Temizle</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.helpCard}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.helpText}>
              URL değiştirdiğinizde yeni konfigürasyon indirilir ve eski veriler güncellenir.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  infoCard: {
    backgroundColor: '#e3f2ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
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
  buttonGroup: {
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  updateButton: {
    backgroundColor: '#007AFF',
  },
  refreshButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 24,
    marginBottom: 24,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
});
