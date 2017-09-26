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

export const METADATA_FIELDS = ['metadata'];
export const REQUIRED_FIELDS = ['id'];
export const SUMMARY_FIELD = 'summary';
export const CONTENT_FIELD = 'content';
export const CARD_FACE_METADATA = 'metadata';
export const CARD_FACE_PREVIEW = 'preview';

/**
 * White list of HTML tags allowed in either the content or summary
 * @type {string[]}
 */
export const HTML_WHITELIST_STANDARD = [
    'A', 'ABBR', 'ACRONYM', 'ADDRESS', 'AREA', 'ARTICLE', 'ASIDE',
    'B', 'BDI', 'BDO', 'BLOCKQUOTE', 'BR',
    'CAPTION', 'CITE', 'CODE', 'COL', 'COLGROUP',
    'DD', 'DEL', 'DETAILS', 'DFN', 'DIV', 'DL', 'DT',
    'EM',
    'FIGCAPTION', 'FIGURE', 'FONT', 'FOOTER',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'HTML',
    'I', 'INS',
    'LEGEND', 'LI', 'LINK',
    'MAIN', 'MAP',
    // We probably don't want navigation, but it's also probably mostly harmless
    // 'NAV',
    'OL',
    'P', 'PRE',
    'SECTION', 'SMALL', 'SOURCE', 'SPAN', 'STRONG', 'STYLE', 'SUB', 'SUMMARY', 'SUP',
    'TABLE', 'TBODY', 'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TIME', 'TR',
    'U', 'UL',
    'VAR',
];

/**
 * White list of HTML tags, for media, which are allowed only in the content
 * @type {string[]}
 */
export const HTML_WHITELIST_MEDIA = [
    'IMG',
    'PICTURE',
    'SVG',
    'VIDEO'
];

export const HTML_WHITELIST_SUMMARY = HTML_WHITELIST_STANDARD;
export const HTML_WHITELIST_CONTENT = HTML_WHITELIST_STANDARD.concat(HTML_WHITELIST_MEDIA);
export const WRAP_HEIGHT_FACTOR = 1.25;
export const FLIP_ANIMATION_DURATION = 317; // 300 ms from CSS plus one frame

/**
 * Default visual settings
 */
export const DEFAULT_VISUAL_SETTINGS = {
    presentation: {
        borderStyle: 'border',
        dateFormat: 'MMM D, YYYY',
        separator: ' \u2022 ',
    },
    flipState: {
        enableFlipping: true,
        cardFaceDefault: CARD_FACE_PREVIEW,
    },
    loadMoreData: {
        enabled: false,
        limit: 500
    },
};
