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

import cloneDeep from 'lodash-es/cloneDeep';
import mockDataView from './mockdataview';
import table from './table';

// pbi wraps the categories with a "wrapCtor" that has the actual data accessors
function wrapCtor(category, values) {

    this.source = category.source;
    this.identity = category.values.map(v => 'fakeId' + v);
    this.identityFields = [];
    this.values = values || [];
}

export default function populateData(data, highlights = null) {
    const options = cloneDeep(mockDataView);

    let dataView = options.dataViews[0];

    dataView.categorical.categories = dataView.categorical.categories.map(function (category, index) {
        return new wrapCtor(category, data && data[index]);
    });

    if (highlights) {
        dataView.categorical.values[0]['highlights'] = highlights;
    }

    dataView.table = table;
    return options;
}