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
import populateData from './test_data/testDataUtils';
import colors from './test_data/colors';
// import IVisualHost = powerbi.extensibility.v120.IVisualHost;

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
        expect(count).toBe(4);
    });

    it('convertToDocumentData', () => {
        documentData = dataConversion.convertToDocumentData(options.dataViews[0], DEFAULT_SETTINGS, {}, {});
        expect(documentData).toBeTruthy();
        expect(documentData.documentList.length).toBe(4);
        expect(documentData.documents).toBeTruthy();
    });
});
