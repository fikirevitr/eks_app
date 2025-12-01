// SSH execution via backend API (WebSocket proxy)
// Native SSH modülü Expo managed workflow ile uyumsuz olduğu için
// backend üzerinden SSH proxy kullanılıyor

import axios from 'axios';
import Constants from 'expo-constants';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SSHResult {
  success: boolean;
  output?: string;
  error?: string;
}

// Backend URL'i al
const getBackendUrl = (): string => {
  // Önce extra config'den al
  const extraUrl = Constants.expoConfig?.extra?.EXPO_BACKEND_URL;
  if (extraUrl) {
    return extraUrl;
  }
  // Fallback
  return 'https://oniksbilgi.com.tr/api';
};

export async function executeSSHCommand(
  config: SSHConfig,
  command: string
): Promise<SSHResult> {
  try {
    const backendUrl = getBackendUrl();
    
    // Backend'e SSH isteği gönder
    const response = await axios.post(
      `${backendUrl}/ssh/execute`,
      {
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        command: command,
      },
      {
        timeout: 30000, // 30 saniye timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        output: response.data.output || 'Komut başarıyla çalıştırıldı',
      };
    } else {
      return {
        success: false,
        error: response.data?.error || 'Komut çalıştırılamadı',
      };
    }
  } catch (err: any) {
    console.error('SSH Error:', err);
    return {
      success: false,
      error: getErrorMessage(err),
    };
  }
}

function getErrorMessage(err: any): string {
  if (err.response) {
    // Server yanıt verdi ama hata döndü
    const data = err.response.data;
    if (data && data.error) {
      return data.error;
    }
    if (err.response.status === 404) {
      return 'SSH servisi bulunamadı. Backend yapılandırmasını kontrol edin.';
    }
    if (err.response.status === 500) {
      return 'Sunucu hatası. SSH bağlantısı kurulamadı.';
    }
  }
  
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Bağlantı zaman aşımına uğradı. Cihaz yanıt vermiyor.';
  }
  
  if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
    return 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
  }
  
  if (err.message) {
    if (err.message.includes('refused')) {
      return 'Bağlantı reddedildi. SSH servisi çalışıyor mu kontrol edin.';
    }
    if (err.message.includes('authentication')) {
      return 'Kimlik doğrulama hatası. Kullanıcı adı veya şifre yanlış.';
    }
    if (err.message.includes('host')) {
      return 'Host bulunamadı. IP adresini kontrol edin.';
    }
    return err.message;
  }
  
  return 'SSH bağlantı hatası oluştu.';
}
