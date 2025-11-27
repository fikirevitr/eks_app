#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8888
DIRECTORY = "/app/frontend/android/app/build/outputs/apk/release"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

os.chdir(DIRECTORY) if os.path.exists(DIRECTORY) else None

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"APK sunucusu çalışıyor: http://0.0.0.0:{PORT}")
    print(f"Dizin: {DIRECTORY}")
    httpd.serve_forever()
