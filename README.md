# Howe Robinson Bunker Prices Terminal

Live Howe Robinson Bunker Fuel Prices Terminal providing interactive tracking for VLSFO, HSFO, and MGO rates across major global ports.

## Features
- **Live Interactive Charts**: TradingView-style price visualizations for VLSFO, HSFO, MGO with single & multi-fuel toggle options.
- **Dynamic Time & Date Axis**: Automatically displays 24-hour time format for current day data and seamlessly switches to date format when scrolling back through historical rates.
- **Daily Rate Analysis**: Real-time tracking of Today's Active Rate, Yesterday's Close Rate, Daily Rate Change, Week-on-Week High/Low, and 3-Month High/Low.
- **OneDrive & Local Excel Integration**: Seamlessly link live Excel price sheets directly from OneDrive or local storage.
- **Regional Market Breakdown**: Detailed tables for ARA, Northwest Europe, Mediterranean, Americas, Middle East/Red Sea, and Asia/Pacific.
- **Bunker Intelligence News**: Curated live news feed covering global maritime fuel markets, IMO regulations, and price trends.
- **Export & Reporting**: Instant PDF export and Excel data extraction with customizable regional/fuel filters.

## Excel Linking

The terminal supports two read-only Excel connection modes:

- Local folder: Flask lists `.xlsx` files under `LOCAL_WORKBOOK_ROOT`, reads the selected workbook with `openpyxl`, and refreshes saved changes from disk.
- OneDrive cloud: Microsoft OAuth sign-in uses MSAL, then the Flask backend browses OneDrive with Microsoft Graph and downloads the selected `.xlsx` file server-side.

The browser never stores Microsoft tokens. Tokens and selected file IDs are kept in the server-side Flask session. A restart or redeploy may require reconnection.

The app reads saved workbook values only. Excel must save the file first. For Reuters/RDP formulas, this app does not refresh the feed or recalculate formulas; it displays the saved cached results in the workbook.

## Local Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Open `http://localhost:5050`.

For local-folder linking, set:

```env
LOCAL_WORKBOOK_ROOT=C:\Users\deepak\OneDrive\onedrivebunker
```

## Microsoft OneDrive Setup

Create one Microsoft Entra app registration:

1. Go to Microsoft Entra admin center, then App registrations.
2. Create an app with supported account types set to personal Microsoft accounts and work/school accounts if you need both.
3. Add a web redirect URI for local development:

```text
http://localhost:5050/auth/callback
```

4. Add a second web redirect URI for Render after deployment:

```text
https://your-render-service.onrender.com/auth/callback
```

5. Add delegated Microsoft Graph permissions:

```text
User.Read
Files.Read
offline_access
```

6. Create a client secret and copy the secret value, not the secret ID.
7. Set these environment variables locally and on Render:

```env
MS_CLIENT_ID=your-application-client-id
MS_CLIENT_SECRET=your-client-secret-value
MS_AUTHORITY=https://login.microsoftonline.com/common
MS_REDIRECT_URI=http://localhost:5050/auth/callback
```

On Render, set `MS_REDIRECT_URI` to the Render callback URL.

## Deployment

Render web service settings:

```text
Build command: pip install -r requirements.txt
Start command: gunicorn app:app
Health check: /health
```

Do not commit `.env`, credentials, or workbooks.
