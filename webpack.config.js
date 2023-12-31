/*
NB The webpack.config.js files in my-loop, adserver and wwappbase.js are identical but cannot be symlinked!
If it's a symlink, NPM will resolve paths (including module names) relative to the symlink source - and
complain that it can't find webpack, because it's not installed in /wwappbase.js/templates/node_modules
Keep this copy in sync with the others - if the same file can't be used for all three, there should be a good reason.
*/
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Needed to check hostname & try to load local config file
const os = require('os');
const fs = require('fs');
// Needed IF you want to run git commands & get current branch
const { execSync } = require('child_process');
const extconfig = require('./extension.config.js');

// Check for file "config/$HOSTNAME.js" and look for ServerIO overrides in it
let SERVERIO_OVERRIDES = JSON.stringify({});
// Which browser to run the extension in?
let BROWSER_TARGET = "firefox";
// Any user specific properties for that browser (unused in this file atm)
let BROWSER_PROPERTIES = {};
const configFile = './config/' + os.hostname() + '.js';
if (fs.existsSync(configFile)) {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    let hostConfig = require(configFile);
    if (hostConfig.ServerIOOverrides) SERVERIO_OVERRIDES = JSON.stringify(hostConfig.ServerIOOverrides);
    if (hostConfig.BrowserTarget) BROWSER_TARGET = hostConfig.BrowserTarget;
    if (hostConfig.BrowserProperties) BROWSER_PROPERTIES = hostConfig.BrowserProperties;
}

// Get current git branch. If it's a release branch (which will have matching legacy-unit files)
// inject it in the bundle for e.g. presetting legacyUnitBranch
let RELEASE_BRANCH = JSON.stringify('');
let head = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
if (head.match(/(gl-)?release-.*/)) RELEASE_BRANCH = JSON.stringify(head);

let BROWSER_API = "";
if (BROWSER_TARGET === "firefox") BROWSER_API = "browser";
else if (BROWSER_TARGET === "chromium") BROWSER_API = "chrome";

const baseConfig = {
    // NB When editing keep the "our code" entry point last in this list - makeConfig override depends on this position.
    entry: ['core-js', './src/js/app.jsx'],
    output: {
        path: path.resolve(__dirname, "extension-"+BROWSER_TARGET, extconfig[BROWSER_TARGET].build_path), // NB: this should include js and css outputs
        // filename: is left undefined and filled in by makeConfig
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        symlinks: false,
        alias: {
            querystring: 'querystring-es3',
            util: 'util'
        }
    },
    module: {
        rules: [
            {	// Typescript
                test: /\.tsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        ['@babel/preset-typescript', { targets: { ie: '11' }, loose: true }],
                        ['@babel/preset-env', { targets: { ie: '11' }, loose: true }],
                        '@babel/react'
                    ],
                    plugins: [
                        '@babel/plugin-transform-typescript',
                        '@babel/plugin-proposal-object-rest-spread',
                        '@babel/plugin-transform-runtime',
                        'babel-plugin-const-enum',
                        // loose: true specified to silence warnings about mismatch with preset-env loose setting
                        ['@babel/plugin-proposal-class-properties', { loose: true }],
                        ['@babel/plugin-proposal-private-methods', { loose: true }],
                        ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
                    ]
                }
            },
            {	// .js or .jsx
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        ['@babel/preset-env', { targets: { ie: '11' }, loose: true }]
                    ],
                    plugins: [
                        '@babel/plugin-transform-react-jsx',
                        '@babel/plugin-transform-runtime',
                        // loose: true specified to silence warnings about mismatch with preset-env loose setting
                        ['@babel/plugin-proposal-class-properties', { loose: true }],
                        ['@babel/plugin-proposal-private-methods', { loose: true }],
                        ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
                    ]
                }
            }, {
                test: /\.less$/,
                // If we use css-loader with default options it will try to inline any url('/img/whatever.png') rules it finds.
                // We don't want this (plus the URLs don't resolve correctly, throwing an error on compile) so {url: false} disables it.
                use: [MiniCssExtractPlugin.loader, {loader: 'css-loader', options: {url: false}}, 'less-loader'],
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: 'style/main.css' }),
        new webpack.DefinePlugin({
            'process.env': {
                SERVERIO_OVERRIDES,
                RELEASE_BRANCH,
                BROWSER_TARGET:JSON.stringify(BROWSER_TARGET),
                BROWSER_API,
                BROWSER_API_STR:'"' + BROWSER_API + '"'
            }
        }),
    ]
};


/**
* Copy and fill out the baseConfig object with:
* @param {!string} filename Set the bundle output.filename
* @param {?string} mode "production" or "development", determines if JS will be minified
* @param {?string} entry (unusual) Compile a different entry-point file instead of app.jsx
* ## process.env
* process is always globally available to runtime code.
*/
const makeConfig = ({ filename, mode, entry }) => {
    const config = { ...baseConfig, mode };
    config.output = { ...baseConfig.output, filename };

    // Has an entry point other than ./src/js/app.jsx been requested?
    if (entry) config.entry = [...config.entry.slice(0, -1), entry]; // Copy, don't modify in-place

    return config;
};

const configs = [
    makeConfig({filename: 'js/bundle-debug.js', mode: 'development' }),
//	Add additional configs (eg with different entry points) like this:
//	makeConfig({filename: 'js/other-bundle-debug.js', mode: 'development', entry:'./src/js/other.js'}),
];

// Default behaviour: Create a production config (with mode & output filename amended) for each dev config.
// Allow debug-only compilation for faster iteration in dev
if (process.env.NO_PROD !== 'true') {
    const prodconfigs = configs.map(devc => ({
        ...devc,
        mode: 'production',
        output: {
            ...devc.output,
            filename: devc.output.filename.replace('-debug', '')
        }
    }));
    // Put new production configs in the main list
    prodconfigs.forEach(prodc => configs.push(prodc));
}

// Output bundle files for production and dev/debug
module.exports = configs;