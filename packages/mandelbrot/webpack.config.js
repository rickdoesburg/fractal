const path = require('path');
const glob = require('globby');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const skins = glob.sync('./assets/scss/skins/*.scss').reduce((acc, file) => {
    const fileName = path.basename(file, '.scss');

    return {
        ...acc,
        [fileName]: file,
    };
}, {});

module.exports = {
    entry: {
        mandelbrot: ['./assets/js/mandelbrot.js'],
        highlight: ['./assets/scss/highlight.scss'],
        ...skins,
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'window',
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: './assets/img/**/*',
                    to: './img/[name][ext]',
                },
                {
                    from: './assets/favicon.ico',
                    to: '.',
                },
            ],
        }),
        // ProvidePlugin makes jQuery available globally (replaces expose-loader)
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
                    },
                },
            },
            {
                // Use asset modules instead of file-loader (Webpack 5 built-in)
                test: /\.(png|svg|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name][ext]',
                },
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        },
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [require('autoprefixer')()],
                            },
                        },
                    },
                    {
                        loader: 'resolve-url-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
};
