
export const DEFAULT_CONFIG = {
    'inlineMode': true,
    'subtitleDelimiter': ' \u2022 ',
    'scrollToVerticalReaderDuration': 300,
    'inlineThumbnailCenteringDuration': 300,
    'thumbnail.expandedWidth': 520,
    'thumbnail.disableFlipping': false,
    'thumbnail.displayBackCardByDefault': false,
    'verticalReader.height': 500,
    'readerContent.headerBackgroundColor': '#555',
    'readerContent.headerSourceLinkColor': '#fff',
};

export const EVENTS = {
    THUMBNAILS_CLICK_BACKGROUND: 'thumbnails:clickBackground',
    THUMBNAIL_CLICK: 'thumbnail:click',
    THUMBNAIL_EXPAND: 'thumbnail:expand',
    THUMBNAIL_SHRINK: 'thumbnail:shrink',
    VERTICAL_READER_NAVIGATE_THUMBNAIL: 'verticalReader:navigateToThumbnail',
    VERTICAL_READER_CLICK_BACKGROUND: 'verticalReader:clickBackground',
    READER_CONTENT_CLICK_CLOSE: 'readerContent:clickCloseButton',
};
