const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'app'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/i,
                exclude: /[\\/]node_modules[\\/]/,
                loader: 'babel-loader'
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            components: path.resolve(__dirname, 'src', 'components'),
            actions: path.resolve(__dirname, 'src', 'actions'),
            reducers: path.resolve(__dirname, 'src', 'reducers'),
            containers: path.resolve(__dirname, 'src', 'containers')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'index.html'),
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ],
    devServer: {
        historyApiFallback: true
    },
    devtool: 'cheap-inline-module-source-map'

};