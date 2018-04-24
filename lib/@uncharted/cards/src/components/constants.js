/*
 * Copyright 2018 Uncharted Software Inc.
 */

export const DEFAULT_CONFIG = {
    'inlineMode': true,
    'subtitleDelimiter': ' \u2022 ',
    'scrollToVerticalReaderDuration': 300,
    'inlineCardCenteringDuration': 300,
    'card.width': 200,
    'card.height': 300,
    'card.enableBoxShadow': false,
    'card.expandedWidth': 520,
    'card.disableFlipping': false,
    'card.displayBackCardByDefault': false,
    'card.disableLinkNavigation': false, // set to true if you plan to handle the CARD_CLICK_LINK event
    'card.displayLargeImage': false, // false is actually more like 'auto'
    'verticalReader.height': 500,
    'readerContent.headerBackgroundColor': '#555',
    'readerContent.headerSourceLinkColor': '#fff',
    'readerContent.headerImageMaxWidth': 190,
    'readerContent.disableLinkNavigation': false, // set to true if you plan to handle the READER_CONTENT_CLICK_LINK event
    'readerContent.cropImages': true, // set to false to show entire image, even if portrait mode and tiny
};

export const EVENTS = {
    CARDS_CLICK_BACKGROUND: 'cards:clickBackground',
    CARD_CLICK: 'card:click',
    CARD_CLICK_LINK: 'card:clickLink',
    CARD_EXPAND: 'card:expand',
    CARD_SHRINK: 'card:shrink',
    INLINE_CARDS_VIEW_SCROLL_END: 'inlineCardsView:scrollEnd',
    WRAPPED_CARDS_VIEW_SCROLL_END: 'wrappedCardsView:scrollEnd',
    VERTICAL_READER_NAVIGATE_CARD: 'verticalReader:navigateToCard',
    VERTICAL_READER_CLICK_BACKGROUND: 'verticalReader:clickBackground',
    READER_CONTENT_CLICK_CLOSE: 'readerContent:clickCloseButton',
    READER_CONTENT_CLICK_LINK: 'readerContent:clickLink',
};
