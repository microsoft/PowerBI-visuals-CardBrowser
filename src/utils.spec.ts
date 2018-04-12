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
import * as sinon from 'sinon';
import { expect } from 'chai';
import mockDataView from './test_data/mockdataview';
import * as _ from 'lodash';
import { HTML_WHITELIST_CONTENT } from './constants';
import testHtmlStrings from './test_data/testHtmlStrings.js';
// import DataView = powerbi.DataView;

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