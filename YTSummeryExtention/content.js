// في ملف content.js
const videoTitleElement = document.querySelector('.title.style-scope.ytd-video-primary-info-renderer');

if (videoTitleElement) {
  const videoTitle = videoTitleElement.innerText;
  console.log('عنوان الفيديو:', videoTitle);
}


// chrome.runtime.sendMessage({ ytInitialPlayerResponse });