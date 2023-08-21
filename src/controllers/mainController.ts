/**
* YTSummary
*
* An open source Open Source AI extention tool wtith Backend Based on Typescript Node.js,express & Typeorm
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
* This file contain Main Controller that will handle extention request, extract Captions, Modefied it and Prepare Summary as response
*
* Include decorators, express libraries needed to use it as freamwork
*
*/
//path: YT-Summary/src/controllers/mainController.ts
import { Controller, Post, Req, Res } from "@decorators/express";
import { Response, Request } from "express";
// import Modules(entities)
import Transcript from "../entities/Transcript";
import Caption from "../entities/Caption";
// include puppeteer lib which will simulate opening youtube page and extract captions
const puppeteer = require('puppeteer');
//axios and xml2js required to handle caption request and response
const axios = require('axios');
const { parseString } = require('xml2js');
// include libraries needed to use huggingface
import dotenv from 'dotenv';
dotenv.config();
import { HfInference } from '@huggingface/inference'; //, SummarizationInputs, QuestionAnsweringInputs, TextGenerationInputs
const HfAccessToken = process.env.HF_HF_ACCESS_TOKEN
const hf = new HfInference(HfAccessToken)
import { Repository, EntityRepository, getRepository, In } from "typeorm";
// altrnative way te reach parampeters in page we may don't use it and this line and file will be deleted
import ytDOM from "./ytDOM";
@Controller('/summary')
export default class mainController {
    @Post('/:videoID')
    async getTranscript(@Req() req: Request, @Res() res: Response) {
        if (req.params.videoID && req.params.videoID != null) {
            let videoID = String(req.params.videoID);
            console.log(videoID); //////////////////////////// to be deleted
            // check if the linke has been handeled before to reduce proccessing
            let transcript: any;
            transcript = await Transcript.findOneBy({ eid: videoID });
            if (!transcript) {
                // if (1) {
                // creat new data entery to the new link
                transcript = new Transcript();
                transcript.eid = videoID;
                let newDate = new Date();
                transcript.expireDate = newDate;
                transcript.lastEdit = newDate;
                transcript.url = 'https://www.youtube.com/watch?v=' + videoID;
                transcript.save();
                let ENGFlag = false; // used to detrmine if the video has english caption
                // start puppeteer to open the video link in browser in backend
                await puppeteer.launch({
                    // below parameters for development only
                    // devtools: true,
                    // defaultViewport: {
                    // width: 1280,
                    // height: 1024,
                    // },
                    headless: false // this will make opening page visable to developer in server side, if true it will be silent mode (hidden)
                }).then(async (browser: any) => {
                    // open new browser page
                    const page = await browser.newPage();
                    // redirect to video link and wait page to complete loadiing
                    await page.goto(transcript.url, {
                        waitUntil: "domcontentloaded",
                    });
                    // trying to retrive a variable from video page containes a lot of usfel detail like captions links
                    const ytInitialPlayerResponse = await page.evaluate(() => {
                        // @ts-ignore
                        if (window.ytInitialPlayerResponse)
                            // @ts-ignore
                            return window.ytInitialPlayerResponse;
                        else
                            return null;
                    });
                    await browser.close();
                    // console.log(ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks);
                    let tracks: any = '';
                    // if the video doesn't contain any caption it will be flaged as noCaption video and will respond to extention with this prompt
                    // this funking line keeps spitting expectations, it should be handled with try catch
                    try {
                        if ('captions' in ytInitialPlayerResponse && 'playerCaptionsTracklistRenderer' in ytInitialPlayerResponse.captions && 'captionTracks' in ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer) {
                            tracks = ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
                        } else {
                            transcript.noCaption = true;
                            console.log('no1');
                            transcript.save();
                        }
                    } catch (error) {
                        console.log("error: ", error);
                        transcript.noCaption = true;
                        transcript.save();
                        console.log('no subtitle');
                    }
                    if (transcript.noCaption) {
                        console.log('nop');
                        // res.send('no subtitle');
                        return;
                    }
                    try {
                        // extract video description and other detailes in case we need it to give the text more detail and more meaning
                        let videoDescription: any = '', ownerChannelName, ownerProfileUrl, publishDate, videoTitle, author, keywords, viewCount, lengthSeconds;
                        if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer && ytInitialPlayerResponse.microformat.playerMicroformatRenderer.description.simpleText) {
                            videoDescription = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.description.simpleText;
                            if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer.ownerChannelName)
                                ownerChannelName = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.ownerChannelName;
                            if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer.lengthSeconds)
                                lengthSeconds = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.lengthSeconds;
                            if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer.ownerProfileUrl)
                                ownerProfileUrl = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.ownerProfileUrl;
                            if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer.publishDate)
                                publishDate = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.publishDate;
                            if (ytInitialPlayerResponse.microformat.playerMicroformatRenderer.simpleText)
                                videoTitle = ytInitialPlayerResponse.microformat.playerMicroformatRenderer.title.simpleText;
                            if (ytInitialPlayerResponse.videoDetails.author)
                                author = ytInitialPlayerResponse.videoDetails.author;
                            if (ytInitialPlayerResponse.videoDetails.keywords)
                                keywords = ytInitialPlayerResponse.videoDetails.keywords;
                            if (ytInitialPlayerResponse.videoDetails.viewCount)
                                viewCount = ytInitialPlayerResponse.videoDetails.viewCount;
                            // console.log(videoDescription, ownerChannelName, ownerProfileUrl, publishDate, videoTitle, author, keywords, viewCount); // to be deleted
                        }
                    } catch (error) {
                        console.log("error: ", error);
                    }
                    // loop through all captions and provided langs and save it to database
                    // await tracks.forEach(async (element: any) => {
                    for (const element of tracks) {
                        try {
                            // console.log(element); // (for test) to be deleted
                            let newcaption = new Caption(); // creat new caption DB entry for each caption
                            newcaption.transcript = transcript; // link to transcript table ManyToOne
                            newcaption.lang = element.name.simpleText; // save any useful detail for current caption like in which Lang this one
                            newcaption.baseUrl = element.baseUrl
                            // console.log(element.name.simpleText); // to be deleted, this to copy each language spacific name
                            newcaption.languageCode = element.languageCode;
                            //requist hte caption data using provided link in variable detailes, this will response with XML type data
                            const urlResponse = await axios.get(element.baseUrl);
                            newcaption.captions_row_data = urlResponse.data; // save response to database without changing in case we need it in future
                            const xmlData = urlResponse.data;
                            await parseString(xmlData, async (err: any, result: any) => { // convert XML data to JSON
                                if (err) {
                                    console.error('Error parsing XML:', err);
                                    return;
                                }
                                const jsonResult = result.transcript.text;
                                let modifide = '';
                                await jsonResult.forEach((elem: any) => {
                                    modifide += ' ' + elem['_'];
                                });
                                // console.log(modifide);
                                modifide = modifide.replace(/\s+/g, ' ');
                                modifide = modifide.replace(/&#39;/g, "'");
                                newcaption.modifide_caption = modifide;
                                let allowed = ['English (auto-generated)', 'English (United Kingdom)', 'English (United States)', 'English']
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
                    // await summarize(transcript)
                });
            }
            else {
                await summarize(transcript);
            }
            async function summarize(transcript: any) {
                let tid = transcript.id;
                console.log(tid);
                // transcript = await Transcript.findOne({ where: { eid: Eid } })
                const acceptedLanguages = ['English', 'English (United Kingdom)', 'English (United States)', 'English (auto-generated)'];
                console.log(transcript);
                console.log(acceptedLanguages);
                let enCaption: any = '';


                // enCaption = await Caption.findOne({
                //     where: {
                //         transcript: transcript.id,
                //         lang: In(acceptedLanguages)
                //     }
                // })
                // enCaption = await Caption.findOne({
                //     where: {
                //         transcript: transcript.id
                //     }
                // }).andWhere("lang IN (:...acceptedLanguages)", { acceptedLanguages })
                enCaption = await Caption.createQueryBuilder("caption")
                    .where("caption.transcript = :transcriptId", { transcriptId: transcript.id })
                    .andWhere("caption.lang IN (:...acceptedLanguages)", { acceptedLanguages })
                    .getOne()
                    .then(async (enCaption) => {
                        //@ts-ignore
                        console.log(enCaption.id);

                        let abc = await enCaption;
                        if (enCaption) {
                            console.log(enCaption.id);
                            console.log(enCaption.modifide_caption);
                            let sum = await hf.summarization({
                                model: 'facebook/bart-large-cnn',
                                //@ts-ignore
                                inputs: enCaption.modifide_caption,
                                parameters: {
                                    max_length: 100
                                }
                            });
                            enCaption.summary = sum.summary_text;
                            await enCaption.save();
                            console.log('//////////////////////////////////////');
                            console.log(sum.summary_text);
                            console.log('done summary');
                            res.json(sum.summary_text);
                        } else {
                            console.log("enCaption is null or not found");
                            res.json("enCaption is null or not found");
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