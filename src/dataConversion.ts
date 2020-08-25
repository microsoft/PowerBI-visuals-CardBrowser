/*
 * Copyright 2018 Uncharted Software Inc.
 */
/// <reference path="../types/PowerBI-Visuals-2.6.0.d.ts" />

import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;

import * as utils from './utils';
import * as moment from 'moment';

import { HTML_WHITELIST_SUMMARY, HTML_WHITELIST_CONTENT } from './constants';
import { HashMap, CardBrowserDocument, CardBrowserDocumentData } from './types';

function flattenMetaData(metaData) {
    const metaDataArray = Array.isArray(metaData) ? metaData : [metaData];
    const metaDataObject = {};
    for (let i = 0; i < metaDataArray.length; i++) {
        metaDataObject[metaDataArray[i].key] = metaDataArray[i].value;
    }
    return metaDataObject;
}

function createSelectionId(i, dataView: DataView, host) {
    const category = dataView.categorical.categories.find(n => n.source.roles.id);
    return host.createSelectionIdBuilder()
        .withCategory(category, i)
        .withMeasure(dataView.metadata.columns.find((col) => col.roles.id).queryName)
        .createSelectionId();
}

function convertToDocuments(rowObjs: CardBrowserDocument[], dataView, host): CardBrowserDocumentData {
    const documents: HashMap<CardBrowserDocument> = {};
    const documentList: CardBrowserDocument[] = [];
    let obj: CardBrowserDocument;
    let docId: string | number;
    let i: number;
    const rowCount = rowObjs.length;

    for (i = 0; i < rowCount; i++) {
        obj = rowObjs[i];
        docId = obj.id;
        if (docId !== null && !documents[docId]) {
            obj.selectionId = createSelectionId(i, dataView, host);
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

function assignValue(role, displayName, columnValue) {
    switch (role) {
        case 'metadata':
            return {
                key: displayName,
                value: columnValue,
            };
        case 'summary':
            return utils.sanitizeHTML(columnValue, HTML_WHITELIST_SUMMARY);
        default:
            return columnValue;
    }
}

function convertToRowObjs(dataView: DataView, settings, roles = null): CardBrowserDocument[] {
    const result = [];
    // const columns = dataView.metadata.columns;
    let rowObj: any;
    let firstRoleIndexMap = [];
    const categorical =
        dataView &&
        dataView.categorical;
    const categories =
        categorical &&
        dataView.categorical.categories;
    const columnValues =
        categorical &&
        dataView.categorical.values;
    function parseColumn(column: powerbi.DataViewMetadataColumn, colValue: any, colIdx: number) {
        const colRoles = Object.keys(column.roles);
        const columnValue = colValue && (column.type.dateTime ?
                moment(colValue as any).format(settings.presentation.dateFormat) : colValue);
        colRoles.forEach((role) => {
            if (rowObj[role] === undefined) {
                rowObj[role] = assignValue(role, column.displayName, columnValue);
                firstRoleIndexMap[role] = colIdx;
                return;
            }
            if (!Array.isArray(rowObj[role])) {
                const firstRoleValue = rowObj[role];
                rowObj[role] = [];
                assignRole(rowObj, role, firstRoleValue, roles, firstRoleIndexMap[role]);
            }
            assignRole(rowObj, role, assignValue(role, column.displayName, columnValue), roles, colIdx);
        });
    }
    if (categories && categories.length > 0 && categories[0].values && categories[0].values.length > 0) {
        const idValues = categories[0].values;
        for (let rowIdx = 0; rowIdx < idValues.length; rowIdx++) {
            rowObj = {
                index: rowIdx,
            };
            for (const cat of categories) {
                parseColumn(cat.source, cat.values[rowIdx], 0);
            }

            if (columnValues && columnValues.length > 0) {
                columnValues.forEach((valueCol, colIdx) => {
                    const column = valueCol.source;
                    const colValue = valueCol.values[rowIdx];
                    parseColumn(column, colValue, colIdx + 1);
                });
            }

            if (rowObj.metadata) {
                rowObj.metadata = flattenMetaData(rowObj.metadata);
            }

            if (rowObj.subtitle) {
                if (Array.isArray(rowObj.subtitle)) {
                    rowObj.subtitle = rowObj.subtitle.filter(item => item);
                }
                else {
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
                if (!rowObj.summary) {
                    rowObj.summary = utils.sanitizeHTML(rowObj.content, HTML_WHITELIST_SUMMARY);
                }
            }

            if (rowObj.title && Array.isArray(rowObj.title)) {
                rowObj.title = rowObj.title.join(' ');
            }

            result.push(rowObj);
        }
    }
    return result;
}

function convertToDocumentData(dataView: DataView, settings, roles, host: IVisualHost) {
    const rowObjs = convertToRowObjs(dataView, settings, roles);
    return convertToDocuments(rowObjs, dataView, host);
}

function countDocuments(dataView: DataView) {
    const categories =
        dataView &&
        dataView.categorical &&
        dataView.categorical.categories;
    if (!categories || categories.length === 0) {
        return 0;
    }

    const idCat = categories.find(n => n.source.roles.id);
    if (idCat && idCat.values) {
        return Object.keys(idCat.values.reduce((map, item) => {
            map[`${item}`] = true;
            return map;
        }, {})).length;
    } else {
        return 1;
    }
}

export {
    convertToDocumentData,
    countDocuments,
};