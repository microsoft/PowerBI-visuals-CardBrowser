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
import {  } from './constants';

function convertToDocuments(rowObjs, settings) {
    const documents = {};
    const documentList = [];
    const docPartCluster = {};
    let maxNumDocParts = 0;
    let obj;
    let docId;
    let partId;
    let clusterId;
    let i;
    const rowCount = rowObjs.length;

    for (i = 0; i < rowCount; i++) {
        obj = rowObjs[i];
        docId = obj.document;
        if (!documents[docId]) {
            documents[docId] = {
                id: docId,
                readerUrl: docId,
                imageUrl: obj.imageUrl || '',
                source: obj.source || '',
                sourceUrl: obj.sourceUrl || '',
                sourceImage: obj.sourceImage || '',
                title: obj.title || '',
                author: obj.author || '',
                articledate: obj.time || '',
                summary: obj.summary || '',
                content: obj.content || '',
                entities: [],
                url: '',
                parts: []
            };
            documentList.push(documents[docId]);
        }
        if (obj.partIndex !== undefined) {
            partId = '' + docId + ':' + obj.partIndex;
            clusterId = obj.cluster;

            documents[docId].parts.push({
                clusterId: clusterId,
                size: obj.size,
                content: obj.partContent || '',
                docId: docId,
                id: partId,
                index: obj.partIndex,
                score: obj.score,
                sort: obj.sort,
            });

            maxNumDocParts = Math.max(maxNumDocParts, documents[docId].parts.length);

            if (clusterId !== undefined) {
                !docPartCluster[clusterId] && (docPartCluster[clusterId] = []);
                docPartCluster[clusterId].push(partId);
            }
        }
    }

    const toPartDiv = (part) => `<div class="summary-document-part" data-docid=${part.docId} data-index=${part.index}>${part.content}</div>`;
    let concatenatedParts;
    let doc;
    let sortPart1;
    let sortPart2;
    const docCount = documentList.length;
    for (i = 0; i < docCount; i++) {
        doc = documentList[i];
        doc.parts.sort((part1, part2) => {
            if (part1.sort !== undefined) {
                if (part1.sort.length) {
                    sortPart1 = part1.sort;
                    sortPart2 = part2.sort;
                }
                else {
                    sortPart1 = [part1.sort];
                    sortPart2 = [part2.sort];
                }
                sortPart1.push(part1.index);
                sortPart2.push(part2.index);
                const sortLength = sortPart1.length;
                for (let j = 0; j < sortLength; j++) {
                    const diff = sortPart1[j] - sortPart2[j];
                    if (diff !== 0) {
                        return diff;
                    }
                }
            }
            return part1.index - part2.index;
        });

        if (!(doc.content && doc.summary)) {
            concatenatedParts = doc.parts.map(toPartDiv).join('\n');
            doc.summary = doc.summary || concatenatedParts;
        }
    }

    documentList.sort((doc1, doc2) => {
        return moment(doc1.articledate).diff(moment(doc2.articledate));
    });

    return { documentList, maxNumDocParts, docPartCluster };
}

function assignRole(rowObj, role, columnValue, roles, idx) {
    if (roles && roles.ordering) {
        const roleOrdering = roles.ordering[role];
        const index = roleOrdering.indexOf(idx);
        rowObj[role][index] = columnValue;
    }
    else {
        rowObj[role].push(columnValue);
    }
}

function convertToRowObjs(dataView, roles = null) {
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

    for (let index = 0; index < rowCount; index++) {
        row = rows[index];
        identity = identities[index];
        rowObj = { index, identity };
        row.forEach((colValue, idx) => {
            colRoles = Object.keys(columns[idx].roles);
            columnValue = colValue && (columns[idx].type.dateTime ? new Date(colValue) : colValue);
            colRoles.forEach(role => {
                if (rowObj[role] === undefined) {
                    rowObj[role] = columnValue;
                    return;
                }
                if (rowObj[role].length === undefined) {
                    const firstRoleValue = rowObj[role];
                    rowObj[role] = [];
                    assignRole(rowObj, role, firstRoleValue, roles, idx);
                }
                assignRole(rowObj, role, columnValue, roles, idx);
            });
        });
        result.push(rowObj);
    }
    return result;
}

function convertToDocumentData(dataView, settings, roles) {
    const rowObjs = convertToRowObjs(dataView, roles);
    return convertToDocuments(rowObjs, settings);
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