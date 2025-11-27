package com.oniksbilgi.eksapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Properties;

public class SSHModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "SSHModule";

    public SSHModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void executeCommand(
        String host, 
        int port, 
        String username, 
        String password, 
        String command,
        Promise promise
    ) {
        Session session = null;
        Channel channel = null;
        
        try {
            // JSch instance oluştur
            JSch jsch = new JSch();
            
            // Session oluştur
            session = jsch.getSession(username, host, port);
            session.setPassword(password);
            
            // Host key checking'i devre dışı bırak (güvenlik için production'da değiştirilebilir)
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            
            // Timeout ayarla
            session.setTimeout(30000); // 30 saniye
            
            // Bağlan
            session.connect();
            
            // Exec channel aç
            channel = session.openChannel("exec");
            ((ChannelExec) channel).setCommand(command);
            
            // Output stream ayarla
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ByteArrayOutputStream errorStream = new ByteArrayOutputStream();
            
            channel.setOutputStream(outputStream);
            ((ChannelExec) channel).setErrStream(errorStream);
            
            // Channel'ı aç
            InputStream in = channel.getInputStream();
            channel.connect();
            
            // Komutu çalıştır ve bekle
            byte[] tmp = new byte[1024];
            while (true) {
                while (in.available() > 0) {
                    int i = in.read(tmp, 0, 1024);
                    if (i < 0) break;
                    outputStream.write(tmp, 0, i);
                }
                
                if (channel.isClosed()) {
                    if (in.available() > 0) continue;
                    break;
                }
                
                try {
                    Thread.sleep(100);
                } catch (Exception ee) {
                }
            }
            
            // Sonuçları al
            String output = outputStream.toString("UTF-8");
            String error = errorStream.toString("UTF-8");
            int exitStatus = channel.getExitStatus();
            
            // Bağlantıyı kapat
            channel.disconnect();
            session.disconnect();
            
            // Başarılı sonuç döndür
            if (exitStatus == 0) {
                promise.resolve(output.isEmpty() ? "Komut başarıyla çalıştırıldı" : output);
            } else {
                promise.reject("SSH_ERROR", error.isEmpty() ? "Komut başarısız oldu" : error);
            }
            
        } catch (Exception e) {
            // Hata mesajını kullanıcı dostu yap
            String errorMessage = getErrorMessage(e);
            promise.reject("SSH_ERROR", errorMessage);
            
            // Bağlantıları temizle
            try {
                if (channel != null && channel.isConnected()) {
                    channel.disconnect();
                }
                if (session != null && session.isConnected()) {
                    session.disconnect();
                }
            } catch (Exception cleanupError) {
                // Temizleme hatalarını yoksay
            }
        }
    }
    
    private String getErrorMessage(Exception e) {
        String message = e.getMessage();
        
        if (message == null) {
            return "SSH bağlantı hatası oluştu";
        }
        
        if (message.contains("timeout")) {
            return "Bağlantı zaman aşımına uğradı. Cihaz yanıt vermiyor.";
        } else if (message.contains("refused")) {
            return "Bağlantı reddedildi. SSH servisi çalışıyor mu kontrol edin.";
        } else if (message.contains("Auth")) {
            return "Kimlik doğrulama hatası. Kullanıcı adı veya şifre yanlış.";
        } else if (message.contains("UnknownHost")) {
            return "Host bulunamadı. IP adresini kontrol edin.";
        } else {
            return message;
        }
    }
}
