
const axios = require('axios'); 

async function  ytDOM(browser:any,newTranscript:any,caption:any,videoID:string,page:any){
    try {

         
        await page.waitForSelector('h1.title');
        await page.waitForSelector('div#description');
        const buttonSelector = 'button.ytp-subtitles-button';
        await page.waitForSelector(buttonSelector);
        await page.click(buttonSelector); 

        // @ts-ignore
        page.on('response', response => {
            if (response.url().search("timedtext") > 1) {
                var dat = response.response;
                // console.log("response.url(): ", response.url());
                // console.log("response code: ", response.status());
                newTranscript.url = response.url()
                // console.log("response data: ", dat);
                try {
                    axios.get(response.url())
                        // @ts-ignore
                        .then(res => {
                            const captions = res.data;
                            // const transcripts = captions.map(item => item.snippet.language);
                            // console.log(captions.events);
                            // @ts-ignore
                            captions.events.forEach(element => {
                                if (element.segs)
                                    // @ts-ignore
                                    element.segs.forEach(el => {
                                        // console.log(el);
                                        caption += el.utf8;
                                    });
                                // return element.segs;
                            });
                            // console.log(caption); 
                        })
                        // @ts-ignore
                        .catch(error => {
                            console.log("error: ", error);
                        });
                } catch (e) {
                    console.log("eee: ", e);

                }
                // do something here
            }
        });
        
        new Promise(r => setTimeout(r, 3000));
        const settingsBtnSelector = 'button.ytp-settings-button';
        await page.waitForSelector(settingsBtnSelector);
        
        if ( page.click(settingsBtnSelector)) {
            
            console.log(' button Subtitles/CC pressed');
        } else {
            console.log("couldn't find button Subtitles/CC");
        }
        // const panel_1Selector = 'div.ytp-menuitem';
        // const panel_1 = await page.waitForSelector(panel_1Selector);
        // console.log(page.evaluate(panel_1));

        const subtitlesButton = await page.evaluate(() => { 
            var   panel_1 = document.getElementsByClassName('ytp-panel')
            // const panel1 = document.querySelector('div.ytp-menuitem');
            console.log("panel_1: ",panel_1);
            
            // @ts-ignore
            // const subtitleButton = Array.from(panel1.children[0].children).find(child =>
            //     // @ts-ignore
            //     child.textContent.includes('Subtitles/CC')
            // );
            for(var i=0;i<   panel_1[0].children[0].children.length;i++){
                // @ts-ignore
                if(panel_1[0].children[0].children[i].textContent.search("Subtitles/CC") == 0 )
                {
                    // @ts-ignore
                     panel_1[0].children[0].children[i].click()
                     console.log('clicked');
                     panel_1 = document.getElementsByClassName('ytp-panel')
                } 
            }
            
            var panel_2 = document.getElementsByClassName('ytp-panel-menu')
            console.log("panel_1: ",panel_1);
            console.log("panel_2: ",panel_2);
            
           var subtitleButton =''; 
            for(i=0;i<panel_1[0].children[1].children.length;i++){
                var pp = panel_1[0].children[1].children[i].textContent;
                console.log("pp: ",pp);
                

                if(  pp  &&  (pp != 'Off') && (pp !='Auto-translate' )){
                    console.log("pp: ",pp)
                    subtitleButton += pp;
                }
                    
            }
        
             
         
        return subtitleButton;
        });

       
        // const panel_1Selector = 'ytp-panel';
        // const panel_1 = await page.waitForSelector('div > .'+ panel_1Selector);
        // // await page.click(panel_1); 
        // page.evaluate(function() {
        //     return panel_1
        // }
        // ).then(function(result:any) { 
        //     console.log(result); 
        // });
        // console.log( panel_1);

        // for(var i=0;i<panel_1[0].children[0].children.length;i++){
        //     if(panel_1[0].children[0].children[i].textContent.search("Subtitles/CC") == 0 ){

        //         console.log(panel_1[0].children[0].children[i].textContent)
        //     }
        // }
        // var panel_1 = document.getElementsByClassName('ytp-panel')
        // var settingsBtn = document.getElementsByClassName('ytp-settings-button')[0]
        // استخراج عنوان الفيديو ووصفه من الصفحة
        // const videoTitle = await page.$eval('h1.title', (el) => el.innerText);
        // const videoDescription = await page.$eval('div#description', (el) => el.innerText);
        // console.log(videoTitle);
        // استخراج معرف الفيديو من رابط الصفحة الحالي
        const videoUrl = await page.url();
        console.log(videoUrl);
        const videoId = videoUrl.split('v=')[1];
        // setTimeout(() => {
        //     // console.log(videoTitle);
        // }, "10");
        const ytInitialPlayerResponse = await page.evaluate(() => {
            // @ts-ignore
            return window.ytInitialPlayerResponse;
        });
        // console.log(ytInitialPlayerResponse);
        const transcriptElement = await page.$('.transcript');
        // const transcript = await page.evaluate(element => element.textContent, transcriptElement);
        // console.log(transcript);

        const channelDescriptionElement = await page.$('.ytd-channel-about-metadata-renderer');
        // const channelDescription = await page.evaluate(element => element.textContent, channelDescriptionElement);

    } catch (err) {
        console.error("an error acured:", err);
    }

}

export default ytDOM;