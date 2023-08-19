"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const Transcript_1 = __importDefault(require("./entities/Transcript"));
const Caption_1 = __importDefault(require("./entities/Caption"));
dotenv_1.default.config();
const source = new typeorm_1.DataSource({
    // @ts-ignore
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    // @ts-ignore
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [
        Transcript_1.default,
        Caption_1.default
    ],
    synchronize: true
});
exports.default = source;
