const webpack = require('webpack');
const path = require('path');
const ENTRY = './src/VisualMain.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');

module.exports = {
    entry: ['./src/sandboxPolyfill.js', ENTRY],
    devtool: 'eval',
    resolve: {
        extensions: ['.js', '.json', '.ts', '.handlebars'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
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
                options: {
                    presets: [
                        [ 'latest', { es2015: { modules: false } } ],
                    ],
                },
                exclude: /node_modules/,
            },
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
                test: /\.ts?$/,
                loaders: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['latest', {es2015: {modules: false}}],
                        ],
                    },
                }, 'ts-loader'],
            },
        ]
    },
    externals: [
        {
            jquery: 'jQuery',
        },
    ]
};
