/*
 * Copyright 2017 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Hash a string, such as a domain, into one of 256 shades of gray.
 * @param {String} str - arbitrary string to hash into a grey shade
 * @param {Number=} min - optional lower bound for the grey value
 * @param {Number=} max - optional upper bound for the grey value
 * @returns {number|*} A shade of grey in the range [min|0, max|255]
 * @static
 */
export function grayShadeFromString(str, min, max) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color32bit = (hash & 0xFFFFFF);
    let r = (color32bit >> 16) & 255;
    let g = (color32bit >> 8) & 255;
    let b = color32bit & 255;

    /* clamp the colors */
    if (min !== undefined) {
        r = Math.max(r, min);
        g = Math.max(g, min);
        b = Math.max(b, min);
    }

    if (max !== undefined) {
        r = Math.min(r, max);
        g = Math.min(g, max);
        b = Math.min(b, max);
    }

    return Math.floor((r + g + b) / 3);
}

/**
 * Generate a Data URL encoding a grey single-letter icon.
 * @param {Number} width - width of the icon in pixels
 * @param {Number} height - height of the icon in pixels
 * @param {String} sourceName - string to create an icon for;
 * the first character becomes the icon's letter and the string as a whole gets hashed into a grey shade
 * @returns {string} Data URL encoding an icon image
 * @static
 */
export function createFallbackIconURL(width, height, sourceName) {
    /* get the gray shade for the background */
    let channel = grayShadeFromString(sourceName, 0, 102);

    /* initialize an offscreen canvas */
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    /* draw the background */
    context.fillStyle = 'rgb(' + channel + ',' + channel + ',' + channel + ')';
    context.fillRect(0, 0, width, height);

    /* make the channel brighter for the text */
    channel = Math.floor(channel * 2.5);
    context.fillStyle = 'rgb(' + channel + ',' + channel + ',' + channel + ')';

    /* draw the text */
    const letter = sourceName[0].toUpperCase();
    context.font = Math.round(height * 0.7) + 'px helvetica';
    context.fontWeight = 'bolder';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(letter, width * 0.5, height * 0.5);

    return canvas.toDataURL();
}

/**
 * Load one image from the given URL.
 * @param {String} url - Address of the image
 * @returns {Promise}
 */
export function loadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = url;
    });
}
