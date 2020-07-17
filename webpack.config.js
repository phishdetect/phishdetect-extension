var webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    CleanWebpackPlugin = require("clean-webpack-plugin"),
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin");


var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];
var options = {
    devServer: {
        publicPath: '/'
    },
    mode: process.env.NODE_ENV || "development",
    entry: {
        popup: path.join(__dirname, "src", "ui", "popup", "popup.js"),
        options: path.join(__dirname, "src", "ui", "options", "options.js"),
        history: path.join(__dirname, "src", "ui", "history", "history.js"),
        apikey: path.join(__dirname, "src", "ui", "apikey", "apikey.js"),
        gmail: path.join(__dirname, "src", "js", "gmail.js"),
        roundcube: path.join(__dirname, "src", "js", "roundcube.js"),
        domains: path.join(__dirname, "src", "js", "domains.js"),
        gui: path.join(__dirname, "src", "js", "gui.js")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "dist/[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader",
                exclude: /node_modules/
            },
            {
                test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
                loader: "file-loader?name=[name].[ext]",
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // clean the build folder
        new CleanWebpackPlugin(["build"]),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development' // process.env.NODE_ENV overrides this default
        }),
        new CopyWebpackPlugin([{
            from: "src/manifest.json",
            transform: function (content, path) {
                // generates the manifest file using the package.json informations
                return Buffer.from(JSON.stringify({
                    version: process.env.npm_package_version,
                    // enable unsafe-eval in development for webpack
                    content_security_policy: (
                        env.NODE_ENV == "development" ?
                            "script-src 'self' 'unsafe-eval'; object-src 'self'" :
                            "script-src 'self'; object-src 'self'"),
                    ...JSON.parse(content.toString())
                }))
            }
        }]),
        new CopyWebpackPlugin([
            {from: 'src/css',to:'css'},
            {from: 'src/icons',to:'icons'},
            {from: 'src/js',to:'js'},
            {from: 'src/lib',to:'lib'},
            {from: 'src/ui',to:'ui'},
            {from: '_locales/',to:'_locales'},
            {from: 'node_modules/vex-js/dist/css/vex.css',to:'css'},
            {from: 'node_modules/vex-js/dist/css/vex-theme-default.css',to:'css'},
            {from: 'node_modules/tailwindcss/dist/tailwind.min.css',to:'css'},
            {from: 'node_modules/jquery/dist/jquery.min.js',to:'lib'},
            {from: 'node_modules/js-sha256/build/sha256.min.js',to:'lib'},
            {from: 'node_modules/@fortawesome/fontawesome-free/css',to:'fontawesome/css'},
            {from: 'node_modules/@fortawesome/fontawesome-free/js',to:'fontawesome/js'},
            {from: 'node_modules/@fortawesome/fontawesome-free/webfonts',to:'fontawesome/webfonts'}
        ]),
        new WriteFilePlugin()
    ]
};

if (env.NODE_ENV === "development") {
    options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
