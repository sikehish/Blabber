// Import necessary packages
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const Meet = require('./models/meetSchema');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.post('/api/meet', async (req, res) => {
  try {
    const meetData = req.body;

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

app.get('/api/meet/:blabberEmail', async (req, res) => {
  try {
    const { blabberEmail } = req.params;
    const meets = await Meet.find({ blabberEmail }).sort({ meetingStartTimeStamp: -1 });

    if (meets.length === 0) {
      return res.status(404).json({ message: 'No meets found for this email.' });
    }

    res.json(meets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
