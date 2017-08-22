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

import DataView = powerbi.DataView;
import * as _ from 'lodash';
import mockDataView from './mockdataview';
import table from './table';

// pbi wraps the categories with a "wrapCtor" that has the actual data accessors
function wrapCtor(category, values) {
    this.source = category.source;
    this.identity = [];
    this.identityFields = [];
    this.values = values || [];
}

export default function populateData(data, highlights = null) {
    const options = _.cloneDeep(mockDataView);

    let dataView = options.dataViews[0];

    dataView.categorical.categories = dataView.categorical.categories.map(function (category, index) {
        return new wrapCtor(category, data && data[index]);
    });

    if (highlights) {
        dataView.categorical.values[0].highlights = highlights;
    }

    dataView.table = table;
    return options;
}