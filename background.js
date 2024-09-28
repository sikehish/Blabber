
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == "new_meeting_started") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id
            chrome.storage.local.set({ meetingTabId: tabId }, function () {
                console.log("Meeting tab id saved")
            })
        })
    }
    if (message.type == "end_meeting") {
        chrome.storage.local.set({ meetingTabId: null }, function () {
            console.log("Meeting tab id cleared")
        })
        sendToBackend()
    }
    return true
})

chrome.tabs.onRemoved.addListener(function (tabid) {
    chrome.storage.local.get(["meetingTabId"], function (data) {
        if (tabid == data.meetingTabId) {
            console.log("Successfully intercepted tab close")
            sendToBackend()
            chrome.storage.local.set({ meetingTabId: null }, function () {
                console.log("Meeting tab id cleared for next meeting")
            })
        }
    })
})
function parseCustomTimestamp(timestamp,isFringe) {
    const [datePart, timePart] = timestamp.split(', ');

    const [day, month, year] = (isFringe ? datePart.split('-').map(Number) :  datePart.split('/').map(Number)) 
    const [time, period] = timePart.split(' ');
    let [hours, minutes, seconds] = (isFringe ? time.split('-').map(Number) : time.split(':').map(Number));

    if (seconds === undefined) {
        seconds = 0;
    }

    if (period === "PM" && hours < 12) {
        hours += 12; // Convert PM to 24-hour format
    } else if (period === "AM" && hours === 12) {
        hours = 0; // Midnight case (12 AM)
    }

    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    // Return the date in ISO format (e.g., 2024-09-28T16:03:16)
    console.log(dateObject.toISOString().slice(0, 19))
    return dateObject.toISOString().slice(0, 19);
}

function sendToBackend() {
    chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp", "meetingEndTimeStamp", "attendees", "speakers"], function (result) {
        console.log(result);
        const speakerDuration={};
        
        if (result.userName && result.transcript && result.chatMessages) {
            const lines = [];
            const averageWPM = 170;
            
            result.transcript.forEach(entry => {
                const wordCount = entry.personTranscript.split(' ').length;
                const durationInSeconds = Math.round((wordCount / averageWPM) * 60); 
                const transcriptEntry = {
                    name: (entry.personName == "You" ? result.userName : entry.personName),
                    timeStamp: parseCustomTimestamp(entry.timeStamp, false),
                    type: "transcript",
                    duration: durationInSeconds,
                    content: entry.personTranscript
                };
                
                lines.push(transcriptEntry);
                const speakerName = transcriptEntry.name;
                if (speakerDuration[speakerName])    speakerDuration[speakerName] += transcriptEntry.duration;
                else speakerDuration[speakerName] = transcriptEntry.duration;
                
            });

            if (result.chatMessages.length > 0) {
                result.chatMessages.forEach(entry => {
                    lines.push({
                        name: (entry.personName=="You" ?  result.userName :  entry.personName),
                        timeStamp: parseCustomTimestamp(entry.timeStamp, false),
                        type: "chat",
                        duration: 0, // chat msgs don't count as spoken time
                        content: entry.chatMessageText
                    });
                });
            }

            console.log(result.speakers, result.attendees)
            const speakersArray = Array.from(result.speakers || []).map(speaker => speaker.trim()).filter(speaker => speaker !== "");

            fetch('http://localhost:3000/transcripts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: result.userName,
                    meetingTitle: result.meetingTitle || "Untitled Meeting",
                    meetingStartTimeStamp: parseCustomTimestamp(result.meetingStartTimeStamp, true) || new Date().toISOString(),
                    meetingEndTimeStamp: parseCustomTimestamp(result.meetingEndTimeStamp,true) || undefined,
                    speakers: speakersArray,
                    attendees: result.attendees,
                    transcriptData: lines,
                    speakerDuration
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            console.log("No transcript found");
        }
    });
}

