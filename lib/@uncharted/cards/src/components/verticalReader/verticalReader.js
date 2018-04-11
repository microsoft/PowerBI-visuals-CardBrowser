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

import verticalReaderTemplate from './verticalReader.handlebars';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class VerticalReader extends IBindable {
    constructor(spec = {}) {
        super();
        this.reset(spec);
    }

    reset(spec = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this._cardInstances = [];
        return this;
    }

    get $readerHolder() {
        return this.$element.closest('.uncharted-cards-reader-holder');
    }

    render() {
        this.$element = $(verticalReaderTemplate());
        this._registerDOMEvents();
        return this.$element;
    }

    _registerDOMEvents() {
        this.$element.on('transitionend', event => {
            const originalEvent = event.originalEvent;
            if (event.target !== this.$element[0]) {
                return;
            }
            if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && !this.isExpanded) {
                this._clearReaderContainer();
                this.emit(EVENTS.CARD_SHRINK, this);
            } else if (event.target === this.$element[0] && originalEvent.propertyName === 'width' && this.isExpanded) {
                this.emit(EVENTS.CARD_EXPAND, this);
            }
        });
        this.$element.on('click', event => {
            event.stopImmediatePropagation();
            event.target === this.$element[0] && this.emit(EVENTS.VERTICAL_READER_CLICK_BACKGROUND);
        });
        this.$element.on('click', '.reader-prev-button', () => this._navigate(-1));
        this.$element.on('click', '.reader-next-button', () => this._navigate(1));
    }

    /**
     * Move to a neighbouring card
     * @param {Number} offset - +1 to move to the next card; -1 to move to the previous card
     * @private
     */
    _navigate(offset) {
        const currentCardIndex = this._cardInstances.findIndex(card => card.data.id === this._markedCard.data.id);
        const toIndex = (currentCardIndex + offset) > 0 ? currentCardIndex + offset : 0;

        if (toIndex >= 0 && toIndex < this._cardInstances.length && currentCardIndex !== toIndex) {
            const targetCard = this._cardInstances[toIndex];
            this.placeUnder(targetCard, true);
            this.emit(EVENTS.VERTICAL_READER_NAVIGATE_CARD, targetCard);
        }
    }

    _placeMarker(card) {
        const cardCenterOffSetLeft = card.$element[0].offsetWidth / 2 + (card.$element[0].offsetLeft - this.$element[0].offsetLeft);
        const $marker = this.$element.find('.marker');
        $marker.css({
            left: cardCenterOffSetLeft,
        });
        this._markedCard = card;
    }

    _createNewReaderHolder() {
        // The reader holder closes and removes itself when its child reader is removed.
        const $readerHolder = $('<div class="uncharted-cards-reader-holder"></div>');

        const observer = new MutationObserver(mutations => {
            if (mutations[0].removedNodes.length > 0) {
                $readerHolder.css({ height: '0' });
            }
        });
        observer.observe($readerHolder[0], { childList: true });

        $readerHolder[0].addEventListener('transitionend', event => {
            if (event.propertyName === 'height' && $readerHolder.height() === 0) {
                $readerHolder.remove();
            }
        });

        return $readerHolder;
    }

    resize() {
        this._markedCard && this.$readerHolder.height() > 0 && this.placeUnder(this._markedCard, true);
    }

    _expandReaderHolder() {
        this.$readerHolder.css({ height: `${this._config['verticalReader.height']}px`});
    }

    updateCardInstances(cardInstances = []) {
        this._cardInstances = cardInstances;
    }

    open(card) {
        this.placeUnder(card);
        requestAnimationFrame(() => {
            this._expandReaderHolder();
        });
    }

    close() {
        this.$element && this.$element.detach();
    }

    updateReaderContent(card, readerContentData) {
        card.readerContent.updateData(readerContentData);
        this.$element.find('.reader-content-container').html(card.readerContent.render());
    }

    placeUnder(card, stayOpened) {
        const targetCardPosition = card.$element.position();
        const elementsInSameRow = card.$element.nextAll()
            .filter((index, ele) => $(ele).position().top === targetCardPosition.top);
        const lastElementInRow = elementsInSameRow[elementsInSameRow.length - 1] || card.$element;

        const $nextElement = $(lastElementInRow).next();
        const $prevReaderHolder = this.$readerHolder;
        if (!$nextElement.is($prevReaderHolder)) {
            const $newReaderHolder = this._createNewReaderHolder();
            $newReaderHolder.append(this.$element);
            if (stayOpened) {
                $prevReaderHolder.remove();
                this._expandReaderHolder();
            }
            $(lastElementInRow).after($newReaderHolder);
        }
        this._placeMarker(card);
    }
}
