// Native SSH Client - Tam Offline Çalışır
// @speedshield/react-native-ssh-sftp kullanılıyor (güncel fork)
// Cihaz ve EKS cihazı aynı local network'te olmalı

import SSHClient from '@speedshield/react-native-ssh-sftp';

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

// Aktif client referansı
let activeClient: any = null;

export async function executeSSHCommand(
  config: SSHConfig,
  command: string
): Promise<SSHResult> {
  try {
    // Önceki bağlantıyı temizle
    if (activeClient) {
      try {
        activeClient.disconnect();
      } catch (e) {
        // Ignore
      }
      activeClient = null;
    }

    console.log(`SSH Bağlanıyor: ${config.host}:${config.port}`);

    // Timeout promise
    const timeoutPromise = new Promise<SSHResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Bağlantı zaman aşımına uğradı (30 saniye)'));
      }, 30000);
    });

    // SSH bağlantı ve komut çalıştırma promise
    const sshPromise = (async (): Promise<SSHResult> => {
      try {
        // Bağlan
        const client = await SSHClient.connectWithPassword(
          config.host,
          config.port,
          config.username,
          config.password
        );

        activeClient = client;
        console.log('SSH Bağlantı başarılı, komut çalıştırılıyor...');

        // Komutu çalıştır
        const output = await client.execute(command);
        console.log('SSH Komut çıktısı:', output);

        // Bağlantıyı kapat
        try {
          client.disconnect();
        } catch (e) {
          // Ignore
        }
        activeClient = null;

        return {
          success: true,
          output: output || 'Komut başarıyla çalıştırıldı',
        };
      } catch (err: any) {
        // Bağlantıyı kapat
        if (activeClient) {
          try {
            activeClient.disconnect();
          } catch (e) {
            // Ignore
          }
          activeClient = null;
        }
        throw err;
      }
    })();

    // Race - hangisi önce biterse
    return await Promise.race([sshPromise, timeoutPromise]);

  } catch (err: any) {
    console.error('SSH Hata:', err);
    
    // Bağlantıyı temizle
    if (activeClient) {
      try {
        activeClient.disconnect();
      } catch (e) {
        // Ignore
      }
      activeClient = null;
    }

    return {
      success: false,
      error: getErrorMessage(err),
    };
  }
}

// Bağlantıyı manuel kapatma fonksiyonu
export function disconnectSSH(): void {
  if (activeClient) {
    try {
      activeClient.disconnect();
    } catch (e) {
      // Ignore
    }
    activeClient = null;
  }
}

function getErrorMessage(err: any): string {
  const message = err?.message || err?.toString() || '';
  
  // Zaman aşımı
  if (message.includes('timeout') || message.includes('Timeout') || message.includes('zaman aşımı')) {
    return 'Bağlantı zaman aşımına uğradı. EKS cihazı yanıt vermiyor.';
  }
  
  // Bağlantı reddedildi
  if (message.includes('refused') || message.includes('Connection refused') || message.includes('ECONNREFUSED')) {
    return 'Bağlantı reddedildi. SSH servisi çalışıyor mu kontrol edin.';
  }
  
  // Kimlik doğrulama hatası
  if (message.includes('authentication') || message.includes('Authentication') || 
      message.includes('password') || message.includes('Permission denied')) {
    return 'Kimlik doğrulama hatası. Kullanıcı adı veya şifre yanlış.';
  }
  
  // Host bulunamadı
  if (message.includes('host') || message.includes('Host') || 
      message.includes('resolve') || message.includes('ENOTFOUND')) {
    return 'Host bulunamadı. IP adresini kontrol edin.';
  }
  
  // Ağ hatası
  if (message.includes('network') || message.includes('Network') || 
      message.includes('unreachable') || message.includes('ENETUNREACH')) {
    return 'Ağ hatası. Aynı WiFi ağında olduğunuzdan emin olun.';
  }
  
  // Socket hatası
  if (message.includes('socket') || message.includes('Socket') || message.includes('ECONNRESET')) {
    return 'Bağlantı hatası. EKS cihazının açık olduğundan emin olun.';
  }

  // Port hatası
  if (message.includes('port') || message.includes('Port')) {
    return 'Port hatası. SSH portu (genellikle 22) açık mı kontrol edin.';
  }
  
  // Genel hata mesajı
  if (message && message.length > 0) {
    return message;
  }
  
  return 'SSH bağlantı hatası oluştu.';
}
