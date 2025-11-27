#!/bin/bash

echo "🔨 APK Build Takip Başlatıldı..."
echo "================================"
echo ""

while true; do
    clear
    echo "📱 Oniks EKS APP - APK Build Status"
    echo "===================================="
    echo ""
    echo "⏰ Zaman: $(date '+%H:%M:%S')"
    echo ""
    
    # Check if APK exists
    if [ -f "/app/frontend/android/app/build/outputs/apk/release/app-release.apk" ]; then
        APK_SIZE=$(du -h /app/frontend/android/app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "✅ BUILD TAMAMLANDI!"
        echo ""
        echo "📦 APK Bilgileri:"
        echo "   Dosya: app-release.apk"
        echo "   Boyut: $APK_SIZE"
        echo "   Konum: /app/frontend/android/app/build/outputs/apk/release/"
        echo ""
        echo "🌐 İndirme Linki:"
        echo "   https://pi-control.preview.emergentagent.com:8888/app-release.apk"
        echo ""
        echo "📥 APK'yı indirmek için yukarıdaki linki tarayıcınızda açın"
        break
    fi
    
    # Show last 15 lines of build log
    echo "📋 Son Build Logları:"
    echo "--------------------"
    if [ -f "/tmp/gradle_build.log" ]; then
        tail -15 /tmp/gradle_build.log | sed 's/\x1b\[[0-9;]*m//g'
        
        # Check for BUILD SUCCESSFUL
        if grep -q "BUILD SUCCESSFUL" /tmp/gradle_build.log; then
            echo ""
            echo "✅ BUILD BAŞARILI! APK oluşturuluyor..."
        fi
        
        # Check for BUILD FAILED
        if grep -q "BUILD FAILED" /tmp/gradle_build.log; then
            echo ""
            echo "❌ BUILD BAŞARISIZ! Logları kontrol edin:"
            echo "   tail -100 /tmp/gradle_build.log"
            break
        fi
    else
        echo "⏳ Build henüz başlamadı veya log dosyası bulunamadı..."
    fi
    
    echo ""
    echo "⏱️  30 saniye sonra tekrar kontrol edilecek..."
    echo "   (Ctrl+C ile çıkış)"
    sleep 30
done
