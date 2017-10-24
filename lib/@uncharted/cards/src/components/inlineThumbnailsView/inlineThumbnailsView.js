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

import inlineThumbnailsListTemplate from './inlineThumbnailsView.handlebars';
import { IBindable, mapVerticalToHorizontalScroll, delayOnHorizontalToVerticalScrollingTransition } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import $ from 'jquery';

export default class InlineThumbnailsView extends IBindable {
    constructor(spec = {}) { // eslint-disable-line
        super();
        this.postRender = () => { /* this function called after render */ };
        this.reset(spec);
    }

    reset(spec) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.thumbnailInstances = [];
        this.thumbnailsInViewPort = [];
        this.thumbnailExpansionState = {};
        this.THUMBNAIL_WIDTH = this._config['thumbnail.width'];
        this.THUMBNAIL_EXPANDED_WIDTH = this._config['thumbnail.expandedWidth'];
        this.thumbnailAnimationDuration = this._config.inlineThumbnailCenteringDuration;
        return this;
    }

    render() {
        this.$element = $(inlineThumbnailsListTemplate());
        this._$thumbnailsContainer = this.$element.find('.thumbnails-container');
        this._$responsivePadding = this.$element.find('.responsive-padding');
        this._registerDomEvents();
        this.renderThumbnailsInViewPort();
        return this.$element;
    }

    resize() {
        this.$element && this.renderThumbnailsInViewPort();
    }

    _registerDomEvents() {
        let ticking = false;

        this.$element.on('click', event => this.emit(EVENTS.THUMBNAILS_CLICK_BACKGROUND, this, event.originalEvent));
        this.$element.on('scroll', event => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.$element[0].scrollLeft + this.$element[0].offsetWidth >= this.$element[0].scrollWidth - 1 && this.emit(EVENTS.INLINE_THUMBNAILS_VIEW_SCROLL_END, this, event.originalEvent);
                    this.renderThumbnailsInViewPort();
                    ticking = false;
                });
                ticking = true;
            }
        });
        mapVerticalToHorizontalScroll(this.$element);
        delayOnHorizontalToVerticalScrollingTransition(this.$element, '.uncharted-thumbnails-reader-content');
    }

    updateThumbnailInstances(thumbnailInstances) {
        this.thumbnailsInViewPort = [];
        this.thumbnailInstances = thumbnailInstances;
        this._$thumbnailsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.thumbnailInstances.length });
        this.renderThumbnailsInViewPort();
    }

    _getIndexOfFirstThumbnailInViewPort(scrollLeft) {
        const {
            closingThumbnail,
            closingThumbnailIndex,
            expandingThumbnail,
            expandingThumbnailIndex,
            expandedThumbnail,
            expandedThumbnailIndex,
        } = this.thumbnailExpansionState;
        const THUMBNAIL_WIDTH = this.THUMBNAIL_WIDTH;
        const responsivePaddingWidth = this._$responsivePadding[0].getBoundingClientRect().width;
        let index;
        if (closingThumbnail && expandingThumbnail && closingThumbnailIndex < expandingThumbnailIndex) {
            const closingThumbnailOffSetLeft = closingThumbnailIndex * THUMBNAIL_WIDTH;
            if (closingThumbnailOffSetLeft >= scrollLeft) {
                // [|][][][  c  ][][|]
                index = Math.floor(scrollLeft / THUMBNAIL_WIDTH);
            } else if (closingThumbnailOffSetLeft < scrollLeft && closingThumbnailOffSetLeft + this.THUMBNAIL_EXPANDED_WIDTH >= scrollLeft) {
                // [   c | ][][][]|
                index = closingThumbnailIndex;
            } else {
                // [  c  ][]|[][][]|
                index = Math.floor((Math.max(scrollLeft - responsivePaddingWidth, 0)) / THUMBNAIL_WIDTH);
            }
        } else if (expandedThumbnail && expandedThumbnailIndex * THUMBNAIL_WIDTH < scrollLeft) {
            const expandedReaderLeftPosition = expandedThumbnailIndex * THUMBNAIL_WIDTH;
            const expandedReaderWidth = this.THUMBNAIL_EXPANDED_WIDTH;
            const widthBetweenExpandedThumbnailToScrollLeftPosition = scrollLeft - (expandedReaderLeftPosition + expandedReaderWidth);
            if (widthBetweenExpandedThumbnailToScrollLeftPosition > 0) {
                const paddingWidth = expandedReaderWidth - THUMBNAIL_WIDTH;
                index = Math.floor(widthBetweenExpandedThumbnailToScrollLeftPosition / THUMBNAIL_WIDTH) + expandedThumbnailIndex + 1;
                this._$thumbnailsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.thumbnailInstances.length + paddingWidth});
                this._$responsivePadding.css({ width: paddingWidth });
                // console.log('in left offscreen');
            } else {
                index = expandedThumbnailIndex;
                this._$responsivePadding.css({ width: 0 });
                // console.log('in viewport');
            }
        } else {
            // console.log('other cases');
            index = Math.floor(scrollLeft / THUMBNAIL_WIDTH);
            this._$responsivePadding.css({ width: 0 });
        }
        return index;
    }

    renderThumbnailsInViewPort() {
        const scrollLeft = this.$element[0].scrollLeft;
        const viewportWidth = this.$element[0].offsetWidth;
        const THUMBNAIL_WIDTH = this.THUMBNAIL_WIDTH;
        const indexOfFirstThumbnailInViewPort = this._getIndexOfFirstThumbnailInViewPort(scrollLeft);
        const paddingLeft = indexOfFirstThumbnailInViewPort * THUMBNAIL_WIDTH;

        const newItemsInViewPort = [];

        // getThumbnailsToRender
        for (let i = indexOfFirstThumbnailInViewPort, remainingSpaceInViewPort = viewportWidth + (this.THUMBNAIL_EXPANDED_WIDTH - THUMBNAIL_WIDTH); remainingSpaceInViewPort > 0; i++) {
            const thumbnail = this.thumbnailInstances[i];
            thumbnail && newItemsInViewPort.push(thumbnail);
            i !== indexOfFirstThumbnailInViewPort && (remainingSpaceInViewPort -= THUMBNAIL_WIDTH);
        }

        if (this.thumbnailsInViewPort[0] !== newItemsInViewPort[0] || this.thumbnailsInViewPort[this.thumbnailsInViewPort.length - 1] !== newItemsInViewPort[newItemsInViewPort.length - 1]) {
            this.thumbnailsInViewPort.forEach(thumbnail => {
                newItemsInViewPort.indexOf(thumbnail) < 0 && thumbnail.$element && thumbnail.$element.remove() && (thumbnail.$element = undefined);
            });
            const fragments = document.createDocumentFragment();
            newItemsInViewPort.forEach((thumbnail, index) => {
                const isThumbnailAlreadyRendered = Boolean(thumbnail.$element);
                const $thumbnailElement = isThumbnailAlreadyRendered ? thumbnail.$element : thumbnail.render();
                $thumbnailElement.css({
                    'order': index + 1,
                });
                !isThumbnailAlreadyRendered && fragments.appendChild($thumbnailElement[0]);
            });
            this._$thumbnailsContainer.css({
                'padding-left': paddingLeft,
            });
            this._$thumbnailsContainer.append(fragments);
            this.thumbnailsInViewPort = newItemsInViewPort;
        }
        this.postRender();
    }

    _expandAndCenterThumbnail(thumbnail, scrollDuration) {
        const thumbnailIndex = this.thumbnailInstances.indexOf(thumbnail);
        const previouslyExpandedThumbnail = this.thumbnailInstances.filter(thumbnailItem => thumbnailItem.isExpanded)[0];
        const previouslyExpandedThumbnailIndex = this.thumbnailInstances.indexOf(previouslyExpandedThumbnail);
        const expandedToNormalLeftOffsetDifference = previouslyExpandedThumbnail && previouslyExpandedThumbnailIndex < thumbnailIndex
            ? this.THUMBNAIL_EXPANDED_WIDTH - this.THUMBNAIL_WIDTH
            : 0;
        previouslyExpandedThumbnail && previouslyExpandedThumbnail.shrink();
        thumbnail.expand();
        this.centerThumbnail(thumbnail, scrollDuration, -expandedToNormalLeftOffsetDifference);

        this.thumbnailExpansionState = {
            expandingThumbnail: thumbnail,
            expandingThumbnailIndex: thumbnailIndex,
            closingThumbnail: previouslyExpandedThumbnail,
            closingThumbnailIndex: previouslyExpandedThumbnailIndex,
        };

        this._$responsivePadding.animate({ width: 0 }, { duration: scrollDuration, complete: () => {
            this.thumbnailExpansionState = {
                expandedThumbnail: thumbnail,
                expandedThumbnailIndex: thumbnailIndex,
            };
        }});
    }

    /**
     * Open a reader for the provided thumbnail
     * @param {Object} thumbnail - thumbnail instance whose reader will be opened. 
     */
    openReader(thumbnail) {
        if (!thumbnail.isExpanded) {
            this._expandAndCenterThumbnail(thumbnail, this.thumbnailAnimationDuration);
        }
    }

    closeReader() {
        this.thumbnailInstances.forEach(thumbnail => thumbnail.shrink());
        this._$responsivePadding.animate({ width: 0 }, { duration: this.thumbnailAnimationDuration, complete: () => {
            this.thumbnailExpansionState = {};
            this._$thumbnailsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.thumbnailInstances.length });
        }});
    }

    /**
     * Scroll to the provided thumbnail and centers it.
     * @param {Object} thumbnail - A thumbnail to be centered.
     * @param {Number} duration - A number representing the duration of the centering animation in ms.
     * @param {Number} offset - Given thumbnail will be offset from the center by provided number.
     */
    centerThumbnail(thumbnail, duration, offset) {
        const viewportWidth = this.$element[0].offsetWidth;
        const targetThumbnailIndex = this.thumbnailInstances.indexOf(thumbnail);
        const expandedThumbnailIndex = this.thumbnailExpansionState.expandedThumbnailIndex;
        const extraLeftOffset = expandedThumbnailIndex !== undefined && expandedThumbnailIndex < targetThumbnailIndex
            ? this.THUMBNAIL_EXPANDED_WIDTH - this.THUMBNAIL_WIDTH
            : 0;
        const thumbnailOffsetLeft = Math.max(targetThumbnailIndex, 0) * this.THUMBNAIL_WIDTH + extraLeftOffset;
        const leftMargin = Math.max(viewportWidth - thumbnail.expandedWidth, 0) / 2;
        const scrollLeft = thumbnailOffsetLeft - leftMargin + (offset || 0);
        duration
            ? this.$element.animate({ scrollLeft: scrollLeft }, duration)
            : this.$element.scrollLeft(scrollLeft);
    }
}
