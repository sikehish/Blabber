# Blabber - AI-Powered Meeting Management and Reporting

> Built at ScrollHacks 2024

Blabber is an AI-powered Chrome extension designed to streamline meeting management and documentation. It simplifies the process of capturing, organizing, and sharing meeting data with key stakeholders. Blabber ensures that no critical information is missed during meetings, offering seamless solutions for transcription, report generation, and sharing.

<div style="display: flex; align-items: center;">
    <img src="https://github.com/user-attachments/assets/ee0abb74-9fb7-4855-8030-06d2ba2dcdae" alt="Blabber Icon" width="250" />
    <img src="https://i.imgur.com/pgOwCjJ.png" alt="Second Image" width="100" style="margin-left: 10px;" />
</div>


---
 
## Key Features

- **Real-Time Transcription**: Blabber uses advanced speech-to-text APIs for accurate, real-time transcription, capturing every aspect of your meetings.
- **Comprehensive Report Generation**: Create customizable reports in PDF and DOCX formats with options such as:
  - 📊 **Speaker-Based Reports**: Focus on individual speakers and their contributions.
  - ⏱ **Interval-Based Reports**: Review discussions broken down by time intervals.
  - 💬 **Sentiment-Based Reports**: Get insights into the emotional tone of the meeting.
  - 🗒 **General Reports**: A holistic overview of all meeting details.
- **Email Integration**: Automatically email generated reports to all attendees, ensuring everyone stays informed.
- **Screenshot Capture**: Capture important moments in meetings using a simple keyboard shortcut. Screenshots are linked to transcripts and can be annotated for better clarity.
- **Sentiment Analysis**: Using Natural Language Processing (NLP), Blabber provides insights into the emotional tone of the conversation, helping teams understand the mood of discussions.

---

## What is the core concept or problem this project aims to solve?

Meetings often result in miscommunication, missed details, and inefficient post-meeting workflows. Here are the key problems that Blabber addresses:

- **Time-consuming manual transcription**: Writing meeting recaps, reports, and transcripts manually is time-intensive and prone to errors.
  
- **Missed critical points**: Important details are often overlooked or forgotten, especially in long or fast-paced meetings.

- **Lack of real-time insights**: Manually tracking speaker contributions, emotional tone, and key discussion points is challenging and inefficient.

- **Difficulty in large meetings**: Generating comprehensive recaps and transcripts for larger meetings, involving many attendees and speakers, can be overwhelming and prone to omissions.

Blabber solves these issues by automating transcription, report generation, and providing tools like sentiment analysis and screenshot capture to ensure that no critical information is missed and that meetings are documented efficiently and accurately.

---

## Demo Video

