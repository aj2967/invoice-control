# Google Sheets to Google Drive PDF Exporter

This Chrome extension simplifies the process of exporting a Google Spreadsheet to a desired Google Drive folder in PDF format. With a one-time setup, users can quickly save their sheets as PDFs with dynamic filenames directly from the Google Sheets interface.

---

## Features
- **Generate and Export**: Automatically generate a Google Spreadsheet and export it as a PDF.
- **Dynamic Filenames**: Customize filenames with an invoice number dynamically pulled from the sheet.
- **Google Drive Integration**: Save the PDF directly to your specified Google Drive folder.
- **One-Click Export**: Adds a convenient "Export" button next to "Share" in Google Sheets.

---

## Setup Instructions

### Prerequisites
- A Google Cloud Project with OAuth 2.0 credentials configured.
- Chrome Browser with developer mode enabled (for sideloading the extension).

### Steps to Set Up the Extension
1. **Clone the Repository**:
   Clone this repository to your local machine:
   ```bash
   git clone <repository-url>
   ```

2. **Create and Configure `manifest.json`**:
   - Copy `manifest.example.json` and rename it to `manifest.json`.
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `manifest.json` with your OAuth Client ID from the Google Cloud Console.

3. **Set Up Google OAuth Credentials**:
   - Visit the [Google Cloud Developer Console](https://console.cloud.google.com/).
   - Create a new project and navigate to **APIs & Services > Credentials**.
   - Create a new OAuth 2.0 Client ID for a Chrome app.
   - Add your Google account email as a test user if the app is unpublished.
   - For sideloading during local development:
     - Generate a `.pem` file for the app to ensure the extension ID remains consistent.

4. **Load the Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions`.
   - Enable **Developer Mode**.
   - Click **Load unpacked** and select the directory containing the extension files.

---

## Initial Configuration
Once the extension is installed, follow these steps for initial setup:
1. Open the extension's settings popup.
2. Enter the following details:
   - **Google Drive Folder ID**: Found at the end of the folder's URL.
   - **Spreadsheet Name**: Desired name for the Google Spreadsheet.
   - **Invoice Number Cell**: Cell reference (e.g., `A1`) to dynamically fetch invoice numbers.
   - **File Name Prefix**: Text to prepend to filenames before the invoice number.
3. Save the configuration.

---

## Usage
1. Open any Google Spreadsheet.
2. Click the **Export** button located next to the "Share" button.
3. If this is the first time using the extension, sign in with your Google account to authorize the app.
4. The spreadsheet will be exported as a PDF and saved to the configured Google Drive folder.

---

## Notes
- Ensure you have access to the Google Drive folder you specify.
- If the authorization flow fails, verify that the client ID and extension ID are configured correctly in the Google Cloud Console.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.