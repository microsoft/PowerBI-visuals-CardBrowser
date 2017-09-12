'use strict';

const isTddMode = process.argv.indexOf("--tdd") > -1;
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const path = require('path');
const ENTRY = './src/VisualMain.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai', 'jquery-1.8.3'],
        files: [
            'node_modules/babel-polyfill/dist/polyfill.min.js',
            'src/**/*.spec.js',
            'src/**/*.spec.ts',
        ],
        exclude: [
        ],
        preprocessors: {
            'src/**/*.spec.js': ['webpack', 'sourcemap'],
            'src/**/*.spec.ts': ['webpack', 'typescript']
        },
        webpackMiddleware: {
            stats: 'errors-only',
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.handlebars$/,
                        loader: 'handlebars-loader',
                        query: {
                            helperDirs: [
                                path.resolve(__dirname, 'lib/@uncharted/cards/src/handlebarHelper'),
                            ],
                        },
                    },
                    {
                        test: new RegExp(regex),
                        loader: path.join(__dirname, 'bin', 'pbiPluginLoader'),
                    },
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['latest', { es2015: { modules: false } }]
                            ],
                        },
                        exclude: /node_modules/
                    },
                    {
                        test: /\.ts?$/,
                        loader: 'ts-loader',
                        options: {
                            presets: [
                                ['latest', { es2015: { modules: false } }]
                            ],
                        },
                        exclude: /node_modules/
                    },
                ],
            },
            resolve: webpackConfig.resolve,
            externals: [
                {
                    sinon: "sinon",
                    chai: "chai"
                },
            ],
            plugins: [
                new webpack.SourceMapDevToolPlugin({
                    filename: null, // if no value is provided the sourcemap is inlined
                    test: /\.(js)($|\?)/i // process .js files only
                }),
            ]
        },
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: isTddMode ? ['Chrome'] : ['PhantomJS'],
        singleRun: !isTddMode,
        concurrency: Infinity
    });
};
