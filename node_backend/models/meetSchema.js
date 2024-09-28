const mongoose = require('mongoose');

const meetSchema = new mongoose.Schema({
  convenor: { type: String, required: true },
  blabberEmail: { type: String, required: true },
  blabberName: { type: String, required: true },
  meetingTitle: { type: String, required: true },
  meetingStartTimeStamp: { type: Date, required: true },
  meetingEndTimeStamp: { type: Date, required: true },
  speakers: [{ type: String }],
  attendees: [{ type: String }],
  transcriptData: [
    {
      name: { type: String, required: true },
      timeStamp: { type: Date, required: true },
      type: { type: String, required: true }, // 'transcript' or 'chat'
      duration: { type: Number, required: true },
      content: { type: String, required: true },
    },
  ],
  speakerDuration: {
    type: Map,
    of: Number, // Each key is a speaker's name, and the value is their duration in seconds
  },
});

const Meet = mongoose.model('Meet', meetSchema);
module.exports = Meet;
