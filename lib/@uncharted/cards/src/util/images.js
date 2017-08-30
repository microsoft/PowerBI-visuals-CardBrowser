import $ from 'jquery';

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
    const $img = $('<img/>').attr('src', url);
    return new Promise(resolve => {
        $img.on('load', () => {
            $img.remove();
            resolve($img[0]);
        });
    });
}
