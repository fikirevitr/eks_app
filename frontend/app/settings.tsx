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
import { StatusBar } from 'react-native';

const API_URL = 'https://pi-control.preview.emergentagent.com';
const BASE_URL = 'https://oniksbilgi.com.tr/cdn/jsons/';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [loadedDate, setLoadedDate] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    try {
      const savedFileName = await storage.getItem('config_file_name');
      const savedLoadedDate = await storage.getItem('config_loaded_date');
      const savedUpdatedDate = await storage.getItem('config_updated_date');
      
      if (savedFileName) {
        setCurrentFileName(savedFileName);
      }
      if (savedLoadedDate) {
        setLoadedDate(savedLoadedDate);
      }
      if (savedUpdatedDate) {
        setUpdatedDate(savedUpdatedDate);
      }
    } catch (error) {
      console.error('Error loading file name:', error);
    }
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = async () => {
    if (!currentFileName) {
      Alert.alert('Hata', 'Mevcut konfigürasyon dosyası bulunamadı');
      return;
    }

    setLoading(true);
    try {
      // Add .json extension if not present
      const fileNameWithExtension = currentFileName.endsWith('.json') 
        ? currentFileName 
        : currentFileName + '.json';
      const fullUrl = BASE_URL + fileNameWithExtension;
      const response = await axios.get(`${API_URL}/api/config/fetch`, {
        params: { url: fullUrl },
        timeout: 60000, // 60 seconds
      });
      const config = response.data;

      // Update config and update date
      const currentDate = new Date().toISOString();
      await storage.setItem('app_config', JSON.stringify(config));
      await storage.setItem('config_updated_date', currentDate);
      setUpdatedDate(currentDate);

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

  const handleClearData = async () => {
    // Use platform-specific confirmation
    if (Platform.OS === 'web') {
      try {
        // For web, use direct confirm
        if (typeof window !== 'undefined' && window.confirm) {
          const confirmed = window.confirm(
            'Tüm Verileri Temizle\n\nTüm uygulama verileri (konfigürasyon dosyası ve ayarlar) silinecek. Emin misiniz?'
          );
          
          if (!confirmed) {
            return; // User cancelled
          }
        } else {
          // Fallback if window.confirm not available
          console.log('Clearing data...');
        }
        
        // Clear all storage
        await storage.clear();
        
        // Clear state
        setCurrentFileName('');
        
        // Show success message
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Başarılı! Tüm veriler temizlendi.');
        }
        
        // Redirect to setup
        router.replace('/setup');
      } catch (error) {
        console.error('Error clearing data:', error);
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Hata: Veriler temizlenirken bir hata oluştu');
        }
      }
    } else {
      // Mobile: Use Alert
      Alert.alert(
        'Tüm Verileri Temizle',
        'Tüm uygulama verileri (konfigürasyon dosyası ve ayarlar) silinecek. Emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Evet, Temizle',
            style: 'destructive',
            onPress: async () => {
              try {
                // Clear all storage
                await storage.clear();
                
                // Clear state
                setCurrentFileName('');
                
                // Show success message and redirect
                Alert.alert('Başarılı', 'Tüm veriler temizlendi', [
                  { text: 'Tamam', onPress: () => router.replace('/setup') },
                ]);
              } catch (error) {
                console.error('Error clearing data:', error);
                Alert.alert('Hata', 'Veriler temizlenirken bir hata oluştu');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
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

          {/* Current File Name Info */}
          {currentFileName && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Mevcut Konfigürasyon Dosyası:</Text>
              <Text style={styles.infoValue}>{currentFileName}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>

            <TouchableOpacity
              style={[styles.button, styles.refreshButton, loading && styles.buttonDisabled]}
              onPress={handleRefresh}
              disabled={loading || !currentFileName}
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
              "Yenile" butonu ile mevcut konfigürasyonu güncelleyebilir, "Temizle" butonu ile tüm verileri sıfırlayabilirsiniz.
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
