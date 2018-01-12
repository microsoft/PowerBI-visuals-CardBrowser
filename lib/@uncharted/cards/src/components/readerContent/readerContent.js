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
        this.$element = $(readerContentTemplate(Object.assign({
            iconUrl: this._getIconUrl(),
            subtitleDelimiter: this._config.subtitleDelimiter,
            headerBackgroundColor: this._config['readerContent.headerBackgroundColor'],
            headerSourceLinkColor: this._config['readerContent.headerSourceLinkColor'],
        }, this.data)));
        this.$headerImageContainer = this.$element.find('.reader-content-header-image');
        this.headerImage.hasImages()
            ? this.$headerImageContainer.append(this.headerImage.render())
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
