const webpack = require('webpack');
const path = require('path');
const ENTRY = './src/VisualMain.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');

module.exports = {
    entry: ENTRY,
    devtool: 'eval',
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        alias: {
            '@uncharted': path.resolve(__dirname, 'lib/@uncharted')
        }
    },
    module: {
        rules: [
            { test: /\.handlebars$/, loader: "handlebars-loader" },
            {
                test: new RegExp(regex),
                loader: path.join(__dirname, 'bin', 'pbiPluginLoader'),
            },
            {
                test: /\.ts?$/,
                exclude: [/node_modules/, /\.spec.ts?$/],
                loader: 'ts-loader',
                options: {
                    presets: [
                        ['latest', { es2015: { modules: false } }]
                    ],
                },
            },
        ]
    },
    externals: [
        {
            jquery: 'jQuery',
            lodash: '_',
            underscore: '_',
        },
    ],
    devServer: {
        https: true
    }
};
