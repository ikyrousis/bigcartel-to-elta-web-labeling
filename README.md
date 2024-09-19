This Node.js application automates the process of creating shipping labels on the ELTA web portal using order data from BigCartel. The app reads order information from a CSV file, prompts the user for necessary details and generates labels using Puppeteer for browser automation.
Prerequisites

    Node.js: Ensure Node.js is installed on your machine.
    Puppeteer: The app uses Puppeteer for browser automation.
    .env File: You need to create a .env file with sender details.

Setup
1. Clone the Repository

bash

git clone <https://github.com/kyrousisi/bigcartel-to-elta-web-labeling>
cd <bigcartel-to-elta-web-labeling>

2. Install Dependencies

bash

npm install

3. Edit .env File

Edit the .env file in the root of the project directory and replace the corresponding sender information:

EMAIL_ADDRESS=sender@mail.com
SENDER_FIRST_NAME=SENDERNAME
SENDER_LAST_NAME=SENDERLASTNAME
SENDER_STREET_NAME=SENDERSTREET
SENDER_STREET_NUMBER=1
SENDER_POSTAL_CODE=1
SENDER_TOWN=SENDERTOWN

Replace the placeholders with your actual details.
4. Prepare the Orders CSV

The app requires an orders.csv file in the project root directory. Ensure the file contains an order export from BigCartel.

Running the Application
1. Start the App

Run the application using Node.js:

bash

node app.js

2. Follow Prompts

    Enter product details such as weight and customs value.
    Provide packaging weight and a universal product description.
    Log into ELTA’s web portal and solve the CAPTCHA manually when prompted.

The application will then process the orders and generate shipping labels automatically.