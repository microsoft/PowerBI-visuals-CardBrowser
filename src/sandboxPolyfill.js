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

// If, and only if, we are sandboxed, load babel-polyfill
if (window.parent !== window) {
    "use strict";

    require("core-js/shim");

    require("regenerator-runtime/runtime");

    require("core-js/fn/regexp/escape");

    if (global._babelPolyfill) {
        throw new Error("only one instance of babel-polyfill is allowed");
    }
    global._babelPolyfill = true;

    var DEFINE_PROPERTY = "defineProperty";
    function define(O, key, value) {
        O[key] || Object[DEFINE_PROPERTY](O, key, {
            writable: true,
            configurable: true,
            value: value
        });
    }

    define(String.prototype, "padLeft", "".padStart);
    define(String.prototype, "padRight", "".padEnd);

    "pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
        [][key] && define(Array, key, Function.call.bind([][key]));
    });
}
