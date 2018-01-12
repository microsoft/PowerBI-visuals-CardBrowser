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
    'inlineThumbnailCenteringDuration': 300,
    'thumbnail.width': 200,
    'thumbnail.enableBoxShadow': false,
    'thumbnail.expandedWidth': 520,
    'thumbnail.disableFlipping': false,
    'thumbnail.displayBackCardByDefault': false,
    'thumbnail.disableLinkNavigation': false, // set to true if you plan to handle the THUMBNAIL_CLICK_LINK event
    'verticalReader.height': 500,
    'readerContent.headerBackgroundColor': '#555',
    'readerContent.headerSourceLinkColor': '#fff',
    'readerContent.headerImageMaxWidth': 190,
    'readerContent.disableLinkNavigation': false, // set to true if you plan to handle the READER_CONTENT_CLICK_LINK event
};

export const EVENTS = {
    THUMBNAILS_CLICK_BACKGROUND: 'thumbnails:clickBackground',
    THUMBNAIL_CLICK: 'thumbnail:click',
    THUMBNAIL_CLICK_LINK: 'thumbnail:clickLink',
    THUMBNAIL_EXPAND: 'thumbnail:expand',
    THUMBNAIL_SHRINK: 'thumbnail:shrink',
    INLINE_THUMBNAILS_VIEW_SCROLL_END: 'inlineThumbnailsView:scrollEnd',
    WRAPPED_THUMBNAILS_VIEW_SCROLL_END: 'wrappedThumbnailsView:scrollEnd',
    VERTICAL_READER_NAVIGATE_THUMBNAIL: 'verticalReader:navigateToThumbnail',
    VERTICAL_READER_CLICK_BACKGROUND: 'verticalReader:clickBackground',
    READER_CONTENT_CLICK_CLOSE: 'readerContent:clickCloseButton',
    READER_CONTENT_CLICK_LINK: 'readerContent:clickLink',
};
