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
import * as utils from './utils';
import * as moment from 'moment';
import {
    convertToDocumentData,
    countDocuments,
} from './dataConversion';
import populateData from './test_data/testDataUtils';

jest.mock('moment');
jest.mock('./utils');

window['powerbi'] = {
    visuals: {
        SelectionIdBuilder: function () {
            this.withCategory = function () { return this; };
            this.createSelectionId = function () { return this; };
        }
    }
};

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
    describe('.convertToDocumentData', () => {
        it('should convert powerbi dataview to document data', () => {
            const { dataViews } = populateData([]);
            const docData = convertToDocumentData(<any>dataViews[0], DEFAULT_SETTINGS, {}, <any>{});
            expect(docData).toMatchSnapshot();
        });
    });
    describe('.countDocuments', () => {
        it('should cont documents', () => {
            const { dataViews } = populateData([]);
            const count = countDocuments(<any>dataViews[0]);
            expect(count).toBe(4);
        });
    });
});
