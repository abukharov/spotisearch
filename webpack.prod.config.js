const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

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
                    }
                }
            },
            {
                test: /\.s?css$/,
                use: [
                    // Save the CSS as a separate file to allow caching
                    MiniCssExtractPlugin.loader,
                    {
                        // Translate CSS into CommonJS modules
                        loader: 'css-loader',
                    },
                    {
                        // Run postcss actions
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    function () {
                                        return [ require('autoprefixer') ];
                                    }
                                ],
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                outputStyle: 'compressed',
                            }
                        }
                    }
                ],
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.otf($|\?)/i,
                type: 'asset/resource',
                generator: {
                    //filename: 'fonts/[name]-[hash][ext][query]'
                    filename: 'fonts/[name][ext][query]'
                }
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    mode: 'production',
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
};
