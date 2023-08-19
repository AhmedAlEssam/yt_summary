"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("@decorators/express");
// import Modules(entities)
const Transcript_1 = __importDefault(require("../entities/Transcript"));
const Caption_1 = __importDefault(require("../entities/Caption"));
// include puppeteer lib which will simulate opening youtube page and extract captions
const puppeteer = require('puppeteer');
//axios and xml2js required to handle caption request and response
const axios = require('axios');
const { parseString } = require('xml2js');
// import { SummarizationPipeline } from '@huggingface/transformers';
const typeorm_1 = require("typeorm");
//
// import { HfInference } from "npm:@huggingface/inference"
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const HfAccessToken = process.env.HF_HF_ACCESS_TOKEN;
// const summarizer = pipeline("summarization", "facebook/bart-large-cnn");
//@ts-ignore
const inference_1 = require("@huggingface/inference");
const hf = new inference_1.HfInference(HfAccessToken);
let mainController = class mainController {
    getTranscript(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.params.videoID && req.params.videoID != null) {
                let videoID = String(req.params.videoID);
                let summary = '';
                console.log(videoID); //////////////////////////// to be deleted 
                // check if the linke has been handeled before to reduce proccessing 
                let transcript;
                transcript = yield Transcript_1.default.findOneBy({ eid: videoID });
                // if (!transcript) {
                if (1) {
                    // creat new data entery to the new link
                    transcript = new Transcript_1.default();
                    transcript.eid = videoID;
                    let newDate = new Date();
                    transcript.expireDate = newDate;
                    transcript.lastEdit = newDate;
                    transcript.url = 'https://www.youtube.com/watch?v=' + videoID;
                    transcript.save();
                    let ENGFlag = false; // used to detrmine if the video has english caption
                    // start puppeteer to open the video link in browser in backend
                    puppeteer.launch({
                        // below parameters for development only
                        // devtools: true,
                        // defaultViewport: {
                        //   width: 1280,
                        //   height: 1024,
                        // },
                        headless: false // this will make opening page visable to developer in server side, if true it will be silent mode (hidden)
                    }).then((browser) => __awaiter(this, void 0, void 0, function* () {
                        // open new browser page
                        const page = yield browser.newPage();
                        // redirect to video link and wait page to complete loadiing
                        yield page.goto(transcript.url, {
                            waitUntil: "domcontentloaded",
                        });
                        // trying to retrive a variable from video page containes a lot of usfel detail like captions links
                        const ytInitialPlayerResponse = yield page.evaluate(() => {
                            // @ts-ignore
                            if (window.ytInitialPlayerResponse)
                                // @ts-ignore
                                return window.ytInitialPlayerResponse;
                            else
                                return null;
                        });
                        // console.log(ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks);
                        let tracks = '';
                        // if the video doesn't contain any caption it will be flaged as noCaption video and will respond to extention with this prompt
                        // this funking line keeps spitting expectations, it should be handled with try catch
                        try {
                            if ('captions' in ytInitialPlayerResponse && 'playerCaptionsTracklistRenderer' in ytInitialPlayerResponse.captions && 'captionTracks' in ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer) {
                                tracks = ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
                            }
                            else {
                                transcript.noCaption = true;
                                console.log('no1');
                                transcript.save();
                            }
                        }
                        catch (error) {
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
                            let videoDescription = '', ownerChannelName, ownerProfileUrl, publishDate, videoTitle, author, keywords, viewCount, lengthSeconds;
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
                        }
                        catch (error) {
                            console.log("error: ", error);
                        }
                        // loop through all captions and provided langs and save it to database
                        tracks.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            // console.log(element);                  // (for test) to be deleted
                            let newcaption = new Caption_1.default(); // creat new caption DB entry for each caption
                            newcaption.transcript = transcript; // link to transcript table ManyToOne
                            newcaption.lang = element.name.simpleText; // save any useful detail for current caption like in which Lang this one
                            newcaption.baseUrl = element.baseUrl;
                            // console.log(element.name.simpleText);      // to be deleted, this to copy each language spacific name
                            newcaption.languageCode = element.languageCode;
                            //requist hte caption data using provided link in variable detailes, this will response with XML type data
                            axios.get(element.baseUrl)
                                //@ts-ignore
                                .then((urlResponse) => __awaiter(this, void 0, void 0, function* () {
                                newcaption.captions_row_data = urlResponse.data; // save response to database without changing in case we need it in future 
                                const xmlData = urlResponse.data;
                                parseString(xmlData, (err, result) => __awaiter(this, void 0, void 0, function* () {
                                    if (err) {
                                        console.error('Error parsing XML:', err);
                                        return;
                                    }
                                    const jsonResult = result.transcript.text;
                                    let modifide = '';
                                    yield jsonResult.forEach((elem) => {
                                        modifide = modifide + ' ' + elem['_'];
                                    });
                                    //   console.log(modifide);
                                    modifide = modifide.replace(/\s+/g, ' ');
                                    modifide = modifide.replace(/&#39;/g, "'");
                                    newcaption.modifide_caption = modifide;
                                    let allowed = ['English (auto-generated)', 'English (United Kingdom)', 'English (United States)', 'English'];
                                    if (allowed.includes(element.name.simpleText)) {
                                        ENGFlag = true;
                                    }
                                }));
                                newcaption.save();
                                // console.log(rows); 
                            }))
                                .catch((error) => {
                                console.log("error: ", error);
                            });
                            newcaption.summary = 'element';
                            summary = newcaption.summary;
                            // newcaption.captionsExp=element. 
                        }));
                        yield browser.close();
                        // .then().catch((error: any) => {
                        //     console.log("error: ", error);
                        // });
                        if (!ENGFlag) {
                            transcript.noEnglish = true;
                        }
                    }));
                }
                else {
                    console.log('done');
                    // let caption = await Caption.findOneBy({ transcript: transcript })
                    // res.send('newcaption.summary');
                }
                // let enCaption = await Caption.findOneBy({ transcript: transcript, lang: ['English', 'English (United Kingdom)', 'English (United States)', 'English (auto-generated)'] }); 
                let Eid = transcript.eid;
                transcript = yield Transcript_1.default.findOne({ where: { eid: Eid } });
                const acceptedLanguages = ['English', 'English (United Kingdom)', 'English (United States)', 'English (auto-generated)'];
                console.log(transcript);
                console.log(acceptedLanguages);
                let enCaption = yield Caption_1.default.findOne({
                    where: {
                        transcript: transcript.id,
                        lang: (0, typeorm_1.In)(acceptedLanguages)
                    }
                });
                // if (enCaption)
                //@ts-ignore
                console.log(enCaption.modifide_caption);
                const ARTICLE = "...";
                let sum = yield hf.summarization({
                    model: 'facebook/bart-large-cnn',
                    //@ts-ignore
                    inputs: enCaption.modifide_caption,
                    parameters: {
                        max_length: 100
                    }
                });
                console.log('//////////////////////////////////////');
                console.log(sum.summary_text);
                console.log('done summary');
                res.json(sum.summary_text);
                // summarizer(ARTICLE, { max_length: 130, min_length: 30, do_sample: false })
                //     .then((summarized_text: string) => {
                //         console.log(summarized_text);
                //     })
                //     .catch((error: any) => {
                //         console.error(error);
                //     });
                // return res.send(summary);
            }
            else {
                // res.status(404);
                return;
            }
            // res.json('dsvdfv')
            return;
        });
    }
};
__decorate([
    (0, express_1.Post)('/:videoID'),
    __param(0, (0, express_1.Req)()),
    __param(1, (0, express_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], mainController.prototype, "getTranscript", null);
mainController = __decorate([
    (0, express_1.Controller)('/summary')
], mainController);
exports.default = mainController;
