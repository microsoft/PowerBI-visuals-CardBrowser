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

import IColorInfo = powerbi.IColorInfo;

import * as _ from 'lodash';
import * as utils from './utils';
import * as moment from 'moment';
import { HTML_WHITELIST_SUMMARY, HTML_WHITELIST_CONTENT } from './constants';

function flattenMetaData(metaData) {
    const metaDataArray = Array.isArray(metaData) ? metaData : [metaData];
    const metaDataObject = {};
    for (let i = 0; i < metaDataArray.length; i++) {
        metaDataObject[metaDataArray[i].key] = metaDataArray[i].value;
    }
    return metaDataObject;
}

function convertToDocuments(rowObjs) {
    const documents = {};
    const documentList = [];
    let obj;
    let docId;
    let i;
    const rowCount = rowObjs.length;

    for (i = 0; i < rowCount; i++) {
        obj = rowObjs[i];
        docId = obj.id;
        if (!documents[docId]) {
            documents[docId] = obj;
            documentList.push(documents[docId]);
        }
    }

    return { documents, documentList };
}

function assignRole(rowObj, role, columnValue, roles, idx) {
    if (roles && roles.ordering) {
        const roleOrdering = roles.ordering[role];
        const index = roleOrdering.indexOf(idx);
        if (index < 0 || rowObj[role][index] !== undefined) {
            // TODO: fix the bug that causes this to happen
            rowObj[role].push(columnValue);
        }
        else {
            rowObj[role][index] = columnValue;
        }
    }
    else {
        rowObj[role].push(columnValue);
    }
}

function assignValue(role, columns, idx, columnValue) {
    switch (role) {
        case 'metadata':
            return {
                key: columns[idx].displayName,
                value: columnValue,
                index: idx,
            };
        case 'summary':
            return utils.sanitizeHTML(columnValue, HTML_WHITELIST_SUMMARY);
        default:
            return columnValue;
    }
}

function convertToRowObjs(dataView, settings, roles = null) {
    const table = dataView.table;
    const rows = table.rows;
    const columns = dataView.metadata.columns;
    const identities = table.identity || [];
    const result = [];
    const rowCount = rows.length;
    let row;
    let identity;
    let rowObj: any;
    let colRoles;
    let columnValue;
    let firstRoleIndexMap = [];

    for (let index = 0; index < rowCount; index++) {
        row = rows[index];
        identity = identities[index];
        rowObj = { index, identity };
        row.forEach((colValue, idx) => {
            colRoles = Object.keys(columns[idx].roles);
            columnValue = colValue && (columns[idx].type.dateTime ?
                moment(colValue).format(settings.presentation.dateFormat) : colValue);
            colRoles.forEach((role) => {
                if (rowObj[role] === undefined) {
                    rowObj[role] = assignValue(role, columns, idx, columnValue);
                    firstRoleIndexMap[role] = idx;
                    return;
                }
                if (!Array.isArray(rowObj[role])) {
                    const firstRoleValue = rowObj[role];
                    rowObj[role] = [];
                    assignRole(rowObj, role, firstRoleValue, roles, firstRoleIndexMap[role]);
                }
                assignRole(rowObj, role, assignValue(role, columns, idx, columnValue), roles, idx);
            });
        });

        if (rowObj.metadata) {
            rowObj.metadata = flattenMetaData(rowObj.metadata);
        }

        if (rowObj.subtitle) {
            if (!Array.isArray(rowObj.subtitle)) {
                rowObj.subtitle = [rowObj.subtitle];
            }
        }

        if (rowObj.imageUrl && Array.isArray(rowObj.imageUrl)) {
            const cleanArray = [];
            for (let i = 0; i < rowObj.imageUrl.length; i++) {
                if (rowObj.imageUrl[i]) {
                    cleanArray.push(rowObj.imageUrl[i]);
                }
            }
            rowObj.imageUrl = cleanArray;
        }

        if (rowObj.content) {
            rowObj.content = utils.sanitizeHTML(rowObj.content, HTML_WHITELIST_CONTENT);
        }
        result.push(rowObj);
    }
    return result;
}

function convertToDocumentData(dataView, settings, roles) {
    const rowObjs = convertToRowObjs(dataView, settings, roles);
    return convertToDocuments(rowObjs);
}

function countDocuments(dataView) {
    const table = dataView.table;
    const rows = table.rows;
    const columns = dataView.metadata.columns;
    const rowCount = rows.length;
    let row;
    let docId;

    const documentColumnIndex = columns.findIndex((col) => col.roles.id);
    const documents = {};

    for (let index = 0; index < rowCount; index++) {
        row = rows[index];
        docId = row[documentColumnIndex];
        if (!documents[docId]) {
            documents[docId] = 0;
        }
        documents[docId] += 1;
    }

    return Object.keys(documents).length;
}

export {
    convertToDocumentData,
    countDocuments,
};