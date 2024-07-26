import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Required Modules
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import useragent from 'useragent';
import moment from 'moment';
import { createCanvas, registerFont } from 'canvas';
import QRCode from 'qrcode'; // Import QRCode library
import fs from 'fs';
import requestIP from 'request-ip';
import device from 'express-device';

// ENV Configuration
import dotenv from 'dotenv';
dotenv.config();

// Import Models 
// import { User } from './Models';
import { User } from "./Models/users.model.js"
import { PurchaseId } from './Models/purchase.model.js';

const App = express();

// Setting the view engine to EJS
App.set('view engine', 'ejs');

// Getting the current directory path for relative paths in views folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

App.set('Views', path.join(__dirname, 'Views'));

// Middlewares
App.use('/views', express.static(path.join(__dirname, '/views')));
App.use(express.static("public"))
App.use(bodyParser.urlencoded({ extended: true }));
App.use(device.capture());


// Routes
App.get('/', (req, res) => {
    res.render('index.ejs');
})

App.get('/dev', (req, res) => {
    const deviceInfo = {}
    res.render('DeviceInfo.ejs', { deviceInfo });
})

App.post('/signup', async (req, res) => {
    const { userId, email, secretKey } = req.body;

    try {
        // Check if the secret key is valid
        const purchaseId = await PurchaseId.findOne({ secretKey });
        if (!purchaseId) {
            console.error('Invalid secret key:', secretKey);
            return res.send('Invalid secret key');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            console.error('User already exists:', userId);
            return res.send('User already exists');
        }

        // Generate QR code
        const qrData = `https://www.example.com/${userId}`;
        const qrImage = await generateQRCode(qrData, userId);

        // Save QR code image to file
        const imagePath = `public/qr-codes/${userId}.png`;
        fs.writeFileSync(imagePath, qrImage);

        // Create a new user
        const newUser = new User({ userId, email });
        await newUser.save();

        console.log('User signed up successfully:', userId);
        res.send('User signed up successfully');
    } catch (error) {
        console.error('An error occurred:', error);
        res.send('An error occurred');
    }
});

App.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    // Get device information
    const ip = requestIP.getClientIp(req) + " and " + req.socket.localAddress;
    const userAgent = useragent.parse(req.headers['user-agent']);
    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        // Fetch user email from database
        const user = await User.findOne({ userId });

        if (user) {
            const cpuArchitecture = userAgent.cpu ? userAgent.cpu.architecture : 'Unknown';
            const deviceInfo = {
                ip,
                userAgent: userAgent.toString(),
                browserName: userAgent.family,
                browserVersion: userAgent.toAgent(),
                osName: userAgent.os.family,
                osVersion: userAgent.os.toString(),
                deviceType: req.device.type.toUpperCase(),
                cpuArchitecture,
                platform: userAgent.os.platform,
                dateTime
            };

            // Send email
            await sendEmail(user.email, deviceInfo);

            // Generate QR code
            const qrCodeDir = path.join(__dirname, 'public', 'qr-codes');
            if (!fs.existsSync(qrCodeDir)) {
                fs.mkdirSync(qrCodeDir, { recursive: true });
            }
            const qrCodeData = `https://www.example.com/${userId}`;
            const qrCodeImage = await generateQRCode(qrCodeData, userId);
            const imagePath = path.join(qrCodeDir, `${userId}.png`);
            fs.writeFileSync(imagePath, qrCodeImage);

            res.render('deviceInfo', { deviceInfo, qrCodeImage });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.send('An error occurred');
    }
});


// Utility functions
async function generateQRCode(data, userId) {
    try {
        // Generate QR code as a buffer
        const qrCodeBuffer = QRCode.toBuffer(data, { width: 1000, height: 1000 });

        return qrCodeBuffer; // Return the buffer
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

async function sendEmail(email, data) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS // Use the App Password here
        }
    });

    const mailOptions = {
        from: 'chingchongchaichi@gmail.com',
        to: email,
        subject: 'Device Information',
        text: `Device Information:\n/*\nIP*/: ${data.ip}\nUser Agent: ${data.userAgent}\nBrowser Name: ${data.browserName}\nBrowser Version: ${data.browserVersion}\nOS Name: ${data.osName}\nOS Version: ${data.osVersion}\nDevice Type: ${data.deviceType}\nCPU Architecture: ${data.cpuArchitecture}\nPlatform: ${data.platform}\nDate and Time: ${data.dateTime}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Failed to send email:', error);

        if (error.responseCode === 535) {
            throw new Error('Invalid email credentials. Please check your Gmail username and App Password.');
        } else if (error.responseCode === 421) {
            throw new Error('SMTP connection limit exceeded. Please try again later.');
        } else {
            throw new Error('Failed to send email. Please try again later.');
        }
    }
}



export default App;