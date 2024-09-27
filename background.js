
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

function sendToBackend() {
    chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp", "meetingEndTimeStamp", "attendees", "speakers"], function (result) {
        console.log(result);
        
        if (result.userName && result.transcript && result.chatMessages) {
            const lines = [];

            result.transcript.forEach(entry => {
                lines.push({
                    name: (entry.personName=="You" ?  result.userName :  entry.personName),
                    timeStamp: entry.timeStamp,
                    type: "transcript",
                    content: entry.personTranscript
                });
            });

            if (result.chatMessages.length > 0) {
                result.chatMessages.forEach(entry => {
                    lines.push({
                        name: (entry.personName=="You" ?  result.userName :  entry.personName),
                        timeStamp: entry.timeStamp,
                        type: "chat",
                        content: entry.chatMessageText
                    });
                });
            }

            console.log(result.speakers, result.attendees)
            const speakersArray = Array.from(result.speakers || []).map(speaker => speaker.trim()).filter(speaker => speaker !== "");

            // Send the data to the backend using fetch API
            fetch('http://localhost:3000/transcripts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: result.userName,
                    meetingTitle: result.meetingTitle || "Untitled Meeting",
                    meetingStartTimeStamp: result.meetingStartTimeStamp || new Date().toISOString(),
                    meetingEndTimeStamp: result.meetingEndTimeStamp || undefined,
                    speakers: speakersArray,
                    attendees: result.attendees,
                    transcriptData: lines,
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

