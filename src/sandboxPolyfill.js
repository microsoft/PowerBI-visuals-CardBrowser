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
