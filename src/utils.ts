/**
 * Copyright (c) 2017 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the 'Software'), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import DataView = powerbi.DataView;
import * as $ from 'jquery';

/**
 * Finds and returns the dataview column(s) that matches the given data role name.
 *
 * @param  {DataView} dataView     A Powerbi dataView object.
 * @param  {string}   dataRoleName A name of the role for the columen.
 * @param  {boolean}  multi        A boolean flag indicating whether to find multiple matching columns.
 * @return {any}                   A dataview table column or an array of the columns.
 */
export function findColumn(dataView: DataView, dataRoleName: string, multi?: boolean): any {
    const columns = dataView.metadata.columns;
    const result = (columns || []).filter((col: any) => col && col.roles[dataRoleName]);
    return multi
        ? (result[0] && result)
        : result[0];
}

/**
 * Check if provided dataView has all the columns with given data role names.
 *
 * @export
 * @param   {DataView} dataView      A Powerbi dataView object.
 * @param   {string[]} dataRoleNames An array of the data role names for corresponding columns.
 * @returns {boolean}                A Boolean value indicating whether the dataView has all matching columns.
 */
export function hasColumns(dataView: DataView, dataRoleNames: string[]): boolean {
    return dataRoleNames.reduce((prev, dataRoleName) => prev && findColumn(dataView, dataRoleName) !== undefined, true);
}

export function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
    return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

export function getWords(document) {
    return document.split(/\s+/);
}

/**
 * Remove all irrelevant characters.
 * Invalid characters are replaced with a whitespace
 * uses some code from https://stackoverflow.com/questions/7085454/extract-keyphrases-from-text-1-4-word-ngrams#7451243
 * @param {String} text 
 */
export function cleanText(text) {
    // RE pattern to select valid characters. Invalid characters are replaced with a whitespace
    const REallowedChars = /[^a-zA-Z]+/g;
    return text.replace(REallowedChars, " ").replace(/^\s+/, "").replace(/\s+$/, "").toLowerCase();
}

/**
 * Return a new array containing strings with all irrelevant characters removed.  
 * Invalid characters are replaced with a whitespace
 * uses some code from https://stackoverflow.com/questions/7085454/extract-keyphrases-from-text-1-4-word-ngrams#7451243
 * @param {Array<String>} textArray
 */
export function cleanTextArray(textArray) {
    const length = textArray.length;
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(cleanText(textArray[i]));
    }
    
    return result;
}