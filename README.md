# BigCartel to ELTA Web Labeling

This application automates the process of creating shipping labels on the ELTA web portal using order data exported from BigCartel. It provides a graphical user interface (GUI) for entering product and customs information and uses Puppeteer to handle browser automation for label generation.

## Technologies Used
- Node.js (backend logic)
- React (frontend UI)
- Electron (desktop application shell)
- Puppeteer (browser automation)
- csv-parser (CSV reading)
- dotenv (environment variables)

## Prerequisites
- Node.js installed (version 20+ recommended)
- npm or yarn

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ikyrousis/bigcartel-to-elta-web-labeling
cd bigcartel-to-elta-web-labeling
```

### 2. Install Dependencies
```bash
npm install
npm install puppeteer@23.3.1
cd frontend && npm install
```

### 3. Environment Configuration
Edit the `.env` file in the root of the project directory and replace the corresponding sender information:

```env
EMAIL_ADDRESS=you@example.com
SENDER_FIRST_NAME=YourFirstName
SENDER_LAST_NAME=YourLastName
SENDER_STREET_NAME=StreetName
SENDER_STREET_NUMBER=123
SENDER_STREET_SPECIFICATION=
SENDER_POSTAL_CODE=10000
SENDER_TOWN=Athens
```

### 4. Prepare Your Data
Export your orders from BigCartel and save the CSV locally. You'll select this file through the app interface.

## Running the Application

### Development Mode
To start the app in development mode:
```bash
npm run dev
```

This will open the Electron window and start the React frontend with hot reloading.

### Production Build
To compile the app into a standalone executable:
```bash
npm run build
```

Follow the output instructions to locate the generated files in the `dist` folder.

## Usage

1. **Launch the app**
2. **Browse for your orders.csv file**
3. **Input weight and customs value** for each unique product
4. **Enter the core packaging weight**
5. **Define customs description categories**
6. **Assign each product to a category**
7. **Click "Run Label Generator"**
8. **Log in to the ELTA portal** when the browser opens, solve the CAPTCHA
9. **The application will automatically fill in the form and generate the labels**

## Where Labels Are Saved

### Development Mode
- Labels are saved to the project root directory

### Production Mode
- Labels are saved to your system's Downloads folder in a dedicated subfolder:
  - **Windows**: `C:\Users\[username]\Downloads\Elta Shipping Labels\`
  - **macOS**: `~/Downloads/Elta Shipping Labels/`
  - **Linux**: `~/Downloads/Elta Shipping Labels/`

## Build Targets
The application supports building for multiple platforms:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` package
- **Linux**: `.AppImage` executable

### Puppeteer Version
Ensure you're using Puppeteer version 23.3.1:
```bash
npm install puppeteer@23.3.1
```

### Environment Variables
Make sure your `.env` file is properly configured with all required sender information.

### File Permissions
In production mode, the app automatically creates the necessary download directory with appropriate permissions.

## Development Scripts
- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build production executable
- `npm run build:win` - Build for Windows only
- `npm run build:mac` - Build for macOS only
- `npm run build:linux` - Build for Linux only
