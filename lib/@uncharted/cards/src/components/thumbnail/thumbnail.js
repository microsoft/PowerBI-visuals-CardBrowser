import thumbnailTemplate from './thumbnail.handlebars';
import ReaderContent from '../readerContent/readerContent';
import HeaderImage from '../headerImage/headerImage';
import { IBindable, createFallbackIconURL } from '../../util';
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
        this.headerImage = new HeaderImage({ imageUrls: this.data.imageUrl, config: this._config });
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
        this.readerContent && this._attachReaderContainer();
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
            subtitleDelimiter: this._config.subtitleDelimiter,
            iconUrl: this._getIconUrl(),
            removeFrontCard: disableFlipping && displayBackCardByDefault,
            removeBackCard: disableFlipping && !displayBackCardByDefault,
        }, this.data);
        this.$element = $(thumbnailTemplate(data));
        this._$cardImage = this.$element.find('.card-image');
        this.isFlipped = displayBackCardByDefault;
        this._$cardReaderContainer.css('width', this.expandedWidth);
        noImages && this.$element.addClass('title-only');
        this.headerImage.hasImages() && this._$cardImage.append(this.headerImage.$element);
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
        this.$element.on('click', '.card', event => {
            event.stopImmediatePropagation();
            this.emit(EVENTS.THUMBNAIL_CLICK, this);
        });

        this.$element.on('click', '.meta-data-table a', event => event.stopImmediatePropagation());
        this.$element.on('mouseenter', '.overflow-box', event => $(event.currentTarget).attr('title', $(event.currentTarget).find('.overflow-value').text().trim()));
        this.$element.on('mouseleave', '.overflow-box', event => $(event.currentTarget).removeAttr('title'));
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
        this.readerContent = new ReaderContent({ data: readerContentData, config: this._config });
        this.forward(this.readerContent);
        this._$cardReaderContainer.html(this.readerContent.$element);
        this._attachReaderContainer();
        this.readerContent.resizeHeader();
    }

    scaleHeaderImages() {
        this.headerImage.hasImages() && this.headerImage.scaleImages(this._$cardImage[0].offsetWidth, this._$cardImage[0].offsetHeight);
    }
}
