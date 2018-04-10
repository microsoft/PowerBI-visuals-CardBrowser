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

import inlineCardsListTemplate from './inlineCardsView.handlebars';
import { IBindable, mapVerticalToHorizontalScroll, delayOnHorizontalToVerticalScrollingTransition } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class InlineCardsView extends IBindable {
    constructor(spec = {}) { // eslint-disable-line
        super();
        this.postRender = () => { /* this function called after render */ };
        this.reset(spec);
    }

    reset(spec) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.cardInstances = [];
        this.cardsInViewPort = [];
        this.cardExpansionState = {};
        this.THUMBNAIL_WIDTH = this._config['card.width'];
        this.THUMBNAIL_EXPANDED_WIDTH = this._config['card.expandedWidth'];
        this.cardAnimationDuration = this._config.inlineCardCenteringDuration;
        return this;
    }

    render() {
        this.$element = $(inlineCardsListTemplate());
        this._$cardsContainer = this.$element.find('.cards-container');
        this._$responsivePadding = this.$element.find('.responsive-padding');
        this._registerDomEvents();
        this.renderCardsInViewPort();
        return this.$element;
    }

    resize() {
        this.$element && this.renderCardsInViewPort();
    }

    _registerDomEvents() {
        let ticking = false;

        this.$element.on('click', event => this.emit(EVENTS.THUMBNAILS_CLICK_BACKGROUND, this, event.originalEvent));
        this.$element.on('scroll', event => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.$element[0].scrollLeft + this.$element[0].offsetWidth >= this.$element[0].scrollWidth - 1 && this.emit(EVENTS.INLINE_THUMBNAILS_VIEW_SCROLL_END, this, event.originalEvent);
                    this.renderCardsInViewPort();
                    ticking = false;
                });
                ticking = true;
            }
        });
        mapVerticalToHorizontalScroll(this.$element);
        delayOnHorizontalToVerticalScrollingTransition(this.$element, '.uncharted-cards-reader-content');
    }

    updateCardInstances(cardInstances) {
        this.cardsInViewPort = [];
        this.cardInstances = cardInstances;
        this._$cardsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.cardInstances.length });
        this.renderCardsInViewPort();
    }

    _getIndexOfFirstCardInViewPort(scrollLeft) {
        const {
            closingCard,
            closingCardIndex,
            expandingCard,
            expandingCardIndex,
            expandedCard,
            expandedCardIndex,
        } = this.cardExpansionState;
        const THUMBNAIL_WIDTH = this.THUMBNAIL_WIDTH;
        const responsivePaddingWidth = this._$responsivePadding[0].getBoundingClientRect().width;
        let index;
        if (closingCard && expandingCard && closingCardIndex < expandingCardIndex) {
            const closingCardOffSetLeft = closingCardIndex * THUMBNAIL_WIDTH;
            if (closingCardOffSetLeft >= scrollLeft) {
                // [|][][][  c  ][][|]
                index = Math.floor(scrollLeft / THUMBNAIL_WIDTH);
            } else if (closingCardOffSetLeft < scrollLeft && closingCardOffSetLeft + this.THUMBNAIL_EXPANDED_WIDTH >= scrollLeft) {
                // [   c | ][][][]|
                index = closingCardIndex;
            } else {
                // [  c  ][]|[][][]|
                index = Math.floor((Math.max(scrollLeft - responsivePaddingWidth, 0)) / THUMBNAIL_WIDTH);
            }
        } else if (expandedCard && expandedCardIndex * THUMBNAIL_WIDTH < scrollLeft) {
            const expandedReaderLeftPosition = expandedCardIndex * THUMBNAIL_WIDTH;
            const expandedReaderWidth = this.THUMBNAIL_EXPANDED_WIDTH;
            const widthBetweenExpandedCardToScrollLeftPosition = scrollLeft - (expandedReaderLeftPosition + expandedReaderWidth);
            if (widthBetweenExpandedCardToScrollLeftPosition > 0) {
                const paddingWidth = expandedReaderWidth - THUMBNAIL_WIDTH;
                index = Math.floor(widthBetweenExpandedCardToScrollLeftPosition / THUMBNAIL_WIDTH) + expandedCardIndex + 1;
                this._$cardsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.cardInstances.length + paddingWidth});
                this._$responsivePadding.css({ width: paddingWidth });
                // console.log('in left offscreen');
            } else {
                index = expandedCardIndex;
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

    renderCardsInViewPort() {
        const scrollLeft = this.$element[0].scrollLeft;
        const viewportWidth = this.$element[0].offsetWidth;
        const THUMBNAIL_WIDTH = this.THUMBNAIL_WIDTH;
        const indexOfFirstCardInViewPort = this._getIndexOfFirstCardInViewPort(scrollLeft);
        const paddingLeft = indexOfFirstCardInViewPort * THUMBNAIL_WIDTH;

        const newItemsInViewPort = [];

        // get cards to render
        for (let i = indexOfFirstCardInViewPort, remainingSpaceInViewPort = viewportWidth + (this.THUMBNAIL_EXPANDED_WIDTH - THUMBNAIL_WIDTH); remainingSpaceInViewPort > 0; i++) {
            const card = this.cardInstances[i];
            card && newItemsInViewPort.push(card);
            i !== indexOfFirstCardInViewPort && (remainingSpaceInViewPort -= THUMBNAIL_WIDTH);
        }

        if (this.cardsInViewPort[0] !== newItemsInViewPort[0] || this.cardsInViewPort[this.cardsInViewPort.length - 1] !== newItemsInViewPort[newItemsInViewPort.length - 1]) {
            this.cardsInViewPort.forEach(card => {
                newItemsInViewPort.indexOf(card) < 0 && card.$element && card.$element.remove() && (card.$element = undefined);
            });
            const fragments = document.createDocumentFragment();
            newItemsInViewPort.forEach((card, index) => {
                const isCardAlreadyRendered = Boolean(card.$element);
                const $cardElement = isCardAlreadyRendered ? card.$element : card.render();
                $cardElement.css({
                    'order': index + 1,
                });
                !isCardAlreadyRendered && fragments.appendChild($cardElement[0]);
            });
            this._$cardsContainer.css({
                'padding-left': paddingLeft,
            });
            this._$cardsContainer.append(fragments);
            this.cardsInViewPort = newItemsInViewPort;
        }
        this.postRender();
    }

    _expandAndCenterCard(card, scrollDuration) {
        const cardIndex = this.cardInstances.indexOf(card);
        const previouslyExpandedCard = this.cardInstances.filter(cardItem => cardItem.isExpanded)[0];
        const previouslyExpandedCardIndex = this.cardInstances.indexOf(previouslyExpandedCard);
        const expandedToNormalLeftOffsetDifference = previouslyExpandedCard && previouslyExpandedCardIndex < cardIndex
            ? this.THUMBNAIL_EXPANDED_WIDTH - this.THUMBNAIL_WIDTH
            : 0;
        previouslyExpandedCard && previouslyExpandedCard.shrink();
        card.expand();
        this.centerCard(card, scrollDuration, -expandedToNormalLeftOffsetDifference);

        this.cardExpansionState = {
            expandingCard: card,
            expandingCardIndex: cardIndex,
            closingCard: previouslyExpandedCard,
            closingCardIndex: previouslyExpandedCardIndex,
        };

        this._$responsivePadding.animate({ width: 0 }, { duration: scrollDuration, complete: () => {
            this.cardExpansionState = {
                expandedCard: card,
                expandedCardIndex: cardIndex,
            };
        }});
    }

    /**
     * Open a reader for the provided card
     * @param {Object} card - card instance whose reader will be opened.
     */
    openReader(card) {
        if (!card.isExpanded) {
            this._expandAndCenterCard(card, this.cardAnimationDuration);
        }
    }

    closeReader() {
        this.cardInstances.forEach(card => card.shrink());
        this._$responsivePadding.animate({ width: 0 }, { duration: this.cardAnimationDuration, complete: () => {
            this.cardExpansionState = {};
            this._$cardsContainer.css({ 'min-width': this.THUMBNAIL_WIDTH * this.cardInstances.length });
        }});
    }

    /**
     * Scroll to the provided card and centers it.
     * @param {Object} card - A card to be centered.
     * @param {Number} duration - A number representing the duration of the centering animation in ms.
     * @param {Number} offset - Given card will be offset from the center by provided number.
     */
    centerCard(card, duration, offset) {
        const viewportWidth = this.$element[0].offsetWidth;
        const targetCardIndex = this.cardInstances.indexOf(card);
        const expandedCardIndex = this.cardExpansionState.expandedCardIndex;
        const extraLeftOffset = expandedCardIndex !== undefined && expandedCardIndex < targetCardIndex
            ? this.THUMBNAIL_EXPANDED_WIDTH - this.THUMBNAIL_WIDTH
            : 0;
        const cardOffsetLeft = Math.max(targetCardIndex, 0) * this.THUMBNAIL_WIDTH + extraLeftOffset;
        const leftMargin = Math.max(viewportWidth - card.expandedWidth, 0) / 2;
        const scrollLeft = cardOffsetLeft - leftMargin + (offset || 0);
        duration
            ? this.$element.animate({ scrollLeft: scrollLeft }, duration)
            : this.$element.scrollLeft(scrollLeft);
    }
}
