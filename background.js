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
    chrome.storage.local.get(["userName", "transcript", "chatMessages", "meetingTitle", "meetingStartTimeStamp"], function (result) {
        if (result.userName && result.transcript && result.chatMessages) {
            const fileName = result.meetingTitle && result.meetingStartTimeStamp ? `TranscripTonic/Transcript-${result.meetingTitle} at ${result.meetingStartTimeStamp}.txt` : `TranscripTonic/Transcript.txt`

            const lines = []

=            result.transcript.forEach(entry => {
                lines.push({name: entry.personName ,timeStamp: entry.timeStamp, type:"transcript", content: entry.personTranscript})
            })

            if (result.chatMessages.length > 0) {
                result.chatMessages.forEach(entry => {
                    lines.push({name: entry.personName ,timeStamp: entry.timeStamp, type:"chat", content: entry.chatMessageText})
                })
            }
        }
        else
            console.log("No transcript found")
    })
}