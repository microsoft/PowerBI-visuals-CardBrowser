/**
 * Copyright (c) 2017 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
window['powerbi'] = {
    visuals: {
        SelectionIdBuilder: function () {
            this.withCategory = function () { return this; };
            this.createSelectionId = function () { return this; };
        }
    }
};

import * as dataConversion from './dataConversion';
import * as sinon from 'sinon';
import { expect } from 'chai';
import populateData from './test_data/testDataUtils';
import colors from './test_data/colors';
import IVisualHost = powerbi.extensibility.v120.IVisualHost;

const DEFAULT_SETTINGS = {
    presentation: {
        wrap: true,
        height: 250,
        summaryUrl: true,
        dateFormat: 'MMM D, YYYY',
    },
    loadMoreData: {
        enabled: false,
        limit: 500
    },
};

describe('dataConversion', () => {
    let options;
    let documentData;

    before(function () {
        options = populateData([]);
    });

    it('countDocuments', () => {
        const count = dataConversion.countDocuments(options.dataViews[0]);
        expect(count).to.equal(4);
    });

    it('convertToDocumentData', () => {
        documentData = dataConversion.convertToDocumentData(options.dataViews[0], DEFAULT_SETTINGS, {},
            <IVisualHost>{});
        expect(documentData).to.be.ok;
        expect(documentData.documentList.length).to.equal(4);
        expect(documentData.documents).to.be.ok;
    });
});
