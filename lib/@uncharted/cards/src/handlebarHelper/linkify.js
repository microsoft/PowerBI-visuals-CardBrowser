/*
 * Copyright 2017 Uncharted Software Inc.
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

import Handlebars from 'handlebars';

function isUrl(url) {
    const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(url);
}

function getHostName(url) {
    var link = document.createElement('a');
    link.href = url;
    return link.hostname;
}

function getLink(href, text) {
    return `<a href="${href}" target="_blank" title="${ href }">${text}</a>`;
}

export default function(text) {
    const escapedText = Handlebars.Utils.escapeExpression(text);
    const result = isUrl(escapedText)
        ? getLink(escapedText, getHostName(escapedText).replace('www.', ''))
        : escapedText;
    return new Handlebars.SafeString(result);
}
