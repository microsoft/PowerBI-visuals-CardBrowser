import $ from 'jquery';
import readerContentTemplate from './readerContent.handlebars';
import { IBindable, createFallbackIconURL } from '../../util';
import HeaderImage from '../headerImage/headerImage';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class ReaderContent extends IBindable {
    constructor(spec = {}) {
        super();
        this.headerImage = new HeaderImage();
        this.reset(spec);
    }

    reset(spec = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.updateData(spec.data);
        this.headerImage.reset({ imageUrls: this.data.imageUrl, mirrorLastImage: true, mirrorImageGradientColor: this._config['readerContent.headerBackgroundColor'], config: this._config });
        return this;
    }

    render() {
        this.$element = $(readerContentTemplate(Object.assign({
            iconUrl: this._getIconUrl(),
            subtitleDelimiter: this._config.subtitleDelimiter,
            headerBackgroundColor: this._config['readerContent.headerBackgroundColor'],
            headerSourceLinkColor: this._config['readerContent.headerSourceLinkColor'],
        }, this.data)));
        this.$headerImageContainer = this.$element.find('.reader-content-header-image');
        this.$readerContentHeader = this.$element.find('.reader-content-header');
        this.headerImage.hasImages()
            ? this.$headerImageContainer.append(this.headerImage.render()) && this.headerImage.shrinkPortraitImages()
            : this.$element.addClass('no-header-image');
        this._registerDomEvents();
        return this.$element;
    }

    updateData(data) {
        this.data = data || {};
    }

    _registerDomEvents() {
        this.$element.on('click', '.close-button', event => {
            event.stopPropagation();
            this.emit(EVENTS.READER_CONTENT_CLICK_CLOSE, this);
        });
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }

    resize() {
        this.$readerContentHeader && this.$readerContentHeader.css('width', this.$headerImageContainer[0].offsetWidth);
    }
}
