/*
 * Copyright 2018 Uncharted Software Inc.
 */

import cardsTemplate from './cards.handlebars';
import InlineCardsView from '../inlineCardsView/inlineCardsView';
import WrappedCardsView from '../wrappedCardsView/wrappedCardsView';
import Card from '../card/card';
import { IBindable } from '../../util';
import { DEFAULT_CONFIG } from '../constants';

export default class Cards extends IBindable {
    constructor(config = {}) { // eslint-disable-line
        super();
        this._initInlineCardsView();
        this._initWrappedCardsView();
        this.reset(config);
    }

    _initInlineCardsView() {
        this.inlineCardsView = new InlineCardsView({ config: this._config });
        this.inlineCardsView.postRender = () => {
            this._fadeOutOverflowingCardMetadataTexts(this.inlineCardsView.cardsInViewPort);
        };
        this.forward(this.inlineCardsView);
    }

    _initWrappedCardsView() {
        this.wrappedCardsView = new WrappedCardsView({ config: this._config });
        this.wrappedCardsView.postRender = () => {
            this._fadeOutOverflowingCardMetadataTexts(this.wrappedCardsView.cardInstances);
        };
        this.forward(this.wrappedCardsView);
    }

    _initMoreCards(cardsData) {
        const cardsInstances = cardsData.map(data => {
            const card = new Card({ data, config: this._config });
            this.forward(card);
            return card;
        });
        this.cardInstances.push(...cardsInstances);
    }

    _fadeOutOverflowingCardMetadataTexts(cardInstances) {
        const overflowBoxElements = [];
        cardInstances.forEach(card => {
            const cardEle = card.$element && card.$element[0];
            const textBoxElements = cardEle && cardEle.querySelectorAll('.meta-data-content .overflow-box');
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
        this.cardInstances = [];
        this.inlineMode = Boolean(this._config.inlineMode);
        this.inlineCardsView.reset({ config: this._config });
        this.wrappedCardsView.reset({ config: this._config });
        return this;
    }

    render() {
        this.$element = $(cardsTemplate({
            inlineMode: this.inlineMode,
        }));
        this.inlineMode
            ? this.$element.html(this.inlineCardsView.render())
            : this.$element.html(this.wrappedCardsView.render());
        return this.$element;
    }

    resize() {
        if (this.$element) {
            this.inlineMode
                ? this.inlineCardsView.resize()
                : this.wrappedCardsView.resize();
        }
    }

    clearCards() {
        this.cardInstances = [];
        this.inlineCardsView.cardInstances = [];
        this.wrappedCardsView.cardInstances = [];
        this.inlineMode
            ? this.$element.html(this.inlineCardsView.render())
            : this.$element.html(this.wrappedCardsView.clearCards());
    }

    loadData(cardsData) {
        this.clearCards();
        this._initMoreCards(cardsData);

        this.inlineMode
            ? this.inlineCardsView.updateCardInstances(this.cardInstances)
            : this.wrappedCardsView.renderMoreCards(this.cardInstances);
    }

    loadMoreData(cardsData) {
        const numberOfCurrentCards = this.cardInstances.length;
        this._initMoreCards(cardsData);
        this.inlineMode
            ? this.inlineCardsView.updateCardInstances(this.cardInstances)
            : this.wrappedCardsView.renderMoreCards(this.cardInstances.slice(numberOfCurrentCards));
    }

    findCardById(cardId) {
        return this.cardInstances.find(card => card.data.id === cardId);
    }

    /**
     * Open a reader for the provided card
     * @param {Object} card - card instance whose reader will be opened.
     */
    openReader(card) {
        this.inlineMode
            ? this.inlineCardsView.openReader(card)
            : this.wrappedCardsView.openReader(card);
    }

    closeReader() {
        this.inlineMode
            ? this.inlineCardsView.closeReader()
            : this.wrappedCardsView.closeReader();
    }

    toggleInlineDisplayMode(state) {
        this.closeReader();
        this.inlineMode = state === undefined ? !this.inlineMode : state;
        this.cardInstances.forEach(card => {
            card.$element && card.$element.remove() && (card.$element = undefined);
            card._config.inlineMode = this.inlineMode;
        });
        this.inlineMode
            ? this.$element.html(this.inlineCardsView.render()) && this.inlineCardsView.updateCardInstances(this.cardInstances)
            : this.$element.html(this.wrappedCardsView.clearCards()) && this.wrappedCardsView.renderMoreCards(this.cardInstances);
    }

    updateReaderContent(card, readerContentData) {
        this.inlineMode
            ? card.updateReaderContent(readerContentData)
            : this.wrappedCardsView.verticalReader.updateReaderContent(card, readerContentData);
    }
}
