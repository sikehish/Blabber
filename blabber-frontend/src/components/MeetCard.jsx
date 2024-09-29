// src/MeetCard.jsx
import React from 'react';

const MeetCard = ({ meet }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4">
      <h2 className="text-xl font-bold">{meet.meetingTitle}</h2>
      <p><strong>Convenor:</strong> {meet.convenor}</p>
      <p><strong>Email:</strong> {meet.blabberEmail}</p>
      <p><strong>Start Time:</strong> {new Date(meet.meetingStartTimeStamp).toLocaleString()}</p>
      <p><strong>End Time:</strong> {new Date(meet.meetingEndTimeStamp).toLocaleString()}</p>
      <p><strong>Speakers:</strong> {meet.speakers.join(', ')}</p>
      <p><strong>Attendees:</strong> {meet.attendees.join(', ')}</p>
    </div>
  );
};

export default MeetCard;
