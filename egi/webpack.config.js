const path = require("path");
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    context: path.resolve(),

    resolve: {
        extensions: ['*', '.js', '.jsx']
    },

    entry: {
        'dashboard/bundles/create': './dashboard/static/dashboard/js/create',
        'dashboard/bundles/client_view': './dashboard/static/dashboard/js/client_view',
        'dashboard/bundles/management': './dashboard/static/dashboard/js/management'
    },

    output: {
        path: path.resolve('./dashboard/static/'),
        filename: "[name].bundle.js",
        chunkFilename: "[name].bundle.js",
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats.json'}),
    ],
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.(js|jsx)$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};