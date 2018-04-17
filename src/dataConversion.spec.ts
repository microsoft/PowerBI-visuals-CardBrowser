/*
 * Copyright 2018 Uncharted Software Inc.
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
