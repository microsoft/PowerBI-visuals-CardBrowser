import $ from 'jquery';
import verticalReaderTemplate from './verticalReader.handlebars';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class VerticalReader extends IBindable {
    constructor(spec = {}) {
        super();
        this.reset(spec);
    }

    reset(spec = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this._thumbnailInstances = [];
        return this;
    }

    get $readerHolder() {
        return this.$element.closest('.uncharted-thumbnails-reader-holder');
    }

    render() {
        this.$element = $(verticalReaderTemplate());
        this._registerDOMEvents();
        return this.$element;
    }

    _registerDOMEvents() {
        this.$element.on('transitionend', event => {
            const originalEvent = event.originalEvent;
            if (event.target !== this.$element[0]) {
                return;
            }
            if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && !this.isExpanded) {
                this._clearReaderContainer();
                this.emit(EVENTS.THUMBNAIL_SHRINK, this);
            } else if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && this.isExpanded) {
                this.emit(EVENTS.THUMBNAIL_EXPAND, this);
            }
        });
        this.$element.on('click', event => {
            event.stopImmediatePropagation();
            event.target === this.$element[0] && this.emit(EVENTS.VERTICAL_READER_CLICK_BACKGROUND);
        });
        this.$element.on('click', '.reader-prev-button', () => this._navigate(-1));
        this.$element.on('click', '.reader-next-button', () => this._navigate(1));
    }

    /**
     * Move to a neighbouring thumbnail
     * @param {Number} offset - +1 to move to the next thumbnail; -1 to move to the previous thumbnail
     * @private
     */
    _navigate(offset) {
        const currentThumbnailIndex = this._thumbnailInstances.findIndex(thumbnail => thumbnail.data.id === this._markedThumbnail.data.id);
        const toIndex = (currentThumbnailIndex + offset) > 0 ? currentThumbnailIndex + offset : 0;

        if (toIndex >= 0 && toIndex < this._thumbnailInstances.length && currentThumbnailIndex !== toIndex) {
            const targetThumbnail = this._thumbnailInstances[toIndex];
            this.placeUnder(targetThumbnail, true);
            this.emit(EVENTS.VERTICAL_READER_NAVIGATE_THUMBNAIL, targetThumbnail);
        }
    }

    _placeMarker(thumbnail) {
        const thumbnailCenterOffSetLeft = thumbnail.$element[0].offsetWidth / 2 + (thumbnail.$element[0].offsetLeft - this.$element[0].offsetLeft);
        const $marker = this.$element.find('.marker');
        $marker.css({
            left: thumbnailCenterOffSetLeft,
        });
        this._markedThumbnail = thumbnail;
    }

    _createNewReaderHolder() {
        // The reader holder closes and removes itself when its child reader is removed.
        const $readerHolder = $('<div class="uncharted-thumbnails-reader-holder"></div>');

        const observer = new MutationObserver(mutations => {
            if (mutations[0].removedNodes.length > 0) {
                $readerHolder.css({ height: '0' });
            }
        });
        observer.observe($readerHolder[0], { childList: true });

        $readerHolder[0].addEventListener('transitionend', event => {
            if (event.propertyName === 'height' && $readerHolder.height() === 0) {
                $readerHolder.remove();
            }
        });

        return $readerHolder;
    }

    resize() {
        this._markedThumbnail && this.$readerHolder.height() > 0 && this.placeUnder(this._markedThumbnail, true);
    }

    _expandReaderHolder() {
        this.$readerHolder.css({ height: `${this._config['verticalReader.height']}px`});
    }

    updateThumbnailInstances(thumbnailInstances = []) {
        this._thumbnailInstances = thumbnailInstances;
    }

    open(thumbnail) {
        this.placeUnder(thumbnail);
        requestAnimationFrame(() => {
            this._expandReaderHolder();
        });
    }

    close() {
        this.$element && this.$element.detach();
    }

    updateReaderContent(thumbnail, readerContentData) {
        thumbnail.readerContent.updateData(readerContentData);
        this.$element.find('.reader-content-container').html(thumbnail.readerContent.render());
    }

    placeUnder(thumbnail, stayOpened) {
        const targetThumbnailPosition = thumbnail.$element.position();
        const elementsInSameRow = thumbnail.$element.nextAll()
            .filter((index, ele) => $(ele).position().top === targetThumbnailPosition.top);
        const lastElementInRow = elementsInSameRow[elementsInSameRow.length - 1] || thumbnail.$element;

        const $nextElement = $(lastElementInRow).next();
        const $prevReaderHolder = this.$readerHolder;
        if (!$nextElement.is($prevReaderHolder)) {
            const $newReaderHolder = this._createNewReaderHolder();
            $newReaderHolder.append(this.$element);
            if (stayOpened) {
                $prevReaderHolder.remove();
                this._expandReaderHolder();
            }
            $(lastElementInRow).after($newReaderHolder);
        }
        this._placeMarker(thumbnail);
        requestAnimationFrame(() => thumbnail.readerContent.resize());
    }
}
