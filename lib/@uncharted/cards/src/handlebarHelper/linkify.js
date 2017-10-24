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

export default function(text) {
    const escapedText = Handlebars.Utils.escapeExpression(text);
    let result = escapedText;
    try {
        result = `<a href="${escapedText}" target="_blank" title="${ escapedText }">${ new URL(escapedText).hostname.replace('www.', '') }</a>`;
    } catch (e) {} //eslint-disable-line
    return new Handlebars.SafeString(result);
}
