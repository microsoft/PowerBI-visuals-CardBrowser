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

import thumbnailTemplate from './thumbnail.handlebars';
import ReaderContent from '../readerContent/readerContent';
import HeaderImage from '../headerImage/headerImage';
import { IBindable, createFallbackIconURL } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import $ from 'jquery';

export default class Thumbnail extends IBindable {
    constructor(spec = {}) {
        super();
        this.headerImage = new HeaderImage();
        this.readerContent = new ReaderContent();
        this.forward(this.readerContent);
        this.reset(spec);
    }

    reset(spec = {}) {
        this.$element = undefined;
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.data = spec.data || {};

        const imageHeight = this.data.summary ? undefined : this.initialWidth - 10; // thumbnail margins from css TODO: move css to config object

        this.headerImage.reset({ imageUrls: this.data.imageUrl, imageHeight: imageHeight, config: this._config });
        this.readerContent.reset({ data: this.data, config: this._config });
        this.forward(this.readerContent);

        this.isExpanded = false;
        this.isFlipped = this._config['thumbnail.displayBackCardByDefault'];
        return this;
    }

    get expandedWidth() {
        return this._config['thumbnail.expandedWidth'];
    }

    get initialWidth() {
        return this._config['thumbnail.width'];
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }

    render() {
        const noImages = !this.data.imageUrl && (this.data.source || this.data.sourceUrl);
        const displayBackCardByDefault = this._config['thumbnail.displayBackCardByDefault'];
        const disableFlipping = this._config['thumbnail.disableFlipping'];
        const enableBoxShadow = this._config['thumbnail.enableBoxShadow'];

        const data = Object.assign({
            titleOnly: noImages,
            boxShadow: enableBoxShadow,
            width: this.isExpanded ? this.expandedWidth : this.initialWidth,
            expandedWidth: this.expandedWidth,
            cardContentWidth: this.initialWidth,
            isExpanded: this.isExpanded,
            isFlipped: this.isFlipped,
            disableFlipping,
            subtitleDelimiter: this._config.subtitleDelimiter,
            iconUrl: this._getIconUrl(),
            removeFrontCard: disableFlipping && displayBackCardByDefault,
            removeBackCard: disableFlipping && !displayBackCardByDefault,
            tooltip: $('<div/>').html(this.data.summary).text(),
        }, this.data);

        this.$element = $(thumbnailTemplate(data));

        this._$cardImage = this.$element.find('.card-image');
        this.headerImage.hasImages() && this._$cardImage.append(this.headerImage.render());

        this.isExpanded && this._renderReaderContent();

        this._registerDomEvents();
        return this.$element;
    }

    _renderReaderContent() {
        const readerContainerSelector = this.isFlipped ? '.back.card .card-reader-container' : '.front.card .card-reader-container';
        this._$readerContent = this.readerContent.render();
        this.$element.find(this._config['thumbnail.disableFlipping'] ? '.card-reader-container' : readerContainerSelector).html(this._$readerContent);
    }

    _moveReaderContent() {
        if (this.readerContent && this.readerContent.$element && this.readerContent.$element.parent().hasClass('card-reader-container')) {
            const readerContainerSelector = this.isFlipped ? '.back.card .card-reader-container' : '.front.card .card-reader-container';
            this.$element.find(this._config['thumbnail.disableFlipping'] ? '.card-reader-container' : readerContainerSelector).append(this.readerContent.$element);
        }
    }

    _registerDomEvents() {
        this.$element.on('transitionend', event => {
            const originalEvent = event.originalEvent;
            if (event.target !== this.$element[0]) {
                return;
            }
            if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && !this.isExpanded) {
                this.emit(EVENTS.THUMBNAIL_SHRINK, this);
            } else if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && this.isExpanded) {
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

    expand() {
        this.isExpanded = true;
        if (this.$element) {
            this.$element.addClass('expanded');
            this.$element.css('width', this.expandedWidth);
        }
    }

    shrink() {
        this.isExpanded = false;
        if (this.$element) {
            this.$element.removeClass('expanded');
            this.$element.css('width', this.initialWidth);
        }
    }

    flip(state) {
        this.isFlipped = state === undefined ? !this.isFlipped : Boolean(state);
        if (this.$element) {
            this.$element.find('.flipper').toggleClass('flipped', this.isFlipped);
            this._moveReaderContent();
        }
    }

    updateReaderContent(readerContentData = {}) {
        this.readerContent.updateData(readerContentData);
        this._renderReaderContent();
    }

    scaleHeaderImages() {
        this.headerImage.hasImages() && this._$cardImage[0] && this.headerImage.scaleImages(this._$cardImage[0].offsetWidth, this._$cardImage[0].offsetHeight);
    }
}

