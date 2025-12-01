// Native SSH Client - Tam Offline Çalışır
// Development Build ile react-native-ssh-sftp kullanılıyor
// Cihaz ve Raspberry Pi aynı local network'te olmalı

import SSHClient from 'react-native-ssh-sftp';

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

// SSH client instance'ını tutmak için
let currentClient: any = null;

export async function executeSSHCommand(
  config: SSHConfig,
  command: string
): Promise<SSHResult> {
  return new Promise((resolve) => {
    try {
      // Önceki bağlantıyı kapat
      if (currentClient) {
        try {
          currentClient.disconnect();
        } catch (e) {
          // Ignore
        }
        currentClient = null;
      }

      console.log(`SSH Bağlanıyor: ${config.host}:${config.port}`);
      
      // Yeni SSH client oluştur ve bağlan
      currentClient = new SSHClient(
        config.host,
        config.port,
        config.username,
        config.password,
        (error: any) => {
          if (error) {
            console.error('SSH Bağlantı Hatası:', error);
            currentClient = null;
            resolve({
              success: false,
              error: getErrorMessage(error),
            });
            return;
          }

          console.log('SSH Bağlantı başarılı, komut çalıştırılıyor...');
          
          // Komut çalıştır
          currentClient.execute(command, (execError: any, output: string) => {
            // Bağlantıyı kapat
            try {
              currentClient.disconnect();
            } catch (e) {
              // Ignore
            }
            currentClient = null;

            if (execError) {
              console.error('SSH Komut Hatası:', execError);
              resolve({
                success: false,
                error: getErrorMessage(execError),
              });
              return;
            }

            console.log('SSH Komut çıktısı:', output);
            resolve({
              success: true,
              output: output || 'Komut başarıyla çalıştırıldı',
            });
          });
        }
      );

      // Timeout kontrolü (30 saniye)
      setTimeout(() => {
        if (currentClient) {
          try {
            currentClient.disconnect();
          } catch (e) {
            // Ignore
          }
          currentClient = null;
          resolve({
            success: false,
            error: 'Bağlantı zaman aşımına uğradı (30 saniye)',
          });
        }
      }, 30000);

    } catch (err: any) {
      console.error('SSH Genel Hata:', err);
      if (currentClient) {
        try {
          currentClient.disconnect();
        } catch (e) {
          // Ignore
        }
        currentClient = null;
      }
      resolve({
        success: false,
        error: getErrorMessage(err),
      });
    }
  });
}

// Bağlantıyı manuel kapatma fonksiyonu
export function disconnectSSH(): void {
  if (currentClient) {
    try {
      currentClient.disconnect();
    } catch (e) {
      // Ignore
    }
    currentClient = null;
  }
}

function getErrorMessage(err: any): string {
  const message = err?.message || err?.toString() || '';
  
  if (message.includes('timeout') || message.includes('Timeout')) {
    return 'Bağlantı zaman aşımına uğradı. Cihaz yanıt vermiyor.';
  }
  if (message.includes('refused') || message.includes('Connection refused')) {
    return 'Bağlantı reddedildi. SSH servisi çalışıyor mu kontrol edin.';
  }
  if (message.includes('authentication') || message.includes('Authentication') || message.includes('password')) {
    return 'Kimlik doğrulama hatası. Kullanıcı adı veya şifre yanlış.';
  }
  if (message.includes('host') || message.includes('Host') || message.includes('resolve')) {
    return 'Host bulunamadı. IP adresini kontrol edin.';
  }
  if (message.includes('network') || message.includes('Network') || message.includes('unreachable')) {
    return 'Ağ hatası. Aynı WiFi ağında olduğunuzdan emin olun.';
  }
  if (message.includes('socket') || message.includes('Socket')) {
    return 'Bağlantı hatası. Raspberry Pi\'nin açık olduğundan emin olun.';
  }
  
  if (message) {
    return message;
  }
  
  return 'SSH bağlantı hatası oluştu.';
}
