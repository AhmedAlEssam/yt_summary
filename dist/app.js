"use strict";
// tested on https://www.youtube.com/watch?v=NFHDHcs4BvQ
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
 * YTSUMMARY SERVER SETUP
 *---------------------------------------------------------------
 *
 * Include main libraries needed to run the server as follow
 * express,
 * reflect-metadata needed to run typescript according to installation docs https://typeorm.io/#installation ,
 * decorators/express as freamwork
 *
*/
//path: YT-Summary/src/app.ts
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const express_2 = require("@decorators/express");
/*
 *---------------------------------------------------------------
 * APP CONFIGURATION
 *---------------------------------------------------------------
 *
 * Set, include and initiate app configuration and environment
 *
*/
const dotenv_1 = __importDefault(require("dotenv")); // Import the 'dotenv' library for loading environment variables from the .env file
const cors_1 = __importDefault(require("cors")); // Import the 'cors' middleware for handling Cross-Origin Resource Sharing (CORS)
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('public')); // Set to serve static files from the 'public' directory if needed
app.use((0, cors_1.default)());
dotenv_1.default.config(); // Load the environment variables from the .env file into the process.env object
const port = process.env.SERVER_PORT; // Retive the value of the 'SERVER_PORT' environment variable 
/*
 *---------------------------------------------------------------
 * DATABASE AND CONTROLLERS
 *---------------------------------------------------------------
 *
 * Include 'database' module and controllers
 *
*/
const database_1 = __importDefault(require("./database"));
const mainController_1 = __importDefault(require("./controllers/mainController"));
// Set function to launch the server  
const launch = () => __awaiter(void 0, void 0, void 0, function* () {
    // Asynchronously initialize the database and handle the result using promises
    yield database_1.default.initialize().then(dataSource => {
        console.log(`The database connected successfully`);
    }).catch(error => {
        console.log(error);
    });
    // Attach the controllers defined in the array to the 'app' Express.js application
    yield (0, express_2.attachControllers)(app, [mainController_1.default]);
    // Start the server and listen on the specified 'port'
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
// Call the launch function to start the server
launch();
