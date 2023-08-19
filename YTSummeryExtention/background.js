// استجابة للطلبات الواردة من الامتداد
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getVideoInfo') {
    // استخراج المعلومات من صفحة الفيديو
    const videoUrl = request.videoUrl;
    const videoId = extractVideoId(videoUrl);
    const transcript = extractTranscript();

    // إرسال المعلومات إلى السيرفر
    sendToServer(videoId, transcript, function (summary) {
      // إرسال الملخص الناتج إلى الامتداد
      sendResponse({ summary: summary });
    });

    // العودة false للإشارة إلى أن الرد سيتم إرساله لاحقًا (asynchronous)
    return true;
  }
});

// دالة لاستخراج معرف الفيديو من رابط الفيديو
function extractVideoId(videoUrl) {
  // قم بتنفيذ العملية اللازمة لاستخراج معرف الفيديو من رابط الفيديو
  // وقم بإرجاع معرف الفيديو المستخرج
}

// دالة لاستخراج نص الترجمة من صفحة الفيديو
function extractTranscript() {
  // قم بتنفيذ العملية اللازمة لاستخراج نص الترجمة من صفحة الفيديو
  // وقم بإرجاع نص الترجمة المستخرج
}

// دالة لإرسال المعلومات إلى السيرفر
function sendToServer(videoId, transcript, callback) {
  // قم بإعداد الطلب إلى السيرفر مع المعلومات المستخرجة
  // وقم بإرسال الطلب باستخدام طريقة POST عبر Ajax أو fetch
  // في استجابة السيرفر، استدعِ الدالة callback وقم بتمرير الملخص
}

/////////////////////////////////////////////


// محاولة استدعاء المتغير ytInitialPlayerResponse قد لا تعمل هذه الطريقة لان الكروم يمنع اخذ معلومات من سكربت الصفحة 

// في ملف background.js
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // chrome.tabs.executeScript(tabs[0].id, { code: "window['ytInitialPlayerResponse']" }, function (results) {
  //   const ytInitialPlayerResponse = results[0];
  //   // قم بإرسال ytInitialPlayerResponse إلى السيرفر هنا
  // });
});
 
// chrome.runtime.sendMessage({ ytInitialPlayerResponse }, function (response) {
//   console.log(response);
// });


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.ytInitialPlayerResponse) {
    // قم بمعالجة القيمة المستلمة هنا
    console.log(message.ytInitialPlayerResponse);
  }
});

// في ملف background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const videoId = message.videoId;
  if (videoId) {
    fetchSummaryFromServer(videoId, function(summary) {
      console.log('الملخص:', summary);
      console.log('id:', videoId);
      // يمكنك تحديد الإجراءات اللازمة لعرض الملخص في واجهة الامتداد هنا
    });
  }
});

function fetchSummaryFromServer(videoId, callback) {
  // قم بتنفيذ طلب للسيرفر لاستخراج الـ transcript واحصل على الملخص
  // في هذا المثال، يتم استخدام محاكي بسيط للسيرفر
  const summary = 'هذا هو ملخص الفيديو الخاص بك.';
  callback(summary);
}
