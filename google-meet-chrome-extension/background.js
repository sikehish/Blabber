chrome.runtime.onInstalled.addListener(() => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError || !token) {
            console.log("Token", token);
            console.error(chrome.runtime.lastError);
            return;
        }

        // Fetch user info
        fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(data => {
            // Store user information in Chrome storage
            chrome.storage.local.set({ 
                oauthEmail: data.email,
                oauthName: data.name 
            }, function() {
                console.log(data.email, data.name);
                console.log('User information stored in Chrome storage.');

                // Make fetch request to your API endpoint
                fetch('http://localhost:3000/api/register-from-extension', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: data.email,
                        name: data.name
                    })
                })
                .then(result => {
                    console.log('User registered:', result);
                })
                .catch(error => {
                    console.error('Error registering user:', error);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });
    });
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
   if (message.action === 'captureScreenshot') {
        chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataUrl) {
            if (chrome.runtime.lastError) {
                console.error("Error capturing screenshot:", chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }

            // Assuming you want to upload the screenshot
            // Call your upload function here if needed
            // For example, you might call uploadScreenshot(dataUrl);

            // Send the captured screenshot URL back to the content script
            sendResponse({ screenshotUrl: dataUrl });
        });

        // Return true to indicate that you want to send a response asynchronously
        return true;
    }

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

    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    return dateObject
}

function sendToBackend() {
    chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp", "meetingEndTimeStamp", "attendees", "speakers","oauthEmail", "oauthName"], function (result) {
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

            fetch('http://localhost:3000/api/meet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blabberEmail: result.oauthEmail,
                    blabberName: result.oauthName,
                    convenor: result.userName,
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

