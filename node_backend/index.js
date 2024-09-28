const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors'); // Import cors
const app = express();
const PORT = 3000;

// Use CORS middleware with default settings (allows all origins)
app.use(cors());

// Middleware to log requests using morgan
app.use(morgan('dev'));

// Middleware to parse JSON body
app.use(express.json());

// POST endpoint to receive transcript data
app.post('/transcripts', (req, res) => {
    const transcriptData = req.body;
    
    // Log the received data
    console.log("Received transcript data:", transcriptData);
    // Respond back with the same data
    res.json({
        message: "Transcript data received successfully",
        data: transcriptData
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// const data = {
//     userName: 'TitaNyte Official',
//     meetingTitle: 'qta-tugj-tpp',
//     meetingStartTimeStamp: '28-09-2024, 01-53 AM',
//     meetingEndTimeStamp: '28-09-2024, 01-56 AM',
//     speakers: ['TitaNyte Official'],
//     attendees: ['Hisham Akmal', 'TitaNyte Official'],
//     transcriptData: [
//       {
//         name: 'TitaNyte Official',
//         timeStamp: '28/09/2024, 01:53 AM',
//         type: 'transcript',
//         content: 'Still. '
//       },
//       {
//         name: 'TitaNyte Official',
//         timeStamp: '28/09/2024, 01:55 AM',
//         type: 'transcript',
//         content: 'Hello, hello. Hi. And I audio. I will audible. '
//       }
//     ]
//   };
//   function parseTimestamp(timestamp) {
//     console.log("Original timestamp:", timestamp);
//     const [datePart, timePart] = timestamp.split(", ");
//     const [day, month, year] = datePart.split("/");
//     const reformattedDate = `${month}/${day}/${year}`;
//     const formattedTimestamp = `${reformattedDate}, ${timePart}`;
//     const parsedDate = new Date(formattedTimestamp);
//     console.log("Parsed date:", parsedDate);
//     return parsedDate;
// }

  
//   // Calculate total speaking time for each speaker
//   function calculateSpeakingDuration(transcriptData) {
//     const speakingDurations = {};
  
//     // Initialize last timestamp and speaker
//     let lastTimestamp = null;
//     let lastSpeaker = null;
  
//     transcriptData.forEach((entry, index) => {
//       const currentSpeaker = entry.name;
//       const currentTimestamp = parseTimestamp(entry.timeStamp);
  
//       if (lastSpeaker && lastTimestamp && lastSpeaker === currentSpeaker) {
//         const duration = (currentTimestamp - lastTimestamp) / 1000; // Duration in seconds
  
//         // Add the duration to the speaker's total
//         if (!speakingDurations[currentSpeaker]) {
//           speakingDurations[currentSpeaker] = 0;
//         }
//         speakingDurations[currentSpeaker] += duration;
//       }
  
//       // Update the last speaker and timestamp for the next iteration
//       lastSpeaker = currentSpeaker;
//       lastTimestamp = currentTimestamp;
//     });
  
//     return speakingDurations;
//   }
  
//   // Calculate and log the total speaking durations
//   const speakingDurations = calculateSpeakingDuration(data.transcriptData);
//   console.log("Speaking durations (in seconds):", speakingDurations);