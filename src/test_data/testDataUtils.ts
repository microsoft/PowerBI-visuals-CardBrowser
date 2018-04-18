/*
 * Copyright 2018 Uncharted Software Inc.
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