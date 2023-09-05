//path: YT-Summary/src/controllers/mainController.ts
/**
* YTSummary
*
* An open-source Open Source AI extension tool with Backend Based on Typescript Node.js, express & Typeorm
*
* This content is released under the MIT License (MIT)
*
* Copyright (c) 2017 - 2023, Mawazen.co for Technology
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*
* @package	YTSammury
* @author	Ahmed AL-Essam
* @copyright	Copyright (c) 2017 - 2023, Mawazen, Inc. (https://mawazen.co/)
* @license	http://opensource.org/licenses/MIT	MIT License
* @link	https://mawazen.co/YTSummary
* @since	Version 1.0.0
* @filesource
*/
/*
*---------------------------------------------------------------
* MAIN CONTROLLER
*---------------------------------------------------------------
* This file contains Main Controller that will handle extension requests, extract Captions, Modifiedit and Prepare a Summary as a response
*
* Include decorators and express libraries needed to use it as a framework
*
*/

import { Controller, Post, Req, Res } from "@decorators/express";
import { Response, Request } from "express";
// import Modules(entities)
import Transcript from "../entities/Transcript";
import Caption from "../entities/Caption";
// include puppeteer lib which will simulate opening a youtube page and extracting captions
const puppeteer = require('puppeteer');
//Axios and xml2js are required to handle caption responses
const axios = require('axios');
const { parseString } = require('xml2js');
// import configuration variables
import dotenv from 'dotenv';
dotenv.config();
const HfAccessToken = process.env.HF_HF_ACCESS_TOKEN
// include libraries needed to use huggingface
import { HfInference } from '@huggingface/inference'; //, SummarizationInputs, QuestionAnsweringInputs, TextGenerationInputs
const hf = new HfInference(HfAccessToken)
// alternative way to reach parameters in the page, we may don't use it, this line and file will be deleted
import ytDOM from "./ytDOM";
@Controller('/summary')
export default class mainController {
    @Post('/:videoID')
    async getTranscript(@Req() req: Request, @Res() res: Response) {
        if (req.params.videoID && req.params.videoID != null) {
            let videoID = String(req.params.videoID);
            console.log('1-Start Prossesing requist for vide ID:' + videoID);
            //Check if the link has been handled before to reduce processing
            let transcript: any;
            transcript = await Transcript.findOneBy({ eid: videoID });
            if (!transcript) {
                console.log('2-New BD Entry');
                transcript = new Transcript();
                transcript.eid = videoID;
                let newDate = new Date();
                transcript.expireDate = newDate;
                transcript.lastEdit = newDate;
                transcript.url = 'https://www.youtube.com/watch?v=' + videoID;
                transcript.save();
                let ENGFlag = false;                // used to determine if the video has an English caption
                //Start puppeteer to open the video link in the browser in the backend
                await puppeteer.launch({
                    // below parameters for development only
                    // devtools: true,
                    // defaultViewport: {
                    // width: 1280,
                    // height: 1024,
                    // },
                    headless: false                 //This will make the opened page visible to the developer on the server side, if true it will be in silent mode (hidden)
                }).then(async (browser: any) => {
                    //Open a new browser page
                    const page = await browser.newPage();
                    // redirect to the video link and wait for the page to complete loading
                    await page.goto(transcript.url, {
                        waitUntil: "domcontentloaded",
                    });
                    // trying to retrive a variable from the video page contains a lot of helpful detail like captions links
                    const configs = await page.evaluate(() => {
                        // @ts-ignore
                        if (window.ytInitialPlayerResponse)
                            // @ts-ignore
                            return window.ytInitialPlayerResponse;
                        else
                            console.log('variable (ytInitialPlayerResponse) NOT FOUND. ');

                        return null;
                    });
                    await browser.close();
                    let tracks: any = '';
                    //If the video doesn't contain any caption it will be flagged as noCaption video and will respond to extension with this prompt (The video has no Caption)
                    //This funking line keeps spitting expectations, it should be handled with try-catch
                    try {
                        if ('captions' in configs && 'playerCaptionsTracklistRenderer' in configs.captions && 'captionTracks' in configs.captions.playerCaptionsTracklistRenderer) {
                            tracks = configs.captions.playerCaptionsTracklistRenderer.captionTracks;
                        } else {
                            transcript.noCaption = true;
                            console.log('The video has no Caption');
                            transcript.save();
                        }
                    } catch (error) {
                        console.log("error: ", error);
                        transcript.noCaption = true;
                        transcript.save();
                        console.log('The video has no Caption with error ');
                    }
                    if (transcript.noCaption) {
                        res.send('The video has no Caption');
                        return;
                    }
                    var introduction = '';
                    // extract video description and other details in case we need it to give the text more detail and more meaning
                    try {
                        let videoDescription = '', ownerChannelName = '', ownerProfileUrl = '', publishDate = '', videoTitle = '', author = '', keywords = '', viewCount = '', lengthSeconds = '';

                        if (configs.microformat.playerMicroformatRenderer && configs.microformat.playerMicroformatRenderer.description.simpleText) {
                            videoDescription = configs.microformat.playerMicroformatRenderer.description.simpleText;
                            if (configs.microformat.playerMicroformatRenderer.title.simpleText) {
                                videoTitle = configs.microformat.playerMicroformatRenderer.title.simpleText;
                                introduction += 'the following transcript is extracted from a youtube video to be summarized, the video has the title " ' + videoTitle + '" and the description\n (" ' + videoDescription + ' ") ';
                            }
                            if (configs.microformat.playerMicroformatRenderer.ownerChannelName) {
                                ownerChannelName = configs.microformat.playerMicroformatRenderer.ownerChannelName;
                                introduction += 'from a youtube channel with the name " ' + ownerChannelName + ' "'; // this line need to be fixed and exchange it with the channel name
                            }
                            if (configs.microformat.playerMicroformatRenderer.lengthSeconds) {
                                lengthSeconds = configs.microformat.playerMicroformatRenderer.lengthSeconds;
                            }
                            if (configs.microformat.playerMicroformatRenderer.ownerProfileUrl) {
                                ownerProfileUrl = configs.microformat.playerMicroformatRenderer.ownerProfileUrl;
                            }
                            if (configs.microformat.playerMicroformatRenderer.publishDate) {
                                publishDate = configs.microformat.playerMicroformatRenderer.publishDate;
                                introduction += ' published in " ' + publishDate + ' " ';
                            }

                            if (configs.videoDetails.author) {
                                author = configs.videoDetails.author;
                            }
                            if (configs.videoDetails.keywords) {
                                keywords = configs.videoDetails.keywords;
                                introduction += ' the video has the following keywords " ' + keywords + ' " and the following transcript need to be summrized ("';
                            }
                            if (configs.videoDetails.viewCount) {
                                viewCount = configs.videoDetails.viewCount;
                            }
                            introduction = introduction.replace(/\s+/g, ' ');
                            // console.log(videoDescription, ownerChannelName, ownerProfileUrl, publishDate, videoTitle, author, keywords, viewCount); // to be deleted
                            console.log(introduction);

                        }
                    } catch (error) {
                        console.log("error: ", error);
                    }
                    // loop through all captions and provided langs and save it to the database
                    for (const element of tracks) {
                        try {
                            let introFlag = false;
                            let newcaption = new Caption();                         // creat new caption DB entry for each caption
                            newcaption.transcript = transcript;                     // link to transcript table ManyToOne
                            newcaption.lang = element.name.simpleText;              // save any useful detail for the current caption like in which Lang this one
                            newcaption.baseUrl = element.baseUrl
                            newcaption.languageCode = element.languageCode;
                            console.log(newcaption.lang + ' Caption Found');

                            //request the caption data using the provided link in variables' details, this will respond with XML type data
                            const urlResponse = await axios.get(element.baseUrl);
                            newcaption.captions_row_data = urlResponse.data;        // save response to the database without changing in case we need it in future
                            const xmlData = urlResponse.data;
                            // convert XML data to JSON
                            await parseString(xmlData, async (err: any, result: any) => {
                                if (err) {
                                    console.error('Error parsing XML:', err);
                                    return;
                                }
                                const jsonResult = result.transcript.text;
                                let modified = '';
                                if (introFlag)
                                    modified = introduction;
                                await jsonResult.forEach((elem: any) => {
                                    modified += ' ' + elem['_'];
                                });
                                // console.log(modifide);
                                modified = modified.replace(/\s+/g, ' ');
                                modified = modified.replace(/&#39;/g, "'");
                                modified = modified.replace(/&quot;/g, '"');
                                newcaption.modifide_caption = modified + '")';
                                let allowed = ['English','English - en','English (auto-generated)', 'English (United Kingdom)', 'English (United States)', 'Arabic']
                                if (allowed.includes(element.name.simpleText)) {
                                    ENGFlag = true;
                                }
                            });
                            await newcaption.save();
                        } catch (error) {
                            console.log("error: ", error);
                        }
                    }
                    transcript = await Transcript.findOneBy({ eid: videoID });
                    console.log(transcript.id + 'fjhfh');

                    if (!ENGFlag) {
                        transcript.noEnglish = true;
                        await transcript.save()
                    }
                    await summarize(transcript)
                });
            }
            else {
                await summarize(transcript);
            }
            async function summarize(transcript: any) {
                let tid = transcript.id;
                console.log(tid);
                // transcript = await Transcript.findOne({ where: { eid: Eid } })
                const acceptedLanguages = ['English','English - en','English (auto-generated)', 'English (United Kingdom)', 'English (United States)', 'Arabic'];
                console.log(transcript);
                console.log(acceptedLanguages);
                let enCaption: any = '';

                enCaption = await Caption.createQueryBuilder("caption")
                    .where("caption.transcript = :transcriptId", { transcriptId: transcript.id })
                    .andWhere("caption.lang IN (:...acceptedLanguages)", { acceptedLanguages })
                    .getOne()
                    .then(async (enCaption) => {
                        if (enCaption) {
                            if (!enCaption.summary) {
                                console.log(enCaption.id);
                                console.log(enCaption.modifide_caption);
                                let sum = await hf.summarization({
                                    model: 'facebook/bart-large-cnn',
                                    //@ts-ignore
                                    inputs: enCaption.modifide_caption,
                                    parameters: {
                                        max_length: 200
                                    }
                                });
                                enCaption.summary = sum.summary_text;
                                await enCaption.save();
                            }

                            console.log('//////////////////////////////////////');
                            console.log(enCaption.summary);
                            console.log('done summary');
                            res.json(enCaption.summary);
                        } else {
                            console.log(" Caption is null or English not found");
                            res.json(" Caption is null or English not found");
                        }
                    });
            }
        }
        else {
            res.status(404);
            return
        }
        // res.json('dsvdfv')
        return
    }
}