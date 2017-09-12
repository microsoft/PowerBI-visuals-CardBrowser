const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const OUTPUT_FILE_NAME = 'uncharted.cards';

const isProduction = (process.env.NODE_ENV === 'production'); // eslint-disable-line
const isServing = (process.env.WEBPACK_ENV === 'serve'); // eslint-disable-line
const outputFileName = isProduction ? `${OUTPUT_FILE_NAME}.min` : OUTPUT_FILE_NAME;

/** Base config */
const config = {
    entry: ['./src/main.scss', 'babel-polyfill', './src/index.js'],
    output: {
        filename: `${outputFileName}.js`,
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        },
    },
    module: {
        rules: [
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
                        path.resolve(__dirname, 'src/handlebarHelper'),
                    ],
                },
            },
        ],
    },

    externals: {
        jquery: 'jQuery',
    },

    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
    ],
    devServer: {
        disableHostCheck: true,
    },
};

if (!isServing) {
    config.plugins.push(...[
        new CleanWebpackPlugin(['dist']),
        new ExtractTextPlugin(`${outputFileName}.css`),
    ]);
}

// Environment specific configs
if (isProduction) {
    config.devtool = 'source-map';
    config.plugins.push(...[
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
            },
        }),
    ]);
} else {
    config.output.libraryTarget = 'window';
    config.output.library = ['Uncharted', 'Thumbnails'];
    config.devtool = 'inline-source-map';
    config.plugins.push(...[
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('dev'),
            },
        }),
    ]);
}

module.exports = config;
