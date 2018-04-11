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

import wrappedCardsViewTemplate from './wrappedCardsView.handlebars';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';
import VerticalReader from '../verticalReader/verticalReader';

export default class WrappedCardsView extends IBindable {
    constructor(spec = {}) { // eslint-disable-line
        super();
        this.reset(spec);
        this._initVerticalReader();
        this.postRender = () => {};
    }

    reset(spec = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.cardInstances = [];
        return this;
    }

    _initVerticalReader() {
        this.verticalReader = new VerticalReader({ config: this._config });
        this.verticalReader.on(EVENTS.VERTICAL_READER_NAVIGATE_CARD, card => this.scrollToVerticalReader(card.$element[0].offsetHeight, 0));
        this.forward(this.verticalReader);
    }

    _registerDomEvents() {
        this.$element.on('click', event => this.emit(EVENTS.CARDS_CLICK_BACKGROUND, this, event));
        this.$element.on('scroll', event => {
            let ticking = false;
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.$element[0].scrollTop + this.$element[0].offsetHeight >= this.$element[0].scrollHeight - 1 && this.emit(EVENTS.WRAPPED_CARDS_VIEW_SCROLL_END, this, event.originalEvent);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    render() {
        this.$element = $(wrappedCardsViewTemplate({
            cardWidth: this._config['card.width'],
        }));
        this._$cardsContainer = this.$element.find('.cards-container');
        this._$dummyCards = this.$element.find('.dummy-card');
        this.verticalReader.render();
        this._registerDomEvents();
        return this.$element;
    }

    clearCards() {
        this.cardInstances = [];
        return this.render();
    }

    resize() {
        this.verticalReader.resize();
    }

    renderMoreCards(cardInstances) {
        const cardFragments = document.createDocumentFragment();
        cardInstances.forEach(card => cardFragments.appendChild(card.render()[0]));
        this._$cardsContainer.append(cardFragments).append(this._$dummyCards);
        this.cardInstances.push(...cardInstances);
        this.verticalReader.updateCardInstances(this.cardInstances);
        this.postRender();
    }

    scrollToVerticalReader(offset = 0, duration = 0) {
        const $vReaderHolders = this.$element.find('.uncharted-cards-reader-holder');
        const currentReaderHolderOffsetTop = this.verticalReader.$readerHolder[0].offsetTop;
        let scrollTop = currentReaderHolderOffsetTop - offset;
        if ($vReaderHolders[0].offsetTop < currentReaderHolderOffsetTop) {
            scrollTop -= this._config['verticalReader.height'];
        }
        this.$element.animate({scrollTop: scrollTop}, duration);
    }

    openReader(card) {
        this.verticalReader.open(card);
        this.scrollToVerticalReader(card.$element[0].offsetHeight, this._config.scrollToVerticalReaderDuration);
    }

    closeReader() {
        this.verticalReader.close();
    }
}
