/**
 * Copyright (c) 2017 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the 'Software'), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// <reference path="../node_modules/powerbi-visuals/lib/powerbi-visuals.d.ts"/>

import IVisual = powerbi.extensibility.v110.IVisual;
import VisualConstructorOptions = powerbi.extensibility.v110.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import IViewport = powerbi.IViewport;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualHost = powerbi.extensibility.v110.IVisualHost;
import DataViewScopeIdentity = powerbi.DataViewScopeIdentity;
import IVisualHostServices = powerbi.IVisualHostServices;
import IColorInfo = powerbi.IColorInfo;
import DataView = powerbi.DataView;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualDataChangeOperationKind = powerbi.VisualDataChangeOperationKind;

import * as Promise from 'bluebird';
import * as $ from 'jquery';
import Thumbnails from '../lib/@uncharted/cards/src';
import * as _ from 'lodash';
import * as debounce from 'lodash/debounce';
import * as utils from './utils';
import {
    convertToDocumentData,
    countDocuments,
} from './dataConversion';
import * as constants from './constants';

import {
    EVENTS,
} from '../lib/@uncharted/cards/src/components/constants';
const visualTemplate = require('./visual.handlebars');
const loaderTemplate = require('./loader.handlebars');

export default class CardBrowser8D7CFFDA2E7E400C9474F41B9EDBBA58 implements IVisual {

    private $element: JQuery;
    private $container: JQuery;
    private dataView: DataView;
    private thumbnails: any;
    private documentData: any;
    private hostServices: IVisualHostServices;
    private isSandboxed: Boolean;
    private isDesktop: Boolean = true;
    private loadedDocumentCount = 0;
    private isLoadingMore = false;
    private hasMoreData = false;
    private isInline = true;
    private $loaderElement: JQuery;

    private settings = $.extend({}, constants.DEFAULT_VISUAL_SETTINGS);
    private isFlipped = this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA;

    /* init function for legacy api */
    constructor(options: VisualConstructorOptions) {
        this.hostServices = options.host.createSelectionManager()['hostServices'];

        // Start hacks to detect sandboxing & desktop...
        this.isSandboxed = this.hostServices['messageProxy'];
        // this.isSandboxed = (this.hostServices.constructor.name === "SandboxVisualHostServices");
        // this.isSandboxed = (this.hostServices.constructor.name.toLowerCase().indexOf('sandbox') !== -1);
        //const anyData : any = powerbi.data;
        //this.isDesktop = (anyData.dsr.wireContracts !== undefined); // this check isn't working in sand-box mode
        // ... end hacks

        this.$element = $(visualTemplate({
            isDesktop: this.isDesktop,
        })).appendTo(options.element);
        this.$loaderElement = $(loaderTemplate());

        this.thumbnails = new Thumbnails();
        this.$container = this.$element.find('.container');
        this.$container.append(this.thumbnails.render());

        this.thumbnails.on(EVENTS.THUMBNAIL_CLICK, (thumbnail) => {
            if (!thumbnail.isExpanded) {
                this.thumbnails.updateReaderContent(thumbnail, thumbnail.data);
                this.thumbnails.openReader(thumbnail);
            }
        });

        this.thumbnails.on(EVENTS.VERTICAL_READER_NAVIGATE_THUMBNAIL, (thumbnail) => {
            this.thumbnails.updateReaderContent(thumbnail, thumbnail.data);
        });

        this.thumbnails.on(`${EVENTS.READER_CONTENT_CLICK_CLOSE} ${EVENTS.THUMBNAILS_CLICK_BACKGROUND} ${EVENTS.VERTICAL_READER_CLICK_BACKGROUND}`, () => {
            this.thumbnails.closeReader();
        });

        // close the reader when clicked above
        this.$element.find('.flip-panel').on('click', (event) => {
            if ($(event.target).hasClass('flip-panel')) {
                // When the outside portion of the flip panel (that centers the switch) is clicked,
                // close the reader
                this.thumbnails.closeReader();
            }
        });

        // Flipping cards involves two hacks:
        // ... 1. IE11 doesn't behave well, so we skip the transition altogether there
        const isIE11 = !!navigator.userAgent.match(/Trident\/7\./);

        const onChange = isIE11 ? (flipSide => {
            this.thumbnails.thumbnailInstances.forEach(thumbnail => thumbnail.flip(flipSide));
        }) : (flipSide => {
            // ... 2. Text is blurry if certain animation-oriented CSS fx are permanently set, so only turn them on during the transition
            this.$container.toggleClass('cards-flipped', !flipSide);
            this.$container.addClass('animating');
            window.requestAnimationFrame(() => {
                this.thumbnails.thumbnailInstances.forEach(thumbnail => thumbnail.flip(flipSide));
                setTimeout(() => this.$container.removeClass('animating cards-flipped'), constants.FLIP_ANIMATION_DURATION);
            });
        });

        const onInput = (event) => {
            if (this.thumbnails.thumbnailInstances && this.thumbnails.thumbnailInstances.length) {
                this.isFlipped = (event.currentTarget.id === constants.CARD_FACE_METADATA);
                const otherButtonId = '#' + (this.isFlipped ? constants.CARD_FACE_PREVIEW : constants.CARD_FACE_METADATA);
                $(event.target.parentElement).find(otherButtonId).removeAttr('checked');
                onChange(this.isFlipped);
                return false;
            }
        };

        this.$element.on('change', 'input', onInput);

        // set up infinite scroll
        let infiniteScrollTimeoutId:any;

        this.thumbnails.on('inlineThumbnailsView:scrollEnd wrappedThumbnailsView:scrollEnd', () => {
            console.log('scrollEnd');
            infiniteScrollTimeoutId = setTimeout(() => {
                clearTimeout(infiniteScrollTimeoutId);
                if (!this.isLoadingMore && this.hasMoreData) {
                    this.isLoadingMore = true;
                    this.showLoader();
                    this.hostServices.loadMoreData();
                }
            }, constants.INFINITE_SCROLL_DELAY);
        });
    }

    public update(options: VisualUpdateOptions) {
        if (options['resizeMode']) {
            debounce(() => {
                const shouldInline = this.isInlineSize(options.viewport);
                if (shouldInline !== this.isInline) {
                    this.changeWrapMode(options.viewport);
                }
                this.thumbnails.resize();
            }, 200)();
            return;
        }

        if (!options.dataViews || !(options.dataViews.length > 0)) { return; }
        if (!utils.hasColumns(options.dataViews[0], constants.REQUIRED_FIELDS)) { return; }

        this.dataView = options.dataViews[0];
        const newObjects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        this.settings = $.extend(true, {}, constants.DEFAULT_VISUAL_SETTINGS, newObjects);

        let previousLoadedDocumentCount = 0;
        if (options.operationKind === VisualDataChangeOperationKind.Append) {
            previousLoadedDocumentCount = this.loadedDocumentCount;
        }

        this.loadedDocumentCount = this.dataView ? countDocuments(this.dataView) : 0;

        this.hasMoreData = !!this.dataView.metadata.segment;
        this.isLoadingMore = (this.settings.loadMoreData.enabled
        && this.loadedDocumentCount < this.settings.loadMoreData.limit
        && this.hasMoreData);
        if (this.isLoadingMore) {
            // need to load more data
            this.isLoadingMore = true;
            this.showLoader();
            this.hostServices.loadMoreData();
            return;
        }

        this.documentData = convertToDocumentData(this.dataView, this.settings, options['dataTransforms'] && options['dataTransforms'].roles);

        if (!previousLoadedDocumentCount) {
            this.isFlipped = this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA;
        }
        this.updateVisualStyleConfigs();

        this.hideLoader();
        if (previousLoadedDocumentCount) {
            this.thumbnails.loadMoreData(this.documentData.documentList.slice(previousLoadedDocumentCount));
            if (this.isFlipped !== (this.settings.flipState.cardFaceDefault === constants.CARD_FACE_METADATA)) {
                for (let i = previousLoadedDocumentCount; i < this.loadedDocumentCount; i++ ) {
                    this.thumbnails.thumbnailInstances[i].flip(this.isFlipped);
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
            utils.findColumn(this.dataView, constants.CONTENT_FIELD) !== undefined)) ||
                // looking at front with back defined
            (this.settings.flipState.cardFaceDefault === constants.CARD_FACE_PREVIEW &&
            utils.hasColumns(this.dataView, constants.METADATA_FIELDS))));

        this.hideRedundantInfo();

        const headerHSL = utils.convertToHSL(this.settings.reader.headerBackgroundColor.solid.color);
        this.$container.toggleClass('lightButton', headerHSL[2] < 0.5);

        const previewButton: any = this.$element.find('#preview')[0];
        previewButton.checked = !this.isFlipped;
        const metaDataButton: any = this.$element.find('#metadata')[0];
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
        this.$container.html(this.thumbnails.reset({
            'subtitleDelimiter': this.settings.presentation.separator,
            'thumbnail.disableFlipping': !this.settings.flipState.enableFlipping,
            'thumbnail.displayBackCardByDefault': this.isFlipped,
            'thumbnail.enableBoxShadow': this.settings.presentation.shadow,
            'thumbnail.expandedWidth': this.settings.reader.width,
            'thumbnail.width': this.settings.presentation.thumbnailWidth,
            'readerContent.headerBackgroundColor': this.settings.reader.headerBackgroundColor.solid.color,
            'readerContent.headerSourceLinkColor': this.settings.reader.headerTextColor.solid.color,
            'verticalReader.height': this.settings.reader.height,
        }).render());
        this.thumbnails.loadData(this.documentData.documentList);
        this.$container.toggleClass('disable-back-card-image', !this.settings.presentation.showImageOnBack);

        window.setTimeout(() => {
            this.changeWrapMode(viewport);
        }, 250);
    }

    private isInlineSize(viewport: IViewport) {
        const thumbnailHeight = (this.thumbnails.thumbnailInstances[0] && this.thumbnails.thumbnailInstances[0].$element) ?
            this.thumbnails.thumbnailInstances[0].$element.height() :
            constants.WRAP_THRESHOLD; // a reasonable guess for when we're called before loadData (e.g. by ctor)
        return thumbnailHeight &&
            viewport.height <= thumbnailHeight * constants.WRAP_HEIGHT_FACTOR;

    }

    private changeWrapMode(viewport: IViewport) {
        const isViewPortHeightSmallEnoughForInlineThumbnails = this.isInlineSize(viewport);
        this.thumbnails.toggleInlineDisplayMode(isViewPortHeightSmallEnoughForInlineThumbnails);
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
        this.thumbnails = null;
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
}
