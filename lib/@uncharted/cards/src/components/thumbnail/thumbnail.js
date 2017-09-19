import thumbnailTemplate from './thumbnail.handlebars';
import ReaderContent from '../readerContent/readerContent';
import { IBindable, loadImage, createFallbackIconURL } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import $ from 'jquery';

export default class Thumbnail extends IBindable {
    constructor(spec = {}) {
        super();
        this._$cardReaderContainer = $('<div class="card-content-container card-reader-container"></div>');
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this._expandedWidth = this._config['thumbnail.expandedWidth'];
        this.data = spec.data;
        this.readerContent = undefined;
        this._render();
        this._registerEvents();
    }

    get isExpanded() {
        return Boolean(this._isExpanded);
    }

    set isExpanded(value) {
        this._isExpanded = Boolean(value);
        this.$element.toggleClass('expanded', this._isExpanded);
        this._isExpanded ? this.$element.css('width', this.expandedWidth) : this.$element.css('width', '');
    }

    get isFlipped() {
        return Boolean(this._isFlipped);
    }

    set isFlipped(value) {
        this._isFlipped = Boolean(value);
        this.$element.find('.flipper').toggleClass('flipped', this._isFlipped);
    }

    get expandedWidth() {
        return this._expandedWidth;
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }

    _render() {
        const noImages = !this.data.imageUrl && (this.data.source || this.data.sourceUrl);
        const displayBackCardByDefault = this._config['thumbnail.displayBackCardByDefault'];
        const disableFlipping = this._config['thumbnail.disableFlipping'];
        const data = Object.assign({ 
            disableFlipping,
            iconUrl: this._getIconUrl(),
            removeFrontCard: disableFlipping && displayBackCardByDefault,
            removeBackCard: disableFlipping && !displayBackCardByDefault,
        }, this.data);
        this.$element = $(thumbnailTemplate(data));
        this.isFlipped = displayBackCardByDefault;
        this._$cardReaderContainer.css('width', this.expandedWidth);
        noImages && this.$element.addClass('title-only');
    }

    renderImages() {
        const $cardImage = this.$element.find('.card-image');
        $cardImage.children().toArray().forEach((imageDiv, index, array) => {
            const $imageDiv = $(imageDiv);
            const wrapperWidth = $imageDiv.width();
            const wrapperHeight = $imageDiv.height();
            const url = $imageDiv.data('url');
            const subdivided = array.length > 1;
            loadImage(url).then(img => {
                const scale = Math.max(wrapperWidth / img.width, wrapperHeight / img.height);
                const scaledWidth = Math.round(img.width * scale);
                let sizeType = 'cover';
                if ((subdivided && scaledWidth < wrapperWidth) || (!subdivided && scaledWidth > wrapperWidth)) {
                    sizeType = 'contain';
                } else if (scale > 1) {
                    sizeType = 'auto';
                }
                $imageDiv.css('background-size', sizeType);
                $imageDiv.css('background-image', `url(${url})`);
            });
        });
    }

    _registerEvents() {
        this.$element[0].addEventListener('transitionend', event => {
            if (event.propertyName === 'width' && !this.isExpanded) {
                this._clearReaderContainer();
                this.emit(EVENTS.THUMBNAIL_SHRINK, this);
            } else if (event.propertyName === 'width' && this.isExpanded) {
                this.emit(EVENTS.THUMBNAIL_EXPAND, this);
            }
        });
        this.$element.on('click', '.card', () => {
            event.stopImmediatePropagation();
            this.emit(EVENTS.THUMBNAIL_CLICK, this);
        });

        this.$element.on('click', '.meta-data-table a', event => event.stopImmediatePropagation());
        this.$element.on('mouseenter', '.col, .title-box', event => $(event.currentTarget).attr('title', $(event.currentTarget).find('.value').text().trim()));
        this.$element.on('mouseleave', '.col, .title-box', event => $(event.currentTarget).removeAttr('title'));
    }

    _attachReaderContainer() {
        let cardClassName = this.isFlipped ? '.back.card' : '.front.card';
        this.$element.find(this._config['thumbnail.disableFlipping'] ? '.card' : cardClassName).append(this._$cardReaderContainer);
    }

    _clearReaderContainer() {
        this._$cardReaderContainer.detach().empty();
        this.readerContent = undefined;
    }

    expand() {
        this.isExpanded = true;
    }

    shrink() {
        this.isExpanded = false;
    }

    updateReaderContent(readerContentData = {}) {
        this.readerContent = new ReaderContent({ data: readerContentData });
        this.forward(this.readerContent);
        this._$cardReaderContainer.html(this.readerContent.$element);
        this._attachReaderContainer();
    }
}
