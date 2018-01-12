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

import * as utils from './utils';
import * as sinon from 'sinon';
import { expect } from 'chai';
import mockDataView from './test_data/mockdataview';
import * as _ from 'lodash';
import { HTML_WHITELIST_CONTENT } from './constants';
import testHtmlStrings from './test_data/testHtmlStrings.js';
import DataView = powerbi.DataView;

describe('utils', () => {
    it('findColumn', () => {
        let options = _.cloneDeep(mockDataView);
        let dataView = options.dataViews[0];
        const result = utils.findColumn(dataView, 'document', false);
        expect(result).to.deep.equal(
            {
                "roles": {
                    "id": true,
                    "document": true
                },
                "type": {
                    "underlyingType": 260,
                    "category": null
                },
                "displayName": "documentID",
                "queryName": "betsydevos_lsh_strippets_browser.documentID",
                "expr": {
                    "_kind": 2,
                    "source": {
                        "_kind": 0,
                        "entity": "betsydevos_lsh_strippets_browser"
                    },
                    "ref": "documentID"
                }
            }
        );
    });

    it('hasColumns', () => {
        let options = _.cloneDeep(mockDataView);
        let dataView = options.dataViews[0];
        expect(utils.hasColumns(dataView, ['document'])).to.be.true;
    });

    it('hasRole', () => {
        const column: any = mockDataView.dataViews[0].metadata.columns[0];
        expect(utils.hasRole(column, 'title')).to.be.false;
        expect(utils.hasRole(column, 'id')).to.be.true;
        expect(utils.hasRole(column, 'document')).to.be.true;
    });

    it('removeScriptAttributes', () => {
        const $el = $('<p src=1 href=1 onerror="javascript:alert(13)"></p>');
        const element: any = $el[0];
        expect([].find.call(element.attributes, (element, index, array) => element.nodeName === 'onerror')).to.be.ok;
        utils.removeScriptAttributes(element);
        expect([].find.call(element.attributes, (element, index, array) => element.nodeName === 'onerror')).to.be.undefined;
    });

    it('sanitizes HTML', function () {
        const sanitized = utils.sanitizeHTML(testHtmlStrings.testArticle, HTML_WHITELIST_CONTENT);
        expect(sanitized).to.be.ok;
        expect(sanitized.indexOf('<script>')).to.equal(-1);
        expect(sanitized.indexOf('<SCRIPT>')).to.equal(-1);
    });
});