Check out the demo video to see Blabber in action: [Watch Demo Video](https://www.youtube.com/watch?v=S3DEO8QrMMM)

---

# Blabber Chrome Extension - Local Setup Guide

## Project Directory Structure

- AI-backend/ – Python Flask-based backend for AI-related tasks.
- blabber-frontend/ – React-based frontend for Blabber.
- google-meet-chrome-extension/ – Chrome extension for Google Meet integration.
- node_backend/ – Node.js Express backend.
- .gitignore – Files to ignore in version control.
- blabber architecture.png – Architecture diagram for Blabber.
- README.md – Setup guide and project documentation.


## 1. AI-backend (Python - Flask)

The AI-backend is responsible for handling AI-related tasks (e.g., generating reports, meeting summaries).

### Steps to set up the AI backend:

1. *Navigate to the AI-backend directory*:
     ```bash
     cd AI-backend
   

2. *Create a virtual environment*:
   - It's recommended to set up a virtual environment to isolate your Python packages:
     ```bash
     python3 -m venv venv
     

3. *Activate the virtual environment*:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
   
   - On Windows:
     ```bash
     .\venv\Scripts\activate
   

4. *Install dependencies*:
   - Once the virtual environment is activated, install the required dependencies:
     ```bash
     pip install -r requirements.txt
   

5. *Run the Flask server*:
     ```bash
     python3 app.py
   
  The Flask server will now be running locally at http://localhost:8000 (or another port if configured).


## 2. node_backend (Node.js - Express)

This is the Node.js backend that handles API requests and integrates with other services like the AI backend and the Chrome extension.

### Steps to set up the Node backend:

1. *Navigate to the node_backend directory*:
     ```bash
     cd node_backend
   

2. *Install dependencies*:
     ```bash
     npm install
   

3. *Set up environment variables*:
   - Inside the node_backend directory, you will find a file named .env.template.
   - This file contains the structure and required environment variables for the project.
   - *Create a new .env file* by copying the *.env.template*:
       ```bash
       cp .env.template .env
     
   - Open the .env file and fill in the appropriate values for each environment variable.

   *Example of .env.template file*:
     ```bash
     PORT=3000
     MONGO_URI=your_mongodb_uri
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     JWT_KEY=your_jwt_secret
     CLIENT_URL=http://localhost:5173
     AI_SERVER_URL=http://localhost:8000
     EMAIL_USER=your_email_username
     EMAIL_PASS=your_email_password


4. *Run the Node.js server*:
     ```bash
     npm run start
   
  The backend server will now be running locally at http://localhost:3000 (or another port if configured).


## 3. blabber-frontend (React - Vite)

This is the frontend for the Blabber application, built using React and Vite for fast development.

### Steps to set up the frontend:

1. *Navigate to the blabber-frontend directory*:
     ```bash
     cd blabber-frontend
   

2. *Install dependencies*:
     ```bash
     npm install
   

3. *Run the development server*:
     ```bash
     npm run dev
   
  The frontend will now be available locally at http://localhost:5173.


## 4. google-meet-chrome-extension

This directory contains the Chrome extension that integrates Blabber with Google Meet.

### Steps to load the extension in Chrome:

1. *Open Chrome and navigate to chrome://extensions/*.

2. *Enable "Developer Mode" by toggling the switch in the upper right corner*.

3. *Click on "Load unpacked" and select the google-meet-chrome-extension directory from your local machine*.

4. *The extension will be loaded locally and will be visible in Chrome’s toolbar for testing and development purposes*.

5. *If any changes are made to the extension code, reload it by clicking the reload icon next to the extension in the chrome://extensions/ page*.

**For more detailed instructions on loading unpacked extensions, you can refer to [this blog post](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/).**


### Additional Notes:

- Database Setup (MongoDB): 
   - You will need a MongoDB database for storing user information, meeting details, etc.
   - Make sure to add your MongoDB URI in the .env file of the Node backend as MONGO_URI.

- AI Integration:
   - The AI-backend and node_backend should both be running simultaneously for full integration (AI tasks like generating reports are handled in the Python backend, while the Node.js backend manages API requests).

- Google OAuth Configuration:
   - Ensure you have Google OAuth credentials set up (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the .env file of the Node backend).

---

# Screenshots



---

## Overview of the Team

### 1. Syed Hisham Akmal – Team Leader & Web Developer Extraordinaire

- Hisham leads the team with a strong background in web development and a proven track record, having won three national-level hackathons. He combines technical skills with leadership to guide the team in creating robust and scalable software solutions.

### 2. Prateek Rajput – AI & Backend Architect

- Prateek specializes in AI and backend development, with experience in multiple AI projects. His focus is on building AI-driven solutions that improve efficiency and solve real-world problems, bringing valuable technical depth to the team.

### 3. K Ramachandra Shenoy – Generative AI & Machine Learning Prodigy

- Ramachandra brings expertise in Generative AI and Machine Learning, helping the team push forward with innovative AI technologies. His work focuses on applying these technologies to practical, impactful solutions.

### 4. Sayed Afnan Khazi – Web Developer & Social Impact Innovator

- Afnan is a web developer and two-time national hackathon winner. His passion for technology and social impact drives his work, where he strives to build platforms that create positive change while ensuring a high-quality user experience.
