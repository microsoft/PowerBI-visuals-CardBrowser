/*
 * Copyright 2018 Uncharted Software Inc.
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
