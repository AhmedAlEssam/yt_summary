// tested on https://www.youtube.com/watch?v=NFHDHcs4BvQ


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
import express from "express";
import "reflect-metadata";
import { attachControllers } from "@decorators/express";

/*
 *---------------------------------------------------------------
 * APP CONFIGURATION
 *---------------------------------------------------------------
 *
 * Set, include and initiate app configuration and environment
 *
*/

import dotenv from 'dotenv';         // Import the 'dotenv' library for loading environment variables from the .env file
import cors from "cors";             // Import the 'cors' middleware for handling Cross-Origin Resource Sharing (CORS)
const app = express();
app.use(express.json())
app.use(express.static('public'));   // Set to serve static files from the 'public' directory if needed
app.use(cors());
dotenv.config();                     // Load the environment variables from the .env file into the process.env object
const port = process.env.SERVER_PORT;// Retive the value of the 'SERVER_PORT' environment variable 

/*
 *---------------------------------------------------------------
 * DATABASE AND CONTROLLERS
 *---------------------------------------------------------------
 *
 * Include 'database' module and controllers
 *
*/
import database from "./database";
import mainController from "./controllers/mainController";

// Set function to launch the server  
const launch = async () => {
    // Asynchronously initialize the database and handle the result using promises
    await database.initialize().then(dataSource => {
        console.log(`The database connected successfully`);
    }).catch(error => {
        console.log(error);
    });

    // Attach the controllers defined in the array to the 'app' Express.js application
    await attachControllers(app, [mainController]);

    // Start the server and listen on the specified 'port'
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

// Call the launch function to start the server
launch();
