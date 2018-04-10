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

export const DEFAULT_CONFIG = {
    'inlineMode': true,
    'subtitleDelimiter': ' \u2022 ',
    'scrollToVerticalReaderDuration': 300,
    'inlineCardCenteringDuration': 300,
    'card.width': 200,
    'card.enableBoxShadow': false,
    'card.expandedWidth': 520,
    'card.disableFlipping': false,
    'card.displayBackCardByDefault': false,
    'card.disableLinkNavigation': false, // set to true if you plan to handle the THUMBNAIL_CLICK_LINK event
    'card.displayLargeImage': false, // false is actually more like 'auto'
    'verticalReader.height': 500,
    'readerContent.headerBackgroundColor': '#555',
    'readerContent.headerSourceLinkColor': '#fff',
    'readerContent.headerImageMaxWidth': 190,
    'readerContent.disableLinkNavigation': false, // set to true if you plan to handle the READER_CONTENT_CLICK_LINK event
    'readerContent.cropImages': true, // set to false to show entire image, even if portrait mode and tiny
};

export const EVENTS = {
    THUMBNAILS_CLICK_BACKGROUND: 'cards:clickBackground',
    THUMBNAIL_CLICK: 'card:click',
    THUMBNAIL_CLICK_LINK: 'card:clickLink',
    THUMBNAIL_EXPAND: 'card:expand',
    THUMBNAIL_SHRINK: 'card:shrink',
    INLINE_THUMBNAILS_VIEW_SCROLL_END: 'inlineCardsView:scrollEnd',
    WRAPPED_THUMBNAILS_VIEW_SCROLL_END: 'wrappedCardsView:scrollEnd',
    VERTICAL_READER_NAVIGATE_THUMBNAIL: 'verticalReader:navigateToCard',
    VERTICAL_READER_CLICK_BACKGROUND: 'verticalReader:clickBackground',
    READER_CONTENT_CLICK_CLOSE: 'readerContent:clickCloseButton',
    READER_CONTENT_CLICK_LINK: 'readerContent:clickLink',
};
