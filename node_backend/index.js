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

    const email=meetData?.blabberEmail
    const user = await User.findOne({ email });

    if(!user){
        throw new Error("This email isn't registered!")
    }

    const newMeet = new Meet({
      ...(req.body),speakerDuration: new Map(Object.entries(meetData.speakerDuration)), 
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



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
