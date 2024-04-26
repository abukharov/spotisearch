const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const paths = ['/'];

module.exports = {
    entry: {
        bundle: './src/main.js',
        global: './src/scss/main.scss'
    },
    resolve: {
        alias: {
            process: require.resolve('process/browser'),
            svelte: path.resolve('node_modules', 'svelte/src/runtime')
        },
        conditionNames: ['svelte', 'browser', 'import'],
        extensions: ['.mjs', '.js', '.svelte'],
        mainFields: ['svelte', 'browser', 'module', 'main']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]-[fullhash].js',
        chunkFilename: '[name]-[chunkhash].[id].js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        preprocess: require('svelte-preprocess')({
                            scss: true,
                            postcss: {
                                plugins: [require('autoprefixer')]
                            }
                        }),
                        emitCss: true,
                        hotReload: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    mode,
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: path.join(__dirname, 'dist', 'index.html')
        }),
        new MiniCssExtractPlugin({
            filename: '[name]-[fullhash].css',
            chunkFilename: '[name]-[chunkhash].[id].js'
        }),
        new RemoveEmptyScriptsPlugin(),
        new SitemapPlugin({ base: 'https://spotisear.ch', paths }),
        new FaviconsWebpackPlugin({
            logo: './src/logo.png',
            prefix: ''
        })
    ],
    devtool: prod ? false : 'source-map',
    devServer: prod
        ? false
        : {
              hot: true, // enable HMR on the server
              static: path.resolve(__dirname, './', 'dist'), // match the output path
              server: 'https',
              port: 443,
              host: '0.0.0.0',
              allowedHosts: 'all',
              historyApiFallback: true,
              client: {
                  overlay: {
                      errors: true,
                      warnings: false,
                      runtimeErrors: true
                  }
              }
          }
};
