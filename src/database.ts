/**
 * YTSummary
 *
 * An open source Open Source AI extention tool wtith Backend Based on Typescript Node.js,express & Typeorm
 *
 * This content is released under the MIT License (MIT)
 *
 * @package	YTSammury
 * @author	Ahmed AL-Essam
 * @copyright	Copyright (c) 2017 - 2023, Mawazen, Inc. (https://mawazen.co/) 
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://mawazen.co/YTSummary
 * @since	Version 1.0.0
 * @filesource
*/


// @ts-ignore
import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import Transcript from "./entities/Transcript";
import Caption from "./entities/Caption";
dotenv.config();


const source = new DataSource({
    // @ts-ignore
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    // @ts-ignore
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [
        Transcript,
        Caption

    ],
    synchronize: true
})

export default source;