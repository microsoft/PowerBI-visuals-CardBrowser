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

import thumbnailsTemplate from './thumbnails.handlebars';
import InlineThumbnailsView from '../inlineThumbnailsView/inlineThumbnailsView';
import WrappedThumbnailsView from '../wrappedThumbnailsView/wrappedThumbnailsView';
import Thumbnail from '../thumbnail/thumbnail';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG } from '../constants';

export default class Thumbnails extends IBindable {
    constructor(config = {}) { // eslint-disable-line
        super();
        this._initInlineThumbnailsView();
        this._initWrappedThumbnailsView();
        this.reset(config);
    }

    _initInlineThumbnailsView() {
        this.inlineThumbnailsView = new InlineThumbnailsView({ config: this._config });
        this.inlineThumbnailsView.postRender = () => {
            this._fadeOutOverflowingThumbnailMetadataTexts(this.inlineThumbnailsView.thumbnailsInViewPort);
        };
        this.forward(this.inlineThumbnailsView);
    }

    _initWrappedThumbnailsView() {
        this.wrappedThumbnailsView = new WrappedThumbnailsView({ config: this._config });
        this.wrappedThumbnailsView.postRender = () => {
            this._fadeOutOverflowingThumbnailMetadataTexts(this.wrappedThumbnailsView.thumbnailInstances);
        };
        this.forward(this.wrappedThumbnailsView);
    }

    _initMoreThumbnails(thumbnailsData) {
        const thumbnailsInstances = thumbnailsData.map(data => {
            const thumbnail = new Thumbnail({ data, config: this._config });
            this.forward(thumbnail);
            return thumbnail;
        });
        this.thumbnailInstances.push(...thumbnailsInstances);
    }

    _fadeOutOverflowingThumbnailMetadataTexts(thumbnailInstances) {
        const overflowBoxElements = [];
        thumbnailInstances.forEach(thumbnail => {
            const thumbnailEle = thumbnail.$element && thumbnail.$element[0];
            const textBoxElements = thumbnailEle && thumbnailEle.querySelectorAll('.meta-data-content .overflow-box');
            [].forEach.call(textBoxElements || [], element => {
                const textValueElement = element.children && element.children[0];
                if (textValueElement) {
                    const boxWidth = element.offsetWidth;
                    const boxHeight = element.offsetHeight;
                    const valueWidth = textValueElement.offsetWidth;
                    const valueHeight = textValueElement.offsetHeight;
                    const isOverflowing = valueWidth > boxWidth || valueHeight > boxHeight;
                    isOverflowing && overflowBoxElements.push(element);
                }
            });
        });
        overflowBoxElements.forEach(element => element.classList.add('overflow'));
    }

    reset(config) {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this.thumbnailInstances = [];
        this.inlineMode = Boolean(this._config.inlineMode);
        this.inlineThumbnailsView.reset({ config: this._config });
        this.wrappedThumbnailsView.reset({ config: this._config });
        return this;
    }

    render() {
        this.$element = $(thumbnailsTemplate({
            inlineMode: this.inlineMode,
        }));
        this.inlineMode
            ? this.$element.html(this.inlineThumbnailsView.render())
            : this.$element.html(this.wrappedThumbnailsView.render());
        return this.$element;
    }

    resize() {
        if (this.$element) {
            this.inlineMode
                ? this.inlineThumbnailsView.resize()
                : this.wrappedThumbnailsView.resize();
        }
    }

    clearThumbnails() {
        this.thumbnailInstances = [];
        this.inlineThumbnailsView.thumbnailInstances = [];
        this.wrappedThumbnailsView.thumbnailInstances = [];
        this.inlineMode
            ? this.$element.html(this.inlineThumbnailsView.render())
            : this.$element.html(this.wrappedThumbnailsView.clearThumbnails());
    }

    loadData(thumbnailsData) {
        this.clearThumbnails();
        this._initMoreThumbnails(thumbnailsData);

        this.inlineMode
            ? this.inlineThumbnailsView.updateThumbnailInstances(this.thumbnailInstances)
            : this.wrappedThumbnailsView.renderMoreThumbnails(this.thumbnailInstances);
    }

    loadMoreData(thumbnailsData) {
        const numberOfCurrentThumbnails = this.thumbnailInstances.length;
        this._initMoreThumbnails(thumbnailsData);
        this.inlineMode
            ? this.inlineThumbnailsView.updateThumbnailInstances(this.thumbnailInstances)
            : this.wrappedThumbnailsView.renderMoreThumbnails(this.thumbnailInstances.slice(numberOfCurrentThumbnails));
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
            ? this.inlineThumbnailsView.openReader(thumbnail)
            : this.wrappedThumbnailsView.openReader(thumbnail);
    }

    closeReader() {
        this.inlineMode
            ? this.inlineThumbnailsView.closeReader()
            : this.wrappedThumbnailsView.closeReader();
    }

    toggleInlineDisplayMode(state) {
        this.closeReader();
        this.inlineMode = state === undefined ? !this.inlineMode : state;
        this.thumbnailInstances.forEach(thumbnail => thumbnail.$element && thumbnail.$element.remove() && (thumbnail.$element = undefined));
        this.inlineMode
            ? this.$element.html(this.inlineThumbnailsView.render()) && this.inlineThumbnailsView.updateThumbnailInstances(this.thumbnailInstances)
            : this.$element.html(this.wrappedThumbnailsView.clearThumbnails()) && this.wrappedThumbnailsView.renderMoreThumbnails(this.thumbnailInstances);
    }

    updateReaderContent(thumbnail, readerContentData) {
        this.inlineMode
            ? thumbnail.updateReaderContent(readerContentData)
            : this.wrappedThumbnailsView.verticalReader.updateReaderContent(thumbnail, readerContentData);
    }
}
