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
