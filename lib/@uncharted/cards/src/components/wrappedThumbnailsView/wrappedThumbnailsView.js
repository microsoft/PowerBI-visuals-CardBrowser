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

import wrappedThumbnailsViewTemplate from './wrappedThumbnailsView.handlebars';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import VerticalReader from '../verticalReader/verticalReader';
import $ from 'jquery';

export default class WrappedThumbnailsView extends IBindable {
    constructor(spec = {}) { // eslint-disable-line
        super();
        this.reset(spec);
        this._initVerticalReader();
        this.postRender = () => {};
    }

    reset(spec = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.thumbnailInstances = [];
        return this;
    }

    _initVerticalReader() {
        this.verticalReader = new VerticalReader({ config: this._config });
        this.verticalReader.on(EVENTS.VERTICAL_READER_NAVIGATE_THUMBNAIL, thumbnail => this.scrollToVerticalReader(thumbnail.$element[0].offsetHeight, 0));
        this.forward(this.verticalReader);
    }

    _registerDomEvents() {
        this.$element.on('click', event => this.emit(EVENTS.THUMBNAILS_CLICK_BACKGROUND, this, event));
        this.$element.on('scroll', event => {
            let ticking = false;
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.$element[0].scrollTop + this.$element[0].offsetHeight >= this.$element[0].scrollHeight - 1 && this.emit(EVENTS.WRAPPED_THUMBNAILS_VIEW_SCROLL_END, this, event.originalEvent);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    render() {
        this.$element = $(wrappedThumbnailsViewTemplate({
            thumbnailWidth: this._config['thumbnail.width'],
        }));
        this._$thumbnailsContainer = this.$element.find('.thumbnails-container');
        this._$dummyThumbnails = this.$element.find('.dummy-thumbnail');
        this.verticalReader.render();
        this._registerDomEvents();
        return this.$element;
    }

    clearThumbnails() {
        this.thumbnailInstances = [];
        return this.render();
    }

    resize() {
        this.verticalReader.resize();
    }

    renderMoreThumbnails(thumbnailInstances) {
        const thumbnailFragments = document.createDocumentFragment();
        thumbnailInstances.forEach(thumbnail => thumbnailFragments.appendChild(thumbnail.render()[0]));
        this._$thumbnailsContainer.append(thumbnailFragments).append(this._$dummyThumbnails);
        this.thumbnailInstances.push(...thumbnailInstances);
        this.verticalReader.updateThumbnailInstances(this.thumbnailInstances);
        this.postRender();
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

    openReader(thumbnail) {
        this.verticalReader.open(thumbnail);
        this.scrollToVerticalReader(thumbnail.$element[0].offsetHeight, this._config.scrollToVerticalReaderDuration);
    }

    closeReader() {
        this.verticalReader.close();
    }
}
