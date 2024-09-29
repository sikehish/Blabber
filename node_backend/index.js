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
  
      // Prepare screenshots data if it exists
      // console.log(meetData.screenshots)
      console.log("SS1: ", meetData.screenshots)
      // Prepare screenshots data if it exists and has valid filenames
const screenshots = meetData.screenshots
?.filter(screenshot => screenshot.filename) // Filter out screenshots without a filename
.map(screenshot => ({
  filename: screenshot.filename,
  timestamp: screenshot.timestamp || new Date(), // Use provided timestamp or set to now
  takenBy: screenshot.takenBy || email // Use blabberEmail if not provided
})) || [];


      console.log("SS2: ",screenshots)
      // Create a new meet object
      const newMeet = new Meet({
        ...meetData,
        speakerDuration: new Map(Object.entries(meetData.speakerDuration)),
        screenshots : screenshots
      });
  
      await newMeet.save();
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
      
      console.log("USER ", req.user);
      const email = req.user.email; // Assuming req.user contains an object with the email
      const user = await User.findOne({ email });
      console.log("User: ", user);
  
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
    console.log("USERRRR: ", user)
    const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_KEY, { expiresIn: '5d' });
    // console.log("TOKEEEEN ", token)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',  
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
        sameSite: 'none',
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
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
