const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ENTRY = './src/VisualMain.ts';
const regex = path.normalize(ENTRY).replace(/\\/g, '\\\\').replace(/\./g, '\\.');
const isServing = (process.env.WEBPACK_ENV === 'serve'); // eslint-disable-line

module.exports = {
    entry: ENTRY,
    devtool: 'eval',
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
            '@uncharted': path.resolve(__dirname, 'lib/@uncharted')
        }
    },
    module: {
        rules: [
            {
                test: new RegExp(regex),
                loader: path.join(__dirname, 'bin', 'pbiPluginLoader'),
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
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
                test: /\.scss$/,
                use: isServing
                    ? ['style-loader', 'css-loader', 'sass-loader']
                    : ExtractTextPlugin.extract({
                        use: ['css-loader', 'sass-loader'],
                    }),
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
                exclude: [/node_modules/, /\.spec.ts?$/],
                loader: 'ts-loader',
            },
        ]
    },
    externals: [
        {
            jquery: 'jQuery'
        },
    ],
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
    ],
    devServer: {
        disableHostCheck: true,
    },
};
