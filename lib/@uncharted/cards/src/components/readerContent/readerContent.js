/*
 * Copyright 2018 Uncharted Software Inc.
 */

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
        this.headerImage.reset({
            imageUrls: this.data.imageUrl,
            mirrorLastImage: true,
            mirrorImageGradientColor: this._config['readerContent.headerBackgroundColor'],
            imageMaxWidth: this._config['readerContent.headerImageMaxWidth'],
            config: this._config,
        });
        return this;
    }

    render() {
        const metaDataFontSize = this._config['card.metadata.fontSize'];
        const subtitleFontSize = this._config['card.subtitle.fontSize'];
        const metaDataTitleColor = this._config['card.metadata.title.color'];
        const metaDataTitleFontFamily = this._config['card.metadata.title.fontFamily'];
        const metaDataValueColor = this._config['card.metadata.value.color'];
        const metaDataValueFontFamily = this._config['card.metadata.value.fontFamily'];

        this.$element = $(readerContentTemplate(Object.assign({
            iconUrl: this._getIconUrl(),
            subtitleDelimiter: this._config.subtitleDelimiter,
            headerBackgroundColor: this._config['readerContent.headerBackgroundColor'],
            headerSourceLinkColor: this._config['readerContent.headerSourceLinkColor'],
            metaDataFontSize: metaDataFontSize,
            metaDataTitleColor: metaDataTitleColor,
            metaDataTitleFontFamily: metaDataTitleFontFamily,
            metaDataValueColor: metaDataValueColor,
            metaDataValueFontFamily: metaDataValueFontFamily,
            subtitleFontSize: subtitleFontSize,
        }, this.data)));
        this.$headerImageContainer = this.$element.find('.reader-content-header-image');
        if (this.headerImage.hasImages()) {
            this.$headerImageContainer.append(this.headerImage.render());
            if (!this._config['readerContent.cropImages']) {
                this.headerImage.fitImages();
            }
        } else {
            this.$element.addClass('no-header-image');
        }
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

        this.$element.on('click', 'a', event => {
            var $anchor = $(event.target).closest('a');
            var href = $anchor.attr('href');
            if (href) {
                this.emit(EVENTS.READER_CONTENT_CLICK_LINK, event);
                if (!this._config['readerContent.disableLinkNavigation']) {
                    window.open(href, '_blank');
                }
            }
            return false;
        });
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }
}
