document.addEventListener('DOMContentLoaded', function () {
  
  const summaryText = 'جاري التحميل .........'; 

 
 
  animateSummaryText(summaryText);
});
function animateSummaryText(summaryText) {
  const summaryElement = document.getElementById('summary');
  summaryElement.textContent ='';
  const words = summaryText.split(' ');
  let currentIndex = 0;

  const intervalId = setInterval(function () {
    summaryElement.textContent += words[currentIndex] + ' ';
    currentIndex++;

    if (currentIndex >= words.length) {
      clearInterval(intervalId);
    }
  }, 200);  
}   
var url_;
document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  extractBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      if (tab && tab.url) {
        const videoId = extractVideoId(tab.url);
        if (videoId) {
          console.log(videoId);
          fetchData(videoId);
          url_=videoId;
          chrome.runtime.sendMessage({ videoId });
        } else {
          console.log(encodeURIComponent('الرابط غير صحيح لفيديو اليوتيوب .'));
        }
      } else {
        console.log(encodeURIComponent('لا يمكن العثور على الرابط الحالي.'));
      }
    });
  });
});
  
function extractVideoId(url) {
  console.log(url);
  const videoIdRegex = /(?:\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(videoIdRegex);
  return match ? match[1] : null;
}

var head = { Accept: 'application/json, text/plain, */*','User-Agent': '*',}
var payload;
const fetchData = async (videoId) => { 
    const data = {videoId };
try{
    const response = await fetch('http://localhost:3000/summary/'+videoId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    
      const text = await response.text();
      payload=JSON.parse(text);
      console.log(payload);
      animateSummaryText(payload)
      // document.getElementById("summary").innerHTML = payload.text;
      console.log('rfcrfcvrfcvr');
    }catch (e){
       
    }
}
