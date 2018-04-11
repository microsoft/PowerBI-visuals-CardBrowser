/*
 * Copyright 2018 Uncharted Software Inc.
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

/// <reference path="../node_modules/powerbi-visuals/lib/powerbi-visuals.d.ts"/>

import IVisual = powerbi.extensibility.v120.IVisual;
import VisualConstructorOptions = powerbi.extensibility.v120.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import IViewport = powerbi.IViewport;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualHost = powerbi.extensibility.v120.IVisualHost;
import DataViewScopeIdentity = powerbi.DataViewScopeIdentity;
import IVisualHostServices = powerbi.IVisualHostServices;
import IColorInfo = powerbi.IColorInfo;
import DataView = powerbi.DataView;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;

import * as $ from 'jquery';
import Cards from '../lib/@uncharted/cards/src/index.js';
import * as utils from './utils';
import {
    convertToDocumentData,
    countDocuments,
} from './dataConversion';
import * as constants from './constants';

import {
    EVENTS,
    DEFAULT_CONFIG,
} from '../lib/@uncharted/cards/src/components/constants';

const debounce = require('lodash/debounce');
const visualTemplate = require('./visual.handlebars');
const loaderTemplate = require('./loader.handlebars');

export default class CardBrowser8D7CFFDA2E7E400C9474F41B9EDBBA58 implements IVisual {

    private $element: JQuery;
    private $container: JQuery;
    private dataView: DataView;
    private cards: any;
    private documentData: any;
    private hostServices: IVisualHostServices;
    private isSandboxed: Boolean;
    private context: any;
    private loadedDocumentCount = 0;
    private isLoadingMore = false;
    private hasMoreData = false;
    private isInline = true;
    private $loaderElement: JQuery;
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private loadMoreData: Function;
    private launchUrl: Function;

    private settings = $.extend({}, constants.DEFAULT_VISUAL_SETTINGS);
    private isFlipped = this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA;

    /* init function for legacy api */
    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.hostServices = this.selectionManager['hostServices'];

        // Start hacks to detect sandboxing & desktop...
        this.isSandboxed = this.hostServices['messageProxy'];
        // console.log(!!options.host.createSelectionManager()['hostServices']['applyJsonFilter']);
        // this.isSandboxed = (this.hostServices.constructor.name === "SandboxVisualHostServices");
        // this.isSandboxed = (this.hostServices.constructor.name.toLowerCase().indexOf('sandbox') !== -1);
        // const anyData : any = powerbi.data;
        // ... end hacks

        this.context = {
            enableBlurFix: true,
            // enableBlurFix: (anyData.dsr.wireContracts !== undefined), // this check isn't working in sand-box mode
            previewId: 'preview-' + this.hostServices['instanceId'],
            metadataId: 'metadata-' + this.hostServices['instanceId'],
        };
        this.$element = $(visualTemplate(this.context)).appendTo(options.element);
        this.$loaderElement = $(loaderTemplate());

        this.cards = new Cards();
        this.$container = this.$element.find('.container');
        this.$container.append(this.cards.render());

        this.cards.on(`${EVENTS.THUMBNAIL_CLICK}`, (card) => {
            if (!card.isExpanded) {
                this.cards.updateReaderContent(card, card.data);
                this.cards.openReader(card);
                this.applySelection(card.data);
            }
        });

        this.cards.on(EVENTS.VERTICAL_READER_NAVIGATE_THUMBNAIL, (card) => {
            this.cards.updateReaderContent(card, card.data);
        });

        this.cards.on(`${EVENTS.READER_CONTENT_CLICK_CLOSE} ${EVENTS.THUMBNAILS_CLICK_BACKGROUND} ${EVENTS.VERTICAL_READER_CLICK_BACKGROUND}`, () => {
            this.cards.closeReader();
            this.applySelection(null);
        });

        // close the reader when clicked above
        this.$element.find('.flip-panel').on('click', (event) => {
            if ($(event.target).hasClass('flip-panel')) {
                // When the outside portion of the flip panel (that centers the switch) is clicked,
                // close the reader
                this.cards.closeReader();
            }
        });

        // Flipping cards involves two hacks:
        // ... 1. IE11 doesn't behave well, so we skip the transition altogether there
        const isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
        const isSafari = /.*AppleWebKit(?!.*Chrome)/i.test(navigator.userAgent);
        const isIOS = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
        const isNativeAndroidApp = /AppName\/[0-9\.]+$/.test(navigator.userAgent);

        const onChange = (isIE11 || isSafari || isIOS) ? (() => {
            this.cards.cardInstances.forEach(card => card.flip(this.isFlipped));
        }) : (() => {
            // ... 2. Text is blurry if certain animation-oriented CSS fx are permanently set, so only turn them on during the transition
            this.$container.toggleClass('cards-flipped', !this.isFlipped);
            this.$container.addClass('animating');
            setTimeout(() => {
                this.cards.cardInstances.forEach(card => card.flip(this.isFlipped));
                setTimeout(() => this.$container.removeClass('animating cards-flipped'), constants.FLIP_ANIMATION_DURATION);
            }, 50);
        });

        const onInput = (event) => {
            if (this.cards.cardInstances && this.cards.cardInstances.length) {
                this.isFlipped = (event.currentTarget.id === this.context.metadataId);
                const otherButtonId = '#' + (this.isFlipped ? this.context.previewId : this.context.metadataId);
                $(event.target.parentElement).find(otherButtonId).removeAttr('checked');
                onChange();
                return false;
            }
        };

        this.$element.find('input').on('change', onInput);
        if (isIOS || isNativeAndroidApp) {
            this.$element.toggleClass('mobile', true);
        }

        // set up infinite scroll
        let infiniteScrollTimeoutId: any;

        const findApi = (methodName) => {
            return this.host[methodName] ? (arg) => {
                this.host[methodName](arg);
            } : this.hostServices && this.hostServices[methodName] ? (arg) => {
                this.hostServices[methodName](arg);
            } : null;
        };

        this.loadMoreData = findApi("loadMoreData");
        this.launchUrl = findApi("launchUrl");

        this.launchUrl && this.cards.on(`${EVENTS.THUMBNAIL_CLICK_LINK} ${EVENTS.READER_CONTENT_CLICK_LINK}`, (event) => {
            this.launchUrl(event.currentTarget.href);
        });

        this.cards.on(`${EVENTS.INLINE_THUMBNAILS_VIEW_SCROLL_END} ${EVENTS.WRAPPED_THUMBNAILS_VIEW_SCROLL_END}`, debounce(() => {
            console.log('scrollEnd');
            infiniteScrollTimeoutId = setTimeout(() => {
                clearTimeout(infiniteScrollTimeoutId);
                if (!this.isLoadingMore && this.hasMoreData && this.loadMoreData) {
                    this.isLoadingMore = true;
                    this.showLoader();
                    this.loadMoreData();
                }
            }, constants.INFINITE_SCROLL_DELAY);
        }));
    }

    public update(options: VisualUpdateOptions) {
        if (options['resizeMode']) {
            debounce(() => {
                const shouldInline = this.isInlineSize(options.viewport);
                if (shouldInline !== this.isInline) {
                    this.changeWrapMode(options.viewport);
                }
                this.cards.resize();
            }, 200)();
            return;
        }

        if (!options.dataViews || !(options.dataViews.length > 0)) { return; }
        if (!utils.hasColumns(options.dataViews[0], constants.REQUIRED_FIELDS)) { return; }

        this.dataView = options.dataViews[0];
        const newObjects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        // const wasFiltering = this.settings.presentation.filter;
        this.settings = $.extend(true, {}, constants.DEFAULT_VISUAL_SETTINGS, newObjects);

        let previousLoadedDocumentCount = 0;
        if (options.operationKind === VisualDataChangeOperationKind.Append) {
            previousLoadedDocumentCount = this.loadedDocumentCount;
        }

        this.loadedDocumentCount = this.dataView ? countDocuments(this.dataView) : 0;

        this.hasMoreData = !!this.dataView.metadata.segment;
        this.isLoadingMore = (this.settings.loadMoreData.enabled && this.loadMoreData
        && this.loadedDocumentCount < this.settings.loadMoreData.limit
        && this.hasMoreData);
        if (this.isLoadingMore) {
            // need to load more data
            this.isLoadingMore = true;
            this.showLoader();
            this.loadMoreData();
            return;
        }

        this.documentData = convertToDocumentData(this.dataView,
            this.settings, options['dataTransforms'] && options['dataTransforms'].roles, this.host);

        if (!previousLoadedDocumentCount) {
            this.isFlipped = this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA;
        }
        this.updateVisualStyleConfigs();
        // if (wasFiltering && !this.settings.presentation.filter) {
        //    // clear any current filter
        //    this.selectionManager.clear();
        // }

        this.hideLoader();
        if (previousLoadedDocumentCount) {
            this.cards.loadMoreData(this.documentData.documentList.slice(previousLoadedDocumentCount));
            if (this.isFlipped !== (this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA)) {
                for (let i = previousLoadedDocumentCount; i < this.loadedDocumentCount; i++ ) {
                    this.cards.cardInstances[i].flip(this.isFlipped);
                }
            }
        } else {
            this.updateThumbnails(options.viewport);
        }
    }

    private updateVisualStyleConfigs() {
        this.$element.toggleClass('enable-flipping', this.settings.flipState.enableFlipping &&
            (this.dataView !== undefined &&
                // looking at back with front defined
            (this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA &&
            (utils.findColumn(this.dataView, constants.SUMMARY_FIELD) !== undefined ||
            utils.findColumn(this.dataView, constants.IMAGE_FIELD) !== undefined ||
            utils.findColumn(this.dataView, constants.CONTENT_FIELD) !== undefined)) ||
                // looking at front with back defined
            (this.settings.flipState.cardFaceDefault === constants.CARD_FACE_PREVIEW &&
            utils.hasColumns(this.dataView, constants.METADATA_FIELDS))));

        this.hideRedundantInfo();

        const headerHSL = utils.convertToHSL(this.settings.reader.headerBackgroundColor.solid.color);
        this.$container.toggleClass('lightButton', headerHSL[2] < 0.5);
        this.$container.toggleClass('uncropped', !this.settings.presentation.cropImages);

        const previewButton: any = this.$element.find('#' + this.context.previewId)[0];
        previewButton.checked = !this.isFlipped;
        const metaDataButton: any = this.$element.find('#' + this.context.metadataId)[0];
        metaDataButton.checked = this.isFlipped;
    }

    private hideRedundantInfo() {
        const metadataRoleName = 'metadata';
        const titleColumn = utils.findColumn(this.dataView, 'title');
        this.$container.toggleClass('disable-back-card-title', utils.hasRole(titleColumn, metadataRoleName));

        let subtitleColumns = utils.findColumn(this.dataView, 'subtitle', true);
        if (subtitleColumns) {
            this.$container.toggleClass('disable-back-card-subtitle', subtitleColumns.findIndex((
                    subtitleColumn) => utils.hasRole(subtitleColumn, metadataRoleName)) > -1);
        }
    }

    private updateThumbnails(viewport) {
        this.isFlipped = this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA;
        const width = Math.max(constants.MIN_CARD_WIDTH, this.settings.presentation.cardWidth);

        // We do need innerHTML, so suppress tslint
        // tslint:disable-next-line
        this.$container.html(this.cards.reset({
            'subtitleDelimiter': this.settings.presentation.separator,
            'card.disableFlipping': !this.settings.flipState.enableFlipping,
            'card.displayBackCardByDefault': this.isFlipped,
            'card.disableLinkNavigation': true,
            'card.enableBoxShadow': this.settings.presentation.shadow,
            'card.expandedWidth': this.settings.reader.width,
            'card.width': width,
            'card.displayLargeImage': !this.settings.presentation.cropImages,
            'readerContent.headerBackgroundColor': this.settings.reader.headerBackgroundColor.solid.color,
            'readerContent.headerImageMaxWidth': this.settings.presentation.cardWidth - 10,
            'readerContent.headerSourceLinkColor': this.settings.reader.headerTextColor.solid.color,
            'readerContent.disableLinkNavigation': true,
            'readerContent.cropImages': this.settings.presentation.cropImages,
            'verticalReader.height': this.settings.reader.height,
        }).render());
        this.cards.loadData(this.documentData.documentList);
        this.$container.toggleClass('disable-back-card-image', !this.settings.presentation.showImageOnBack);

        window.setTimeout(() => {
            this.changeWrapMode(viewport);
        }, 250);
    }

    private isInlineSize(viewport: IViewport) {
        const cardHeight = (this.cards.cardInstances[0] && this.cards.cardInstances[0].$element) ?
            this.cards.cardInstances[0].$element.height() :
            constants.WRAP_THRESHOLD; // a reasonable guess for when we're called before loadData (e.g. by ctor)
        return cardHeight &&
            viewport.height <= cardHeight * constants.WRAP_HEIGHT_FACTOR;

    }

    private changeWrapMode(viewport: IViewport) {
        const isViewPortHeightSmallEnoughForInlineThumbnails = this.isInlineSize(viewport);
        this.cards.toggleInlineDisplayMode(isViewPortHeightSmallEnoughForInlineThumbnails);
        this.isInline = isViewPortHeightSmallEnoughForInlineThumbnails;
    }

    private sendSelectionToHost(identities: DataViewScopeIdentity[]) {
        const selectArgs = {
            data: identities.map((identity: DataViewScopeIdentity) => ({ data: [identity] })),
            visualObjects: [],
        };
        this.hostServices.onSelect(selectArgs);
    }

    /**
     * Enumerates the instances for the objects that appear in the PowerBI panel.
     *
     * @method enumerateObjectInstances
     * @param {EnumerateVisualObjectInstancesOptions} options - Options object containing the objects to enumerate, as provided by PowerBI.
     * @returns {VisualObjectInstance[]}
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        let instances: VisualObjectInstance[] = [{
            selector: null,
            objectName: options.objectName,
            properties: {}
        }];
        $.extend(true, instances[0].properties, this.settings[options.objectName]);
        return instances;
    }

    /**
     * Destroy method called by PowerBI.
     *
     * @method destroy
     */
    public destroy(): void {
        this.cards = null;
        this.hostServices = null;
    }

    /**
     * Show the animated loading icon.
     */
    private showLoader(): void {
        this.$container.append(this.$loaderElement);
    }

    /**
     * Hide the animated loading icon.
     */
    private hideLoader(): void {
        this.$loaderElement.detach();
    }

    /**
     * Send the selected article to the host, for filtering.
     *
     * @param {Object} selectedDocument - The data for the selected article
     */
    private applySelection(selectedDocument) {
        if (this.settings.presentation.filter) {
            if (selectedDocument && selectedDocument.selectionId) {
                this.selectionManager.select(selectedDocument.selectionId);
            }
            else {
                this.selectionManager.clear();
            }
        }
    }
}
