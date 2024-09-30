// Import necessary packages
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const Meet = require('./models/meetSchema');
const User = require("./models/userSchema")
const passport = require('passport');
const { checkAuth } = require('./middleware/authMiddleware');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt=require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { pipeline,Readable } = require('stream');
const nodemailer = require('nodemailer');


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/oauth/google/callback",
  scope:["profile","email"],
  passReqToCallback:true
},
async function(request, accessToken, refreshToken, profile, done) { 
  try {
    const email = profile?.emails[0]?.value;
    let user = await User.findOne({ email });
    
    if (!user) user = await User.create({ email, name: profile?.displayName });
    return done(null, user); 
  } catch (err) {
    return done(err, false);
  }
} 
));


const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const AI_SERVER_URL = process.env.AI_SERVER_URL;
let reportBuffer = []; // Buffer to store report data

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

  app.post('/api/meet', async (req, res) => {
    try {
      const meetData = req.body;
  
      // Check if the user exists based on blabberEmail
      const email = meetData?.blabberEmail;
      const user = await User.findOne({ email });
  
      if (!user) {
        throw new Error("This email isn't registered!");
      }
  
      // Process screenshots if provided
      const screenshots = meetData.screenshots
        ?.filter(screenshot => screenshot.filename) // Filter out screenshots without a filename
        .map(screenshot => ({
          filename: screenshot.filename,
          timestamp: screenshot.timestamp || new Date(), // Use provided timestamp or set to now
          takenBy: screenshot.takenBy || email // Use blabberEmail if not provided
        })) || [];
  
      // Create new Meet instance
      const newMeet = new Meet({
        ...meetData,
        speakerDuration: new Map(Object.entries(meetData.speakerDuration)),
        screenshots: screenshots
      });
  
      // Save the meet
      await newMeet.save();
  
      // Check if autoEnabled is true for the user
      if (user.autoEnabled) {
        const payload = { meeting_data: newMeet, report_format: 'pdf', report_type: 'normal' };
  
        // Call the AI server to generate the report
        const response = await fetch(AI_SERVER_URL + '/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
        const reportBuffer = Buffer.from(await response.arrayBuffer());  
          // Prepare email transporter
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            ignoreTLS: false,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
            });
            
  
          // Send email with the report
          await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender email
            to: email, // Send to the user
            subject: `Your Report for ${newMeet.meetingTitle}`, // Email subject
            text: 'Please find the attached report for your recent meet.', // Email body
            attachments: [
              {
                filename: 'report.pdf', // Attachment filename
                content: reportBuffer, // Attach the report as a buffer
              },
            ],
          });
  
          console.log('Email with report sent to', email);
        } else {
          console.error('Failed to generate report:', response.statusText);
        }
      }
  
      res.status(201).json({ message: 'Meet created successfully!', meet: newMeet });
    } catch (error) {
      console.error('Error creating meet:', error);
      res.status(500).json({ message: 'Error creating meet', error });
    }
  });
  
app.get('/api/users/check', checkAuth, async (req, res) => {
    try {
        // console.log(req.user, req.cookies.token)
      if (!req.user) {
        res.status(401);
        throw new Error('User is not authenticated');
      }
      
      // console.log("USER ", req.user);
      const email = req.user.email; // Assuming req.user contains an object with the email
      const user = await User.findOne({ email });
      // console.log("User: ", user);
  
      if (user) {
        res.status(200).json({ user: { email: user.email, name: user.name } }); // Return the user object with email
        return;
      }

      if (!user) {
        res.status(404);
        throw new Error("User doesn't exist");
      }
  
      res.status(200).json({ user: { email: user.email, name: user.name } });
      
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  

app.get('/api/meet',checkAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });

    if(!user){
        throw new Error("This email isn't registered!")
    }
    // console.log(user, email)
    const meets = await Meet.find({ blabberEmail : email}).sort({ meetingStartTimeStamp: -1 });
    if (meets.length === 0) {
      return res.status(404).json({ message: 'No meets found for this email.' });
    }
    
    res.json(meets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets', error });
  }
});


app.get("/api/oauth/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Successfully Logged In",
            user: req.user.email,
        });
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
    }
});

app.get("/api/oauth/login/failed", async (req, res) => {
    console.log("ERROR ")
    res.status(401).json({
        error: true,
        message: "Login failure",
    });
});

app.get("/api/oauth/google", passport.authenticate("google",  { scope: ["profile", "email"], prompt: 'select_account' }));


