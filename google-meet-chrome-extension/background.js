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



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentTab = tabs[0];
      
          // Regular expression to match Google Meet URLs with a meet ID
          const meetUrlRegex = /^https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})$/;
      
          // Check if the current tab's URL matches Google Meet and contains a valid meet ID
          if (meetUrlRegex.test(currentTab.url)) {
            chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
              if (chrome.runtime.lastError || !dataUrl) {
                alert('Failed to capture screenshot: ' + (chrome.runtime.lastError?.message || 'Unknown error.'));
                sendResponse({ success: false }); // Indicate failure
              } else {
                storeScreenshotUrl(dataUrl); // Store the screenshot URL
                sendResponse({ success: true }); // Indicate success
              }
            });
            return true; // Keep the messaging channel open for asynchronous response
          } else {
            sendResponse({ success: false }); // Not a valid Google Meet page
          }
        });
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
        clearScreenshots()
    }
    return true
  });

//   function storeScreenshotUrl(dataUrl) {
//     chrome.storage.local.get({ screenshots: [] }, (result) => {
//       const screenshots = result.screenshots;
//       screenshots.push(dataUrl); // Add the new screenshot URL to the array
  
//     //   // Optionally limit the number of stored screenshots
//     //   if (screenshots.length > 10) {
//     //     screenshots.shift(); // Remove the oldest screenshot if exceeding limit
//     //   }
  
//       // Save the updated array back to storage
//       chrome.storage.local.set({ screenshots: screenshots }, () => {
//         console.log('Screenshots updated in storage:', screenshots);
//       });
//     });
//   }
  
function storeScreenshotUrl(dataUrl) {
    // Generate a unique filename using the current timestamp
    const uniqueFilename = `screenshot_${Date.now()}.png`;

    // Fetch the blabberEmail from Chrome storage
    chrome.storage.local.get('oauthEmail', (result) => {
        const blabberEmail = result.oauthEmail;

        if (blabberEmail) {
            // Prepare the data to send to your backend
            const payload = {
                filename: uniqueFilename,
                imageData: dataUrl,
                email: blabberEmail // Include the email in the payload
            };

            // Make a network request to your backend to send the image
            fetch('http://localhost:3000/api/upload-screenshot', { // Replace with your actual backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Screenshot sent to backend successfully:', data);
                // Update the screenshots array in Chrome storage
                updateScreenshotsInStorage(uniqueFilename, blabberEmail);
            })
            .catch((error) => {
                console.error('Error sending screenshot to backend:', error);
            });
        } else {
            console.error('blabberEmail not found in storage.');
        }
    });
}

// Function to update the screenshots array in Chrome storage
function updateScreenshotsInStorage(uniqueFilename, blabberEmail) {
    const timestamp = new Date().toISOString();
    console.log(uniqueFilename)
    const screenshotEntry = {
        filename: `${uniqueFilename}`,
        timestamp: timestamp,
        takenBy: blabberEmail
    };

    chrome.storage.local.get({ screenshots: [] }, (result) => {
        const screenshots = result.screenshots;
        screenshots.push(screenshotEntry); // Add new screenshot entry

        // Save the updated array back to storage
        chrome.storage.local.set({ screenshots: screenshots }, () => {
            console.log('Screenshots updated in storage:', screenshots);
        });
    });
}
  

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
    chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp", "meetingEndTimeStamp", "attendees", "speakers","oauthEmail", "oauthName", "screenshots"], function (result) {
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
                    screenshots: result.screenshots,
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
  

function clearScreenshots() {
    chrome.storage.local.remove('screenshots', () => {
      console.log('Screenshots cleared from storage.');
    });
  }