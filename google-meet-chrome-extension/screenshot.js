// screenshot.js

function addScreenshotButton() {
    const button = document.createElement('button');
    button.innerText = 'Take Screenshot';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000'; // Make sure it's above other elements
    button.style.backgroundColor = 'red'; // Prominent color
    button.style.color = 'white';
    button.style.padding = '10px';
    button.style.borderRadius = '5px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    button.addEventListener('click', takeScreenshot);

    // Make the button draggable
    let offsetX, offsetY;

    button.addEventListener('mousedown', function (e) {
        offsetX = e.clientX - button.getBoundingClientRect().left;
        offsetY = e.clientY - button.getBoundingClientRect().top;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    function mouseMoveHandler(e) {
        button.style.left = e.clientX - offsetX + 'px';
        button.style.top = e.clientY - offsetY + 'px';
    }

    function mouseUpHandler() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }

    document.body.appendChild(button);
}

function takeScreenshot() {
    console.log('Take Screenshot clicked'); // Debug log
    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, function (response) {
        console.log(response)
        if (chrome.runtime.lastError) {
            console.error('Error capturing screenshot:', chrome.runtime.lastError.message);
        } else if (response.error) {
            console.error('Error from background:', response.error);
        } else {
            console.log('Screenshot URL:', response.screenshotUrl); // This will log the screenshot data URL
            // You can implement your upload logic here using the response.screenshotUrl
        }
    });
}

// Call this function when the meet starts (you can hook this into your existing logic)
addScreenshotButton();