// Google OAuth callback URL
app.get('/api/oauth/google/callback', passport.authenticate('google', { session: false, failureRedirect:`${process.env.CLIENT_URL}/failed`,prompt: 'select_account' }), (req, res) => {
    console.log("HAHAHAHAH")
  if (req.user) {
    const user = req.user;
    // console.log("USERRRR: ", user)
    const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_KEY, { expiresIn: '5d' });
    // console.log("TOKEEEEN ", token)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 5 * 24 * 60 * 60 * 1000 
    });
 
     res.redirect(`${process.env.CLIENT_URL}/success`);
  } else {
     res.redirect(`${process.env.CLIENT_URL}/failed`);
  }
});


app.get("/api/oauth/logout", (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
    });
    res.redirect(process.env.CLIENT_URL);
});

app.post('/api/register-from-extension', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required.' });
  }

  try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
          return res.status(409).json({ message: 'User already exists.' });
      }

      // Create a new user
      const newUser = new User({ email, name });
      await newUser.save();

      return res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/upload-screenshot', (req, res) => {
  const { filename, imageData, email } = req.body;

  // Directory path based on blabberEmail
  const directoryPath = path.join(__dirname, 'screenshots', email);

  // Create directory if it doesn't exist
  fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
          console.error('Error creating directory:', err);
          return res.status(500).json({ error: 'Failed to create directory' });
      }

      // Write file to the directory
      const filePath = path.join(directoryPath, filename);
      const base64Data = imageData.split(',')[1]; // Remove the data URL prefix

      fs.writeFile(filePath, base64Data, { encoding: 'base64' }, (err) => {
          if (err) {
              console.error('Error writing file:', err);
              return res.status(500).json({ error: 'Failed to write file' });
          }

          console.log(`File saved: ${filePath}`);
          res.status(200).json({ message: 'Screenshot uploaded successfully', filename });
      });
  });
});


app.post('/api/get-report', checkAuth, async (req, res) => {
  const { meeting_id, meeting_title, report_format, report_type, report_interval, emails } = req.body;

  // Validate emails
  const validEmails = emails.filter(email => email && email.includes('@')); // Simple email validation

  // Find the meet based on the meeting_id
  const meet = await Meet.findById(meeting_id);
  const payload = { meeting_data: meet, report_format, report_type };
  if (report_interval) payload.report_interval = Number(report_interval);

  if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
  } else {
      meet.meetingTitle = meeting_title;
      await meet.save();
      console.log(meet);

      try {
          const response = await fetch(AI_SERVER_URL + '/report', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
          });

          if (response.ok) {
              res.setHeader('Content-Disposition', response.headers.get('content-disposition'));
              res.setHeader('Content-Type', response.headers.get('content-type'));

              // Create a buffer to store the report data
              const reportBuffer = [];

              // Convert the fetch response.body (ReadableStream) into a Node.js Readable stream
              const nodeReadableStream = Readable.from(response.body);

              // Pipe the stream to the response for downloading
              nodeReadableStream.pipe(res);

              // Collect the data into the buffer for emailing
              nodeReadableStream.on('data', (chunk) => {
                  reportBuffer.push(chunk);
              });

              // Once the stream ends, send the email
              nodeReadableStream.on('end', async () => {
                  // Convert buffer to a single buffer
                  const reportData = Buffer.concat(reportBuffer);

                  // Prepare email transporter
                  const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    ignoreTLS: false,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                    });

                  // Send email to each valid email address
                  for (const email of validEmails) {
                      await transporter.sendMail({
                          from: process.env.EMAIL_USER, // Sender address
                          to: email, // List of recipients
                          subject: `Your Report for ${meeting_title}`, // Subject line
                          text: 'Please find the attached report.', // Plain text body
                          attachments: [
                              {
                                  filename: 'report.pdf', // Adjust the filename as necessary
                                  content: reportData, // Attach the report buffer
                              },
                          ],
                      });
                  }
              });
          } else {
              res.status(response.status).json({ message: 'Failed to generate report', error: response.statusText });
          }
      } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ message: 'Failed to generate report', error });
      }
  }
});

app.get('/api/auto-enabled', checkAuth, async (req, res) => {
  try {
    const user = await User.findOne({email: req.user.email}); // Assuming req.user.id is populated by checkAuth middleware
    res.json({ autoEnabled: user.autoEnabled });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auto-enabled status' });
  }
});

app.post('/api/auto-enabled', checkAuth, async (req, res) => {
  const { autoEnabled } = req.body;
  
  try {
    const user = await User.findOne({email: req.user.email});
    user.autoEnabled = autoEnabled;
    await user.save();
    res.status(200).json({ message: 'Auto-enabled status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating auto-enabled status' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
