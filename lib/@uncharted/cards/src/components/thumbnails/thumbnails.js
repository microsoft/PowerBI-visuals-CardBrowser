import thumbnailsTemplate from './thumbnails.handlebars';
import Thumbnail from '../thumbnail/thumbnail';
import { IBindable, mapVerticalToHorizontalScroll, delayOnHorizontalToVerticalScrollingTransition, unMapVerticalToHorizontalScroll } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import VerticalReader from '../verticalReader/verticalReader';
import $ from 'jquery';

export default class Thumbnails extends IBindable {
    constructor(spec = {}) { // eslint-disable-line
        super();
        this.$element = $(thumbnailsTemplate());
        this._$thumbnailsContainer = this.$element.find('.thumbnails-container');
        this._$dummyThumbnails = this.$element.find('.dummy-thumbnail');
        this._config = Object.assign({}, DEFAULT_CONFIG, spec);

        this.thumbnailInstances = [];

        this.verticalReader = new VerticalReader();
        this.forward(this.verticalReader);
        this.inlineMode = this._config.inlineMode;
        this.inlineMode && this._mapVerticalToHorizontalScrolling();

        this._registerEvents();
    }

    get inlineMode() {
        return Boolean(this._isInlineMode);
    }

    set inlineMode(value) {
        this._isInlineMode = Boolean(value);
        this.$element.toggleClass('inline-mode', this._isInlineMode);
    }

    _registerEvents() {
        this.verticalReader.on(EVENTS.VERTICAL_READER_NAVIGATE_THUMBNAIL, thumbnail => this.scrollToVerticalReader(thumbnail.$element[0].offsetHeight, 0));
    }

    _appendThumbnails(thumbnailsData) {
        const thumbnailFragments = document.createDocumentFragment();
        thumbnailsData.forEach(data => {
            const thumbnail = new Thumbnail({ data, config: this._config });
            thumbnailFragments.appendChild(thumbnail.$element[0]);
            this.thumbnailInstances.push(thumbnail);
            this.forward(thumbnail);
        });
        this.verticalReader.updateThumbnailInstances(this.thumbnailInstances);
        this._$thumbnailsContainer.append(thumbnailFragments);
        this._$thumbnailsContainer.append(this._$dummyThumbnails);
    }

    _expandAndCenterThumbnail(thumbnail, scrollDuration) {
        const $thumbnail = thumbnail.$element;
        const thumbnailOffsetLeft = $thumbnail[0].offsetLeft;
        const previouslyExpandedThumbnail = this.thumbnailInstances.filter(thumbnailItem => thumbnailItem.isExpanded)[0];
        const previouslyExpandedThumbnailElement = previouslyExpandedThumbnail && previouslyExpandedThumbnail.$element[0];
        const expandedToNormalLeftOffsetDifference = previouslyExpandedThumbnailElement && previouslyExpandedThumbnailElement.offsetLeft < thumbnailOffsetLeft
            ? Math.max(previouslyExpandedThumbnailElement.offsetWidth - $thumbnail[0].offsetWidth, 0) // previously expanded thumbnail width is 0 if it's display property is none;
            : 0;
        previouslyExpandedThumbnail && previouslyExpandedThumbnail.shrink();
        thumbnail.expand();
        this.centerInlineThumbnail(thumbnail, scrollDuration, -expandedToNormalLeftOffsetDifference);
    }

    _mapVerticalToHorizontalScrolling() {
        mapVerticalToHorizontalScroll(this.$element);
        delayOnHorizontalToVerticalScrollingTransition(this.$element, '.uncharted-thumbnails-reader-content');
    }

    /**
     * Open the inline reader for the given thumbnail, and close any previously-open one.
     * @param {Object} thumbnail - thumbnail instance whose reader will be opened. 
     * @private
     */
    openInlineReader(thumbnail) {
        if (!thumbnail.isExpanded) {
            this._expandAndCenterThumbnail(thumbnail, this._config.inlineThumbnailCenteringDuration);
        }
    }

    clearThumbnails() {
        this.thumbnailInstances = [];
        this._$dummyThumbnails.detach();
        this._$thumbnailsContainer.empty();
        this.verticalReader.updateThumbnailInstances(this.thumbnailInstances);
    }

    loadData(thumbnailsData) {
        this.clearThumbnails();
        this._appendThumbnails(thumbnailsData);
    }

    loadMoreData(thumbnailsData) {
        this._appendThumbnails(thumbnailsData);
    }

    findThumbnailById(thumbnailId) {
        return this.thumbnailInstances.find(thumbnail => thumbnail.data.id === thumbnailId);
    }

    /**
     * Open a reader for the provided thumbnail
     * @param {Object} thumbnail - thumbnail instance whose reader will be opened. 
     */
    openReader(thumbnail) {
        this.inlineMode
            ? this.openInlineReader(thumbnail)
            : this.openVerticalReader(thumbnail);
    }

    closeReader() {
        this.inlineMode
            ? this.thumbnailInstances.forEach(thumbnail => thumbnail.shrink())
            : this.verticalReader.close();
    }

    toggleInlineDisplayMode() {
        this.closeReader();
        this.inlineMode = !this.inlineMode;
        this.inlineMode
            ? this._mapVerticalToHorizontalScrolling()
            : unMapVerticalToHorizontalScroll(this.$element);
    }

    updateReaderContent(thumbnail, readerContentData) {
        this.inlineMode
            ? thumbnail.updateReaderContent(readerContentData)
            : this.verticalReader.updateReaderContent(thumbnail, readerContentData);
    }

    /**
     * Scroll to the provided thumbnail and centers it.
     * @param {Object} thumbnail - A thumbnail to be centered.
     * @param {Number} duration - A number representing the duration of the centering animation in ms.
     * @param {Number} offset - Given thumbnail will be offset from the center by provided number.
     */
    centerInlineThumbnail(thumbnail, duration, offset) {
        if (!this.inlineMode) { return; }
        const $thumbnail = thumbnail.$element;
        const thumbnailOffsetLeft = $thumbnail[0].offsetLeft;
        const viewportWidth = this.$element[0].offsetWidth;
        const leftMargin = Math.max(viewportWidth - thumbnail.expandedWidth, 0) / 2;
        const scrollLeft = thumbnailOffsetLeft - leftMargin + (offset || 0);
        duration
            ? this.$element.animate({ scrollLeft: scrollLeft }, duration)
            : this.$element.scrollLeft(scrollLeft);
    }

    scrollToVerticalReader(offset = 0, duration = 0) {
        const $vReaderHolders = this.$element.find('.uncharted-thumbnails-reader-holder');
        const currentReaderHolderOffsetTop = this.verticalReader.$readerHolder[0].offsetTop;
        let scrollTop = currentReaderHolderOffsetTop - offset;
        if ($vReaderHolders[0].offsetTop < currentReaderHolderOffsetTop) {
            scrollTop -= this._config['verticalReader.height'];
        }
        this.$element.animate({scrollTop: scrollTop}, duration);
    }

    openVerticalReader(thumbnail) {
        if (this.inlineMode) { return; }
        this.verticalReader.open(thumbnail);
        this.scrollToVerticalReader(thumbnail.$element[0].offsetHeight, this._config.scrollToVerticalReaderDuration);
    }
}
