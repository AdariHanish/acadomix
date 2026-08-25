require('dotenv').config();
const mysql = require('mysql2/promise');

const host = 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com';
const port = 4000;
const user = '2r32GhnXE46aPEJ.root';
const password = 'c6JJgBGmkI6pYkWR';
const database = 'test';

const projects = [
    // ---- AI & Machine Learning (aiml) ----
    ["Fake News Detection System", "An AI model that detects fake news from social media and news articles using NLP.", "aiml", "major", 12000, 8000, 5000, "NLP, Classification, Django Backend", 1, 1],
    ["Real-time Drowsiness Detection", "Computer vision project that alerts drivers when they are falling asleep.", "aiml", "major", 15000, 10000, 6000, "OpenCV, CNN, Real-time Alert", 1, 1],
    ["Crop Disease Prediction", "Deep learning model to predict crop diseases from leaf images.", "aiml", "major", 14000, 9000, 5500, "CNN, ResNet, Image Processing", 0, 1],
    ["Sign Language Translator", "AI system that translates hand gestures into text and speech.", "aiml", "major", 18000, 12000, 7500, "TensorFlow, OpenCV, Mediapipe", 1, 0],
    ["Stock Market Predictor", "Predicts future stock prices using LSTM and historical financial data.", "aiml", "major", 15000, 10000, 6500, "LSTM, Time-Series Analysis, Keras", 1, 1],
    ["Chatbot for Mental Health", "An empathic AI chatbot designed to help users with stress and anxiety.", "aiml", "mini", 8000, 5000, 3000, "NLP, Transformers, Flask API", 0, 0],
    ["Handwritten Digit Recognition", "Classic ML project recognizing handwritten digits from the MNIST dataset.", "aiml", "mini", 5000, 3000, 1500, "CNN, MNIST, Beginner Friendly", 0, 0],
    ["Spam Email Classifier", "Classifies emails as spam or ham using Naive Bayes.", "aiml", "mini", 5000, 3000, 1500, "Naive Bayes, Text Mining, Scikit-learn", 0, 0],
    ["Customer Churn Prediction", "Predicts if a customer will leave a subscription service based on usage data.", "aiml", "mini", 7000, 4500, 2500, "Random Forest, XGBoost, Pandas", 0, 0],
    ["Movie Recommendation System", "Suggests movies to users based on collaborative filtering.", "aiml", "mini", 8000, 5000, 3000, "Collaborative Filtering, Cosine Similarity", 1, 0],
    ["Resume Screening Parser", "AI tool that extracts information from resumes and ranks candidates.", "aiml", "major", 16000, 11000, 7000, "NLP, Spacy, PDF Extraction", 1, 1],
    ["Traffic Sign Recognition", "Identifies traffic signs from images for autonomous driving simulation.", "aiml", "major", 14000, 9500, 6000, "CNN, GTSRB Dataset, Computer Vision", 0, 0],
    ["Sentiment Analysis on Twitter", "Analyzes live tweets to gauge public sentiment on specific topics.", "aiml", "mini", 7500, 4500, 2500, "Twitter API, VADER, NLTK", 0, 0],
    ["Voice Assistant for Visually Impaired", "A voice-controlled virtual assistant to help visually impaired individuals navigate PC tasks.", "aiml", "major", 17000, 12000, 8000, "Speech Recognition, TTS, Automation", 1, 1],
    ["Fraud Detection in Credit Cards", "Detects anomalous transactions in real-time.", "aiml", "major", 16000, 10500, 6500, "Anomaly Detection, Imbalanced Data, SMOTE", 1, 0],
    ["Music Genre Classification", "Classifies audio files into genres using spectrograms.", "aiml", "mini", 9000, 6000, 3500, "Librosa, Audio Processing, Deep Learning", 0, 0],
    ["Brain Tumor Detection", "Detects brain tumors from MRI scans using U-Net architectures.", "aiml", "major", 18000, 13000, 8500, "Medical Imaging, U-Net, PyTorch", 1, 1],
    ["Image Caption Generator", "Generates descriptive captions for uploaded images automatically.", "aiml", "major", 17500, 12500, 8000, "CNN+RNN, BLEU Score, NLP", 1, 0],
    ["Real-Estate Price Predictor", "Estimates house prices based on location and features.", "aiml", "mini", 6000, 4000, 2000, "Linear Regression, Full Stack, Scikit-learn", 0, 0],
    ["Pneumonia Detection from X-Rays", "Classifies chest X-Rays to identify signs of Pneumonia.", "aiml", "major", 16000, 11000, 7500, "Transfer Learning, VGG16, Flask", 0, 1],
    ["AI-Powered Virtual Mouse", "Control the mouse cursor using hand gestures via webcam.", "aiml", "major", 14000, 9000, 6000, "Mediapipe, OpenCV, PyAutoGUI", 1, 1],
    ["Plagiarism Checker", "Compares documents to find similarities and detect plagiarism.", "aiml", "mini", 8000, 5000, 3000, "Cosine Similarity, TF-IDF, NLP", 0, 0],
    ["Human Pose Estimation", "Detects human joints and poses in real-time video streams.", "aiml", "major", 15500, 10500, 7000, "PoseNet, Real-time Analytics", 0, 0],
    ["Automated Attendance System", "Uses facial recognition to mark attendance in a classroom.", "aiml", "major", 14500, 9500, 6500, "FaceNet, SQLite, PyQt", 1, 1],

    // ---- Web Development (website) ----
    ["E-Commerce Storefront", "Full-stack eCommerce website with cart, payment gateway, and admin panel.", "website", "major", 18000, 12000, 8000, "React, Node.js, Stripe, MongoDB", 1, 1],
    ["Hospital Management System", "Comprehensive portal for booking appointments and managing patient records.", "website", "major", 16000, 11000, 7500, "MERN Stack, Dashboard, Authentication", 1, 0],
    ["Online Voting System", "Secure digital voting platform with biometric/OTP verification.", "website", "major", 15000, 10000, 6500, "PHP, MySQL, Secure OTP", 0, 1],
    ["Library Management System", "Manages book inventories, issues, and student records.", "website", "mini", 8000, 5000, 3000, "Django, SQLite, Bootstrap", 0, 0],
    ["Portfolio Website Generator", "A platform where users can input their details and get a live portfolio.", "website", "mini", 9000, 6000, 3500, "React, Tailwind, Dynamic Routing", 1, 0],
    ["Food Delivery App Web Panel", "Restaurant ordering system with live status tracking.", "website", "major", 17000, 11500, 7500, "Next.js, Firebase, Real-time DB", 1, 1],
    ["Alumni Tracking System", "Connects college alumni and students for networking.", "website", "major", 14000, 9000, 6000, "Laravel, MySQL, Social Feed", 0, 0],
    ["Online Examination Portal", "Platform to conduct multiple-choice exams with auto-grading.", "website", "major", 15000, 10500, 6500, "Spring Boot, Angular, Timer Logic", 1, 0],
    ["Blood Bank Management", "Helps users find donors and blood banks near them.", "website", "mini", 7500, 4500, 2500, "PHP, Maps API, Notification", 0, 0],
    ["Real-time Chat Application", "WhatsApp-like chat app with groups and private messaging.", "website", "major", 16000, 11000, 7000, "Socket.io, React, Express", 1, 1],
    ["Job Portal System", "Platform for employers to post jobs and job seekers to apply.", "website", "major", 17500, 12000, 8000, "MERN, Resume Upload, Search", 1, 0],
    ["Task Management Dashboard", "Trello-like Kanban board for organizing personal tasks.", "website", "mini", 8500, 5500, 3500, "React, Drag-and-Drop, LocalStorage", 0, 0],
    ["Travel Blog Website", "A dynamic blog for travelers to share stories and photos.", "website", "mini", 7000, 4500, 2500, "WordPress/Custom CMS, SEO friendly", 0, 0],
    ["Fitness Tracking Portal", "Logs workouts and visualizes progress through charts.", "website", "mini", 8000, 5000, 3000, "Vue.js, Chart.js, Node.js", 0, 0],
    ["Online Auction System", "Live bidding platform for various products with timer constraints.", "website", "major", 16500, 11000, 7500, "WebSockets, Secure Bidding", 0, 1],
    ["Student Information System", "Centralized portal for managing grades, attendance, and fees.", "website", "major", 15500, 10000, 6500, "Django, PostgreSQL, Report Generation", 0, 0],
    ["Cryptocurrency Tracker", "Displays real-time crypto prices, charts, and news.", "website", "mini", 8000, 5000, 3000, "React, CoinGecko API, Recharts", 1, 0],
    ["Event Management System", "Helps organize, ticket, and manage physical or virtual events.", "website", "major", 15000, 10000, 6500, "Next.js, Payment Integration", 0, 0],
    ["Crowdfunding Platform", "Kickstarter clone where users can fund projects.", "website", "major", 18000, 12500, 8500, "MERN, Stripe Connect, Campaigns", 1, 1],
    ["Vehicle Rental System", "Allows users to book cars/bikes with date pickers and inventory.", "website", "major", 16000, 11000, 7000, "React, Node, Calendar Sync", 0, 0],
    ["Recipe Sharing Platform", "Users can post, rate, and save recipes with ingredients list.", "website", "mini", 7500, 4500, 2500, "Firebase, React, Auth", 0, 0],
    ["Hotel Booking System", "Room reservation system with availability checking.", "website", "major", 16500, 11500, 7500, "PHP/Laravel, Payment Gateway", 1, 0],
    ["Issue Tracking System", "Jira clone for reporting and tracking software bugs.", "website", "major", 17000, 11500, 7500, "React, Node, Role Management", 0, 1],
    ["Weather Forecast App", "Provides 7-day weather forecasting using OpenWeather API.", "website", "mini", 5000, 3000, 1500, "Vanilla JS, API Fetching, CSS Animations", 0, 0],

    // ---- Data Science (datascience) ----
    ["Exploratory Data Analysis on COVID-19", "Comprehensive EDA and visualization of the pandemic's impact.", "datascience", "mini", 7000, 4500, 2500, "Pandas, Seaborn, Matplotlib", 0, 0],
    ["Credit Risk Scoring", "Model that evaluates the probability of a borrower defaulting.", "datascience", "major", 15000, 10000, 6500, "Logistic Regression, Risk Analysis", 1, 1],
    ["Customer Segmentation", "Uses K-Means clustering to group supermarket customers.", "datascience", "mini", 8000, 5000, 3000, "K-Means, Unsupervised Learning", 0, 0],
    ["Sales Forecasting", "Predicts future sales for retail stores based on historical data.", "datascience", "major", 14500, 9500, 6000, "Prophet, ARIMA, Time-Series", 1, 0],
    ["Market Basket Analysis", "Finds associations between products frequently bought together.", "datascience", "mini", 8500, 5500, 3500, "Apriori Algorithm, Association Rules", 0, 0],
    ["E-commerce Product Recommendation", "Suggests products using collaborative and content-based filtering.", "datascience", "major", 16000, 11000, 7000, "Recommendation Engine, Big Data", 1, 1],
    ["Air Quality Index Predictor", "Predicts AQI levels based on meteorological variables.", "datascience", "mini", 7500, 4500, 2500, "Regression, Random Forest", 0, 0],
    ["Twitter Sentiment Analysis Dashboard", "Interactive dashboard visualizing live tweet sentiments.", "datascience", "major", 15500, 10500, 6500, "Dash/Streamlit, NLP, Real-time", 1, 0],
    ["Uber Trip Data Analysis", "Analyzes peak hours and profitable routes for ride-sharing.", "datascience", "mini", 8000, 5000, 3000, "Geospatial Analysis, Data Cleaning", 0, 0],
    ["Breast Cancer Diagnostic Analysis", "Statistical analysis to classify tumors as benign or malignant.", "datascience", "mini", 7000, 4000, 2000, "SVM, PCA, Medical Data", 0, 0],
    ["Netflix Movies & TV Shows EDA", "Insights and visualization of Netflix's content library.", "datascience", "mini", 6000, 3500, 1500, "Plotly, EDA, Data Cleaning", 0, 0],
    ["Flight Price Prediction", "Predicts airline ticket prices based on departure dates and routes.", "datascience", "major", 14000, 9000, 5500, "XGBoost, Feature Engineering", 1, 1],
    ["Sports Analytics (IPL/EPL)", "In-depth analysis of sports data to predict match outcomes.", "datascience", "major", 15000, 10000, 6000, "Scikit-Learn, Probability Models", 1, 0],
    ["Text Summarization Tool", "Extracts key sentences to summarize long articles.", "datascience", "mini", 8500, 5500, 3500, "NLP, PageRank Algorithm", 0, 0],
    ["Telecom Churn Analysis", "Identifies key factors causing customers to drop telecom services.", "datascience", "major", 14500, 9500, 6000, "Data Mining, Feature Importance", 0, 0],
    ["Zomato Restaurant Rating Predictor", "Predicts restaurant success based on cost, location, and cuisine.", "datascience", "mini", 8000, 5000, 3000, "Linear Regression, Geocoding", 0, 0],
    ["Bitcoin Price Analysis", "Analyzes trends and volatility in the cryptocurrency market.", "datascience", "mini", 7500, 4500, 2500, "Time-Series, Financial Data", 0, 0],
    ["Human Resources Analytics", "Predicts employee attrition and performance.", "datascience", "major", 15000, 10000, 6500, "Classification, Business Analytics", 0, 1],
    ["Spotify Song Popularity Predictor", "Analyzes audio features to predict if a song will be a hit.", "datascience", "mini", 8500, 5500, 3500, "Spotify API, Feature Scaling", 1, 0],
    ["Wildfire Prediction System", "Uses satellite and weather data to predict forest fire risks.", "datascience", "major", 16000, 11000, 7500, "Geospatial Data, Deep Learning", 0, 1],
    ["Fake Job Posting Detection", "Identifies fraudulent job descriptions from text data.", "datascience", "mini", 7500, 4500, 2500, "NLP, Classification", 0, 0],
    ["Customer Lifetime Value Prediction", "Estimates total revenue a business can expect from a single customer.", "datascience", "major", 15500, 10500, 6500, "Regression, Lifetimes Library", 0, 0],
    ["Youtube Video Trend Analysis", "Analyzes metrics that make a video hit the trending page.", "datascience", "mini", 7000, 4500, 2500, "Data Visualization, API", 0, 0],
    ["Energy Consumption Forecasting", "Predicts electricity usage for smart grids.", "datascience", "major", 15000, 10000, 6000, "Time-Series, ARIMA/LSTM", 0, 0],

    // ---- Internet of Things (iot) ----
    ["Smart Home Automation", "Control home appliances using a smartphone via NodeMCU.", "iot", "major", 16000, 11000, 7000, "ESP8266, Relay Modules, App", 1, 1],
    ["IoT Based Weather Station", "Monitors temperature, humidity, and rain, sending data to the cloud.", "iot", "mini", 9000, 6000, 3500, "Arduino, Sensors, ThingSpeak", 0, 0],
    ["Smart Agriculture System", "Automated soil moisture sensing and water pump control.", "iot", "major", 15000, 10000, 6500, "IoT, Automation, Agriculture", 1, 1],
    ["RFID Based Attendance System", "Logs attendance automatically to a database using RFID tags.", "iot", "mini", 8500, 5500, 3500, "RFID, NodeMCU, PHP Backend", 0, 0],
    ["IoT Health Monitoring System", "Wearable device measuring heart rate and SpO2 with emergency alerts.", "iot", "major", 18000, 12500, 8500, "Pulse Sensor, ESP32, Cloud", 1, 1],
    ["Smart Parking System", "Uses IR sensors to show available parking slots on an app.", "iot", "major", 15500, 10500, 7000, "IR Sensors, Mobile App", 1, 0],
    ["Smart Dustbin", "Automatically opens the lid when someone approaches using an ultrasonic sensor.", "iot", "mini", 6000, 4000, 2500, "Arduino, Ultrasonic, Servo", 0, 0],
    ["IoT Based Water Quality Monitor", "Measures pH and turbidity of water in real-time.", "iot", "major", 14500, 9500, 6000, "pH Sensor, Data Logging", 0, 1],
    ["Vehicle Tracking System", "Live GPS tracking of a vehicle accessible via web portal.", "iot", "major", 16000, 11000, 7500, "GPS, GSM, Web Maps", 1, 0],
    ["Smart Street Light", "Saves energy by turning on street lights only when vehicles approach.", "iot", "mini", 7500, 4500, 2500, "LDR, IR Sensor", 0, 0],
    ["Home Security System with Camera", "Sends a photo to Telegram when motion is detected.", "iot", "major", 17000, 11500, 8000, "ESP32-CAM, Telegram API", 1, 1],
    ["IoT Based Air Pollution Meter", "Detects harmful gases and updates AQI on a dashboard.", "iot", "mini", 8000, 5000, 3500, "MQ135, NodeMCU", 0, 0],
    ["Smart Mirror", "A mirror that displays time, weather, and news while you get ready.", "iot", "major", 19000, 13000, 9000, "Raspberry Pi, UI/UX, Hardware", 1, 1],
    ["IoT Based Toll Booth", "Automated toll collection using RFID and cloud deduction.", "iot", "major", 15000, 10000, 6500, "RFID, Database Sync", 0, 0],
    ["Industrial Fault Detection", "Monitors motor vibrations to predict machinery failure.", "iot", "major", 17500, 12000, 8500, "Accelerometer, Edge Computing", 0, 1],
    ["Smart Blind Stick", "Helps visually impaired people by detecting obstacles and water.", "iot", "mini", 8500, 5500, 3500, "Ultrasonic, Buzzer, Arduino", 1, 0],
    ["IoT Based Baby Incubator Monitor", "Remote monitoring of incubator temperature for hospitals.", "iot", "major", 16500, 11500, 7500, "Medical IoT, Real-time Dashboard", 0, 0],
    ["Automated Pet Feeder", "Dispenses food at scheduled times or via an app button.", "iot", "mini", 8000, 5000, 3000, "RTC Module, Servo, ESP8266", 0, 0],
    ["Smart Energy Meter", "Monitors electricity consumption and cuts power if bill is unpaid.", "iot", "major", 15500, 10500, 7000, "Current Sensor, Relay, Cloud", 1, 0],
    ["IoT Flood Detection System", "Monitors river water levels and sends SMS alerts to villagers.", "iot", "major", 14500, 9500, 6000, "Water Level Sensor, GSM Module", 0, 1],
    ["Smart Baggage Tracker", "Prevents losing luggage at airports using GPS and IoT.", "iot", "mini", 9000, 6000, 4000, "GPS, Bluetooth, Battery Auth", 0, 0],
    ["IoT Based Library Management", "Locates books instantly using RFID tags on shelves.", "iot", "major", 16000, 11000, 7500, "RFID Grid, Web Interface", 0, 0],
    ["Gesture Controlled Wheelchair", "Moves wheelchair based on hand tilts using accelerometer.", "iot", "major", 17000, 11500, 8000, "ADXL335, Motor Driver", 1, 1],
    ["Smart Fire Alarm System", "Detects fire and sends precise location coordinates to the fire station.", "iot", "mini", 8500, 5500, 3500, "Flame Sensor, GPS, GSM", 0, 0],

    // ---- Research Papers (research) ----
    ["Research: AI in Medical Diagnosis", "A comprehensive study on the accuracy of CNNs in detecting X-Ray anomalies.", "research", "major", 10000, 7000, 4500, "Literature Review, Comparative Analysis, IEEE Format", 1, 1],
    ["Research: Blockchain for Voting", "Investigating the security and scalability of decentralized voting protocols.", "research", "major", 11000, 7500, 5000, "Cryptography, Consensus Algorithms", 0, 1],
    ["Research: 5G Network Latency", "Analysis of edge computing impact on reducing 5G network latency.", "research", "major", 9000, 6500, 4000, "Telecommunications, Edge Computing", 0, 0],
    ["Research: Deepfake Detection Techniques", "Evaluating the effectiveness of adversarial networks in spotting deepfakes.", "research", "major", 12000, 8000, 5500, "GANs, Cybersecurity, Ethics", 1, 1],
    ["Research: Autonomous Vehicle Ethics", "A paper discussing the decision-making ethics of self-driving cars during crashes.", "research", "mini", 6000, 4000, 2500, "Ethics, AI Logic, Case Studies", 0, 0],
    ["Research: IoT Security Vulnerabilities", "Identifying common loopholes in smart home devices and proposing fixes.", "research", "major", 10500, 7000, 4500, "IoT, Network Security, Protocols", 1, 0],
    ["Research: Impact of Quantum Computing", "How quantum algorithms will break current RSA encryption standards.", "research", "major", 13000, 9000, 6000, "Shor's Algorithm, Cryptography", 0, 1],
    ["Research: NLP in Sentiment Analysis", "Comparing VADER, TextBlob, and BERT for analyzing Twitter sentiments.", "research", "mini", 7000, 5000, 3000, "NLP, Benchmark Testing", 0, 0],
    ["Research: Renewable Energy Grids", "Optimization of power distribution in solar-integrated smart grids.", "research", "major", 11500, 8000, 5000, "Smart Grid, Energy Efficiency", 0, 0],
    ["Research: Augmented Reality in Education", "Studying the improvement in student retention rates using AR apps.", "research", "mini", 6500, 4500, 3000, "EdTech, HCI, Surveys", 0, 0],
    ["Research: Phishing Detection with ML", "Analyzing URL features to predict and block phishing websites.", "research", "major", 10000, 7000, 4500, "Cybersecurity, Random Forest", 1, 0],
    ["Research: Precision Agriculture", "The role of drones and IoT sensors in maximizing crop yields.", "research", "major", 11000, 7500, 5000, "IoT, Drones, Agritech", 0, 0],
    ["Research: Biometric Authentication", "Comparing fingerprint vs iris scanning for mobile security.", "research", "mini", 7000, 5000, 3000, "Biometrics, Security Analysis", 0, 0],
    ["Research: Fake News Dissemination", "Graph theory approach to tracking how misinformation spreads on social networks.", "research", "major", 12000, 8500, 5500, "Graph Theory, Social Media", 0, 1],
    ["Research: Wearable Tech in Healthcare", "Evaluating the accuracy of smartwatch ECG sensors.", "research", "mini", 7500, 5500, 3500, "Healthcare, Sensor Accuracy", 0, 0],
    ["Research: Cloud Computing Optimization", "Strategies for minimizing energy consumption in large data centers.", "research", "major", 11500, 8000, 5000, "Green Computing, Cloud Architecture", 0, 0],
    ["Research: Big Data in E-Commerce", "How predictive analytics drives customer purchasing behavior.", "research", "mini", 8000, 5500, 3500, "Big Data, Consumer Behavior", 0, 0],
    ["Research: Brain-Computer Interfaces", "Current limitations and future prospects of non-invasive BCI.", "research", "major", 14000, 9500, 6500, "Neuroscience, HCI, Signal Processing", 1, 1],
    ["Research: Cyberbullying Detection", "Using machine learning to automatically flag toxic comments online.", "research", "major", 10500, 7500, 4500, "NLP, Hate Speech, Classification", 0, 0],
    ["Research: Smart Cities Infrastructure", "The integration of IoT in waste management and traffic control.", "research", "major", 11000, 7500, 5000, "IoT, Urban Planning", 0, 0],
    ["Research: Malware Evasion Techniques", "How modern malware bypasses traditional signature-based antivirus.", "research", "major", 12500, 8500, 6000, "Cybersecurity, Obfuscation", 1, 1],
    ["Research: Edge Computing vs Cloud", "Latency and bandwidth trade-offs in IoT applications.", "research", "mini", 7500, 5000, 3000, "Networking, Edge Analytics", 0, 0],
    ["Research: Explainable AI (XAI)", "Methods for making black-box deep learning models interpretable.", "research", "major", 13500, 9500, 6000, "XAI, LIME, SHAP", 0, 1],
    ["Research: Microplastics in Water", "Using AI to analyze microscopic images and quantify water pollution.", "research", "major", 11500, 8000, 5500, "Environmental Science, Image Processing", 0, 0],
];

async function main() {
    console.log("Connecting to TiDB via mysql2...");
    const connection = await mysql.createConnection({
        host, port, user, password, database,
        ssl: { rejectUnauthorized: true }
    });

    console.log("Clearing old projects...");
    await connection.execute("DELETE FROM projects");

    console.log("Inserting 120 curated projects...");
    const insertSql = `
        INSERT INTO projects (title, description, category, year_type, original_price, market_price, our_price, features, is_popular, is_trending)
        VALUES ?
    `;
    await connection.query(insertSql, [projects]);

    console.log("Successfully inserted projects!");
    await connection.end();
}

main().catch(console.error);
