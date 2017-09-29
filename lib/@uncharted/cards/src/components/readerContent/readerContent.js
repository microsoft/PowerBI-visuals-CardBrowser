import $ from 'jquery';
import readerContentTemplate from './readerContent.handlebars';
import { IBindable, createFallbackIconURL } from '../../util';
import HeaderImage from '../headerImage/headerImage';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class ReaderContent extends IBindable {
    constructor(spec = {}) {
        super();
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.data = spec.data;
        this.headerImage = new HeaderImage({ imageUrls: this.data.imageUrl, mirrorLastImage: true, mirrorImageGradientColor: this._config['readerContent.headerBackgroundColor'], config: this._config });
        this._render();
        this._registerEvents();
    }

    _render() {
        this.$element = $(readerContentTemplate(Object.assign({
            iconUrl: this._getIconUrl(),
            subtitleDelimiter: this._config.subtitleDelimiter,
            headerBackgroundColor: this._config['readerContent.headerBackgroundColor'],
            headerSourceLinkColor: this._config['readerContent.headerSourceLinkColor'],
            metadataRows: Object.keys(this.data.metadata || {}).map((key, index) => ({
                key: key,
                value: this.data.metadata[key],
                rowNum: index + 1,
            })),
        }, this.data)));
        this.$headerImageContainer = this.$element.find('.reader-content-header-image');
        this.$readerContentHeader = this.$element.find('.reader-content-header');
        this.headerImage.hasImages()
            ? this.$headerImageContainer.append(this.headerImage.$element)
            : this.$element.addClass('no-header-image');
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }

    _registerEvents() {
        this.$element.on('click', '.close-button', event => {
            event.stopPropagation();
            this.emit(EVENTS.READER_CONTENT_CLICK_CLOSE, this);
        });
    }

    resizeHeader() {
        this.$readerContentHeader.css('width', this.$headerImageContainer[0].offsetWidth);
    }
}
