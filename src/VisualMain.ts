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
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualHost = powerbi.extensibility.v110.IVisualHost;
import DataViewScopeIdentity = powerbi.DataViewScopeIdentity;
import IVisualHostServices = powerbi.IVisualHostServices;
import IColorInfo = powerbi.IColorInfo;
import DataView = powerbi.DataView;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;

import * as Promise from 'bluebird';
import * as $ from 'jquery';
import Thumbnails from '@uncharted/cards/src';
import * as _ from 'lodash';
import * as utils from './utils';
import {
    convertToDocumentData,
    countDocuments,
} from './dataConversion';
import {
    REQUIRED_FIELDS,
} from './constants';

import {
    DEFAULT_CONFIG,
    EVENTS,
} from '../lib/@uncharted/cards/src/components/constants';

export default class Cards implements IVisual {

    private element: JQuery;
    private dataView: DataView;
    private thumbnails: any;
    private documentData: any;
    private hostServices: IVisualHostServices;
    private isSandboxed: Boolean;
    private updateData: Function;
    private loadedDocumentCount = 0;
    private isLoadingMore = false;
    private isThumbnailsWrapLayout = !DEFAULT_CONFIG.inlineMode;
    private thumbnailsWrapTimeout: any = null;
    private suppressNextUpdate: boolean;

    /**
     * Default formatting settings
     */
    private static DEFAULT_SETTINGS = {
        presentation: {
            wrap: true,
            height: 250,
            summaryUrl: true,
        },
        loadMoreData: {
            enabled: false,
            limit: 500
        },
    };
    private settings = $.extend({}, Cards.DEFAULT_SETTINGS);

    /* init function for legacy api */
    constructor(options: VisualConstructorOptions) {
        this.hostServices = options.host.createSelectionManager()['hostServices'];
        this.isSandboxed = this.hostServices['messageProxy'];
        // this.isSandboxed = (this.hostServices.constructor.name === "SandboxVisualHostServices");
        // this.isSandboxed = (this.hostServices.constructor.name.toLowerCase().indexOf('sandbox') !== -1);

        this.element = $(`
            <div class='visual-container'>
            </div>
        `).appendTo(options.element);

        this.thumbnails = new Thumbnails($.extend({}, DEFAULT_CONFIG, this.settings));
        this.element.append(this.thumbnails.$element);

        this.thumbnails.on('thumbnail:click', (thumbnail) => {
            if (!thumbnail.isExpanded) {
                this.thumbnails.updateReaderContent(thumbnail, {
                    content: '<h1> Loading... </h1>',
                });
                this.thumbnails.openReader(thumbnail);
                setTimeout(() => this.thumbnails.updateReaderContent(thumbnail, {
                    content: thumbnail.data.content,
                    metadata: thumbnail.data.metadata,
                }), 1000);
            }
        });

        this.thumbnails.on('verticalReader:navigateToThumbnail', (thumbnail) => {
            this.thumbnails.updateReaderContent(thumbnail, thumbnail.data);
        });

        this.thumbnails.on('readerContent:clickCloseButton', () => {
            this.thumbnails.closeReader();
        });

        // flipping example
        this.thumbnails.$element.on('mouseenter', '.thumbnail', (event) => {
            const thumbnailId = $(event.currentTarget).data('id');
            if (this.documentData && this.documentData.documents[thumbnailId].metadata) {
                this.thumbnails.findThumbnailById(thumbnailId).isFlipped = true;
            }
        });
        this.thumbnails.$element.on('mouseleave', '.thumbnail', (event) => {
            const thumbnailId = $(event.currentTarget).data('id');
            this.thumbnails.findThumbnailById(thumbnailId).isFlipped = false;
        });

        this.wrapThumbnails(this.settings.presentation.wrap);

        this.updateData = () => {
            this.thumbnails.loadData(this.documentData.documentList);
            console.log("loaded " + this.loadedDocumentCount + " documents");
        };
    }

    public update(options: VisualUpdateOptions) {
        if (this.suppressNextUpdate) {
            this.suppressNextUpdate = false;
            return;
        }
        if (options.type & powerbi.VisualUpdateType.Resize) {
            // POST PROCESS (once all the thumbnails have been rendered)
            this.clearWrapTimeout();
            this.thumbnailsWrapTimeout = setTimeout(() => {
                const desiredThumbnailHeight = this.settings.presentation.height;
                const viewport: any = options.viewport;
                let oldIsWrap = this.isThumbnailsWrapLayout;
                const $thumbnail = this.thumbnails.$element.find('.thumbnail');

                this.wrapThumbnails(viewport.height >= 1.5 * desiredThumbnailHeight);
                
                if (this.isThumbnailsWrapLayout) {
                    $thumbnail.height(desiredThumbnailHeight);
                }
                else {
                    $thumbnail.height('100%');
                }

                if (this.isThumbnailsWrapLayout !== oldIsWrap) {
                    this.suppressNextUpdate = true;
                    this.hostServices.persistProperties({
                        merge: [
                            {
                                objectName: 'presentation',
                                selector: undefined,
                                properties: { wrap: this.isThumbnailsWrapLayout },
                            },
                        ],
                    });
                }

                this.thumbnailsWrapTimeout = null;
            }, 200);
        }

        if (!options.dataViews || !(options.dataViews.length > 0)) { return; }
        if (!utils.hasColumns(options.dataViews[0], REQUIRED_FIELDS)) { return; }

        this.dataView = options.dataViews[0];
        const newObjects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        this.settings = $.extend(true, {}, Cards.DEFAULT_SETTINGS, newObjects);
        this.loadedDocumentCount = this.dataView ? countDocuments(this.dataView) : 0;
        this.isLoadingMore = (this.settings.loadMoreData.enabled &&
            this.loadedDocumentCount < this.settings.loadMoreData.limit &&
            !!this.dataView.metadata.segment);
        if (this.isLoadingMore) {
            // need to load more data
            this.isLoadingMore = true;
            this.hostServices.loadMoreData();
            return;
        }

        const anyOptions: any = options;
        this.documentData = convertToDocumentData(this.dataView,
            anyOptions.dataTransforms && anyOptions.dataTransforms.roles);
        this.updateData();
    }

    private sendSelectionToHost(identities: DataViewScopeIdentity[]) {
        const selectArgs = {
            data: identities.map((identity: DataViewScopeIdentity) => ({ data: [identity] })),
            visualObjects: [],
        };
        this.hostServices.onSelect(selectArgs);
    }

    /**
     * Set the wrapping state of the thumbnails component.
     * @param {Boolean} wrapped - true if thumbnails should be rendered in multiple rows; false to keep them all in one row
     */
    private wrapThumbnails(wrapped: boolean) {
        this.thumbnails.inlineMode = (!wrapped);
        this.isThumbnailsWrapLayout = wrapped;
    }

    private clearWrapTimeout(): void {
        if (this.thumbnailsWrapTimeout !== null) {
            clearTimeout(this.thumbnailsWrapTimeout);
            this.thumbnailsWrapTimeout = null;
        }
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
        this.clearWrapTimeout();
        this.thumbnails = null;
        this.hostServices = null;
    }
}
