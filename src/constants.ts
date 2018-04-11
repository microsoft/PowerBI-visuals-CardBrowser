/*
 * Copyright 2018 Uncharted Software Inc.
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

export const METADATA_FIELDS = ['metadata'];
export const REQUIRED_FIELDS = ['id'];
export const SUMMARY_FIELD = 'summary';
export const CONTENT_FIELD = 'content';
export const IMAGE_FIELD = 'imageUrl';
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
export const WRAP_THRESHOLD = 400; // px
export const FLIP_ANIMATION_DURATION = 317; // 300 ms from CSS plus one frame
export const INFINITE_SCROLL_DELAY = 50;
export const MIN_CARD_WIDTH = 11;

/**
 * Default visual settings
 */
export const DEFAULT_VISUAL_SETTINGS = {
    presentation: {
        shadow: true,
        dateFormat: 'MMM D, YYYY',
        separator: ' \u2022 ',
        showImageOnBack: true,
        cardWidth: 200,
        filter: true,
        cropImages: true,
    },
    reader: {
        headerBackgroundColor: {
            solid: {
                color: '#373737',
            }
        },
        headerTextColor: {
            solid: {
                color: '#fff',
            }
        },
        width: 520,
        height: 500,
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
