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
import Thumbnails from '@uncharted/cards/src/thumbnails';
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
    EVENTS,
} from '../lib/@uncharted/cards/src/constants';

export default class Cards implements IVisual {

    private element: JQuery;
    private dataView: DataView;
    private colors: IColorInfo[];
    private thumbnails: any;
    private thumbnailsConfig: any;
    private documentData: any;
    private hostServices: IVisualHostServices;
    private isSandboxed: Boolean;
    private updateData: Function;
    private loadedDocumentCount = 0;
    private isLoadingMore = false;

    /**
     * Default formatting settings
     */
    private static DEFAULT_SETTINGS = {
        presentation: {
            properties: {
                wrap: true,
                summaryUrl: true,
            },
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

        this.colors = options.host.colors;
        this.element = $(`
            <div class='visual-container'>
            </div>
        `).appendTo(options.element);

        // this.thumbnailsConfig = {
        //     outlineReader: {
        //         onLoadUrl: this.onThumbnailReaderLoaded.bind(this),
        //     },
        // };

        const defaultThumbnailsConfig = {
            'inlineMode': false,
            'thumbnail.expandedWidth': 520,
        };
        this.thumbnails = new Thumbnails(defaultThumbnailsConfig);
        this.element.append(this.thumbnails.$element);

        // flipping example
        this.thumbnails.$element.on('mouseenter', '.thumbnail', (event) => {
            const thumbnailId = $(event.currentTarget).data('id');
            this.thumbnails.findThumbnailById(thumbnailId).isFlipped = true;
        });
        this.thumbnails.$element.on('mouseleave', '.thumbnail', (event) => {
            const thumbnailId = $(event.currentTarget).data('id');
            this.thumbnails.findThumbnailById(thumbnailId).isFlipped = false;
        });



        // this.thumbnails = new Thumbnails({
        //     container: this.element.find('.thumbnails-panel'),
        //     config: this.thumbnailsConfig,
        // });
        // this.thumbnails.inlineMode = true;

        // this.thumbnails.off(EVENTS.THUMBNAIL_READER_CLOSE_EVENTS);
        // this.thumbnails.off('thumbnail:click');
        // this.thumbnails.on('thumbnail:click', this.onThumbnailClick.bind(this));

        // this.updateData = () => {
        //     // this.thumbnails.filter(undefined);
        //     this.thumbnails.loadData(this.documentData.documentList);
        //     console.log("loaded " + this.loadedDocumentCount + " documents");
        // };
    }

    public update(options: VisualUpdateOptions) {
        const thumbnailsSampleData = [
            {
                id: 1,
                imageUrl: 'http://mscorpnews.blob.core.windows.net/ncmedia/2015/11/000-all-future-011-1600x700.jpg',
                source: 'microsoft.com',
                sourceUrl: 'http://microsoft.com',
                sourceImage: 'https://tse1.mm.bing.net/th?&id=OIP.M3171d61d279961c0af79591e17bd762bo0&w=289&h=289&c=0&pid=1.9&rs=0&p=0&r=0',
                title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                author: 'Nam Maximus',
                articleDate: '2015-12-04 00:00:00',
                summary: 'Nam congue erat nulla, at lobortis velit efficitur eget. Pellentesque sit amet ante mattis, dignissim nisi et, efficitur nisi. Nunc vitae sapien eget arcu egestas viverra eu vitae metus. Cras et tincidunt nunc. Suspendisse vitae feugiat justo, sed malesuada est.',
                url: 'http://www.cnn.com/2015/09/27/politics/obama-un-general-assembly/index.html',
                metadata: {
                    'key1': 'value1',
                    'key2': 'value2',
                },
            },
            {
                id: 2,
                imageUrl: 'https://i.guim.co.uk/img/media/08422893c433f9b93a836f011ec65e33f020f191/0_96_2962_1778/master/2962.jpg?w=620&q=85&auto=format&sharp=10&s=584c6a435065101143cbd6c3fdbe66c0',
                source: 'google.com',
                sourceUrl: 'http://www.google.com',
                sourceImage: 'http://tse1.mm.bing.net/th?&id=OIP.Ma51a4d54e28e95bed67ec97f83c462d9o0&w=151&h=150&c=0&pid=1.9&rs=0&p=0&r=0',
                title: 'Morbi enim leo, euismod porttitor risus nec, auctor pellentesque leo',
                author: 'Quisque Donec',
                articleDate: '2015-12-27 00:00:00',
                summary: 'Mauris volutpat commodo nisi eu rutrum. Etiam molestie congue nibh id rhoncus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas ut dolor posuere, tempor dolor nec, mattis ex. Pellentesque lobortis leo ac eros sagittis, ac commodo velit feugiat.',
                url: 'http://www.cnn.com/2015/09/27/politics/obama-un-general-assembly/index.html',
                metadata: {
                    'key1': 'value1',
                    'key2': 'value2',
                },
            },
        ];
        this.thumbnails.loadData(thumbnailsSampleData);

        // const viewport: any = options.viewport;
        // const scale = viewport && viewport.scale;

        // if (!options.dataViews || !(options.dataViews.length > 0)) { return; }
        // if (!utils.hasColumns(options.dataViews[0], REQUIRED_FIELDS)) { return; }

        // // if (options['resizeMode'] && this.thumbnails) {
        // // }

        // this.dataView = options.dataViews[0];
        // const newObjects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
        // this.settings = $.extend(true, {}, Cards.DEFAULT_SETTINGS, newObjects);
        // this.loadedDocumentCount = this.dataView ? countDocuments(this.dataView) : 0;
        // this.isLoadingMore = (this.settings.loadMoreData.enabled &&
        //     this.loadedDocumentCount < this.settings.loadMoreData.limit &&
        //     !!this.dataView.metadata.segment);
        // if (this.isLoadingMore) {
        //     // need to load more data
        //     this.isLoadingMore = true;
        //     this.hostServices.loadMoreData();
        //     return;
        // }

        // const anyOptions: any = options;
        // this.documentData = convertToDocumentData(this.dataView, this.settings,
        //     anyOptions.dataTransforms && anyOptions.dataTransforms.roles);
        // this.updateData();
    }

    private sendSelectionToHost(identities: DataViewScopeIdentity[]) {
        const selectArgs = {
            data: identities.map((identity: DataViewScopeIdentity) => ({ data: [identity] })),
            visualObjects: [],
        };
        this.hostServices.onSelect(selectArgs);
    }

    private onThumbnailClick(thumbnailData) {
        const thumbnail = this.thumbnails.findThumbnailById(thumbnailData.id);
        if (thumbnail.isExpanded) { return; }

        this.thumbnails.openReader(thumbnailData);
    }

    private getReaderData(articleId: string) {
        const toPartDiv = (part) => `<div class="document-part" data-docid=${part.docId} data-index=${part.index}>${part.content}</div>`;
        const document = this.documentData && this.documentData.documentList &&
            _.find(this.documentData.documentList, (document) => document.id === articleId);
        const readerData = {
            title: document && document.title,
            content: document && document.content || document.parts.map(toPartDiv).join('\n'),
            lastupdatedon: document && document.formattedDate,
            source: document && document.source,
            sourceUrl: document && document.sourceUrl,
            figureImgUrl: '',
            figureCaption: '',
        };
        return readerData;
    }

    private onThumbnailReaderLoaded(articleId: string) {
        const readerData = this.getReaderData(articleId);
        return Promise.resolve(readerData);
    }

    private autoScroll($targetPart) {
        if ($targetPart && $targetPart[0]) {
            $targetPart.parents('._rc')[0].scrollTop =
                $targetPart[0].offsetTop - $targetPart[0].parentElement.offsetTop || 0;
        }
    }

    private closeThumbnailReader() {
        this.thumbnails.closeReader();
    }

    private openThumbnailReader(documentId) {
        const thumbnail = this.thumbnails.findThumbnailById(documentId);
        if (thumbnail) {
            if (thumbnail.isExpanded) {
                this.thumbnails.centerInlineThumbnail(thumbnail);
                return true;
            }
            else {
                this.thumbnails.openReader(thumbnail.data);
                return false;
            }
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
}
