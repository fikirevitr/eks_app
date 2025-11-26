import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || 'http://localhost:8001';

interface Button {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  ssh: {
    host: string;
    port: number;
    username: string;
    password: string;
    command: string;
  };
}

export default function ExecuteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [button, setButton] = useState<Button | null>(null);
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'executing' | 'success' | 'error'>('idle');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.buttonData && typeof params.buttonData === 'string') {
      try {
        const parsedButton = JSON.parse(params.buttonData);
        setButton(parsedButton);
      } catch (e) {
        console.error('Error parsing button data:', e);
        Alert.alert('Hata', 'Buton verileri yüklenemedi');
        router.back();
      }
    }
  }, [params]);

  useEffect(() => {
    if (button) {
      executeCommand();
    }
  }, [button]);

  const executeCommand = async () => {
    if (!button) return;

    setExecuting(true);
    setStatus('connecting');
    setOutput('');
    setError('');

    try {
      setStatus('executing');
      
      const response = await axios.post(
        `${API_URL}/api/ssh/execute`,
        {
          button_id: button.id,
          ssh: button.ssh,
        },
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      if (response.data.success) {
        setStatus('success');
        setOutput(response.data.output || 'Komut başarıyla çalıştırıldı');
      } else {
        setStatus('error');
        setError(response.data.error || 'Komut çalıştırılamadı');
      }
    } catch (err: any) {
      console.error('Error executing command:', err);
      setStatus('error');
      setError(
        err.response?.data?.detail ||
        err.message ||
        'SSH komut çalıştırma hatası'
      );
    } finally {
      setExecuting(false);
    }
  };

  const handleRetry = () => {
    executeCommand();
  };

  const handleClose = () => {
    router.back();
  };

  if (!button) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: button.color }]}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name={button.icon as any} size={32} color="#fff" />
          <Text style={styles.headerTitle}>{button.title}</Text>
          {button.subtitle && (
            <Text style={styles.headerSubtitle}>{button.subtitle}</Text>
          )}
        </View>
      </View>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, getStatusStyle(status)]}>
          {executing && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
          <Ionicons name={getStatusIcon(status)} size={20} color="#fff" />
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>

      {/* Command Info */}
      <View style={styles.commandInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="server-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{button.ssh.host}:{button.ssh.port}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="terminal-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{button.ssh.command}</Text>
        </View>
      </View>

      {/* Output */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.outputContainer}
        contentContainerStyle={styles.outputContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {output && (
          <View style={styles.outputBox}>
            <Text style={styles.outputLabel}>Çıktı:</Text>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        )}
        {error && (
          <View style={[styles.outputBox, styles.errorBox]}>
            <Text style={styles.errorLabel}>Hata:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!output && !error && executing && (
          <View style={styles.executingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.executingText}>Komut çalıştırılıyor...</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {status === 'error' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleRetry}
            disabled={executing}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        )}
        {(status === 'success' || status === 'error') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={handleClose}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Tamam</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'connecting':
    case 'executing':
      return styles.statusConnecting;
    case 'success':
      return styles.statusSuccess;
    case 'error':
      return styles.statusError;
    default:
      return styles.statusIdle;
  }
}

function getStatusIcon(status: string): any {
  switch (status) {
    case 'connecting':
    case 'executing':
      return 'sync';
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    default:
      return 'ellipse';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'connecting':
      return 'Bağlanıyor...';
    case 'executing':
      return 'Çalıştırılıyor...';
    case 'success':
      return 'Başarılı';
    case 'error':
      return 'Hata';
    default:
      return 'Hazır';
  }
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
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIdle: {
    backgroundColor: '#999',
  },
  statusConnecting: {
    backgroundColor: '#FF9500',
  },
  statusSuccess: {
    backgroundColor: '#34C759',
  },
  statusError: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  commandInfo: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  outputContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  outputContent: {
    paddingBottom: 16,
  },
  outputBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffcccc',
  },
  outputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  errorLabel: {
    color: '#FF3B30',
  },
  outputText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  executingBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  executingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#FF9500',
  },
  closeButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
