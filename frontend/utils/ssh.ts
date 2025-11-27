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

export async function executeSSHCommand(
  config: SSHConfig,
  command: string
): Promise<SSHResult> {
  try {
    // Connect to SSH
    await SSHClient.connectWithPassword(
      config.host,
      config.port,
      config.username,
      config.password
    );

    // Execute command
    const output = await SSHClient.execute(command);

    // Disconnect
    await SSHClient.disconnect();

    return {
      success: true,
      output: output || 'Komut başarıyla çalıştırıldı',
    };
  } catch (err: any) {
    console.error('SSH Error:', err);
    
    // Disconnect on error
    try {
      await SSHClient.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    return {
      success: false,
      error: getErrorMessage(err),
    };
  }
}

function getErrorMessage(err: any): string {
  if (err.message) {
    if (err.message.includes('timeout')) {
      return 'Bağlantı zaman aşımına uğradı. Cihaz yanıt vermiyor.';
    }
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
