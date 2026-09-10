import os
import sys
import time
import threading
import webbrowser
from pathlib import Path

# Set working directory to app script location
os.chdir(Path(__file__).parent.resolve())

from app import create_app

flask_app = create_app()

def start_flask():
    flask_app.run(host="127.0.0.1", port=5050, debug=False, use_reloader=False)

def main():
    print("=" * 65)
    print("  HOWE ROBINSON BUNKER PRICES TERMINAL - LOCAL DESKTOP APP")
    print("=" * 65)
    print("  Root Directory: C:\\Users\\deepak\\OneDrive\\onedrivebunker")
    print("  Local URL:      http://127.0.0.1:5050")
    print("=" * 65)

    # Start Flask server in background thread
    server_thread = threading.Thread(target=start_flask, daemon=True)
    server_thread.start()
    time.sleep(1.2)

    try:
        import webview
        print("Launching native Windows desktop application window...")
        webview.create_window(
            title="Howe Robinson Bunker Prices Terminal",
            url="http://127.0.0.1:5050",
            width=1440,
            height=900,
            resizable=True,
            min_size=(900, 600)
        )
        webview.start()
    except Exception as e:
        print(f"Opening in desktop web browser: {e}")
        webbrowser.open("http://127.0.0.1:5050")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down terminal app.")

if __name__ == "__main__":
    main()
