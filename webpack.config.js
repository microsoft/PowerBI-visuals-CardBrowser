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

const webpack = require('webpack');
const path = require('path');
const ENTRY = './src/VisualMain.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');
const HANDLEBAR_RUNTIME = 'handlebars/dist/handlebars.runtime.min';

module.exports = {
    entry: ['./src/sandboxPolyfill.js', ENTRY],
    devtool: 'eval',
    resolve: {
        extensions: ['.js', '.json', '.ts', '.handlebars'],
        alias: {
            handlebars: HANDLEBAR_RUNTIME,
        },
    },
    module: {
        rules: [
            {
                test: new RegExp(regex),
                loader: path.join(__dirname, 'bin', 'pbiPluginLoader'),
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.handlebars$/,
                loader: 'handlebars-loader',
                query: {
                    helperDirs: [
                        path.resolve(__dirname, 'lib/@uncharted/cards/src/handlebarHelper'),
                    ],
                    runtime: HANDLEBAR_RUNTIME,
                },
            },
            {
                test: /\.ts?$/,
                loaders: [{
                    loader: 'babel-loader',
                }, 'ts-loader'],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
};
