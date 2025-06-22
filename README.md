BigCartel to ELTA Web Labeling

This application automates the process of creating shipping labels on the ELTA web portal using order data exported from BigCartel. It provides a graphical user interface (GUI) for entering product and customs information and uses Puppeteer to handle browser automation for label generation.
Technologies Used

    Node.js (backend logic)

    React (frontend UI)

    Electron (desktop application shell)

    Puppeteer (browser automation)

    csv-parser (CSV reading)

    dotenv (environment variables)

Prerequisites

    Node.js installed (version 16+ recommended)

    npm or yarn

Setup

    Clone the Repository
    git clone https://github.com/ikyrousis/bigcartel-to-elta-web-labeling
    cd bigcartel-to-elta-web-labeling

Install Dependencies

    npm install
    npm install puppeteer@23.3.1
    cd frontend && npm install

Edit the .env file in the root of the project directory and replace the corresponding sender information:

    EMAIL_ADDRESS=you@example.com
    SENDER_FIRST_NAME=YourFirstName
    SENDER_LAST_NAME=YourLastName
    SENDER_STREET_NAME=StreetName
    SENDER_STREET_NUMBER=123
    SENDER_STREET_SPECIFICATION=
    SENDER_POSTAL_CODE=10000
    SENDER_TOWN=Athens


Export your orders from BigCartel and save the CSV locally. You’ll select this file through the app interface.

Running the Application (Development)

To start the app in development mode:

    npm run start:react
    npm run start:electron

This will open the Electron window and start the React frontend with hot reloading.

Building a Production Executable
To compile the app into a standalone .exe or platform-specific binary:

    npm run build

Follow the output instructions to locate the generated files.
Usage

    Launch the app.

    Browse for your orders.csv file.

    Input weight and customs value for each unique product.

    Enter the core packaging weight.

    Define any number of customs description categories (e.g. "T-shirt", "Hat", etc).

    Assign each product to one of the categories.

    Click Run Label Generator.

    Log in to the ELTA portal when the browser opens, solve the CAPTCHA.

    The application will automatically fill in the form and generate the labels.