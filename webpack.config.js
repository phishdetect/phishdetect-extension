const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const fileSystem = require("fs");
const env = require("./utils/env");

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

var options = {
    devServer: {
        publicPath: "/"
    },
    mode: process.env.NODE_ENV || "development",
    entry: {
        apikey: path.join(__dirname, "src", "ui", "apikey", "apikey.js"),
        history: path.join(__dirname, "src", "ui", "history", "history.js"),
        options: path.join(__dirname, "src", "ui", "options", "options.js"),
        popup: path.join(__dirname, "src", "ui", "popup", "popup.js"),
        scan: path.join(__dirname, "src", "ui", "scan", "scan.js"),
        domains: path.join(__dirname, "src", "js", "domains.js"),
        validate: path.join(__dirname, "src", "js", "validate.js"),
        gmail: path.join(__dirname, "src", "js", "gmail.js"),
        gui: path.join(__dirname, "src", "js", "gui.js"),
        roundcube: path.join(__dirname, "src", "js", "roundcube.js")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "dist/[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ],
                exclude: /node_modules/
            },
            {
                test: new RegExp("\.(" + fileExtensions.join("|") + ")$"),
                use: ["file-loader?name=[name].[ext]"],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: ["html-loader"],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // Clean the build folder.
        new CleanWebpackPlugin(),
        // Expose and write the allowed env vars on the compiled bundle.
        new webpack.EnvironmentPlugin({
            NODE_ENV: "development" // Process.env.NODE_ENV overrides this default.
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "src/manifest.json",
                    transform: function (content, path) {
                        // Generates the manifest file using the package.json information.
                        return Buffer.from(JSON.stringify({
                            version: process.env.npm_package_version,
                            // Enable unsafe-eval in development for webpack.
                            content_security_policy: (
                                env.NODE_ENV == "development" ?
                                    "script-src 'self' 'unsafe-eval'; object-src 'self'" :
                                    "script-src 'self'; object-src 'self'"),
                            ...JSON.parse(content.toString())
                        }))
                    }
                },
            ],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: "src/css/phishdetect-webmails.css", to: "css/"},
                {from: "src/icons", to: "icons"},
                {from: "src/js", to: "js"},
                {from: "src/ui", to: "ui"},
                {from: "_locales/", to: "_locales"},
                {from: "node_modules/vex-js/dist/css/vex.css", to: "css"},
                {from: "node_modules/vex-js/dist/css/vex-theme-default.css", to: "css"},
                {from: "node_modules/jquery/dist/jquery.min.js", to: "lib"},
                {from: "node_modules/js-sha256/build/sha256.min.js", to: "lib"},
                {from: "node_modules/@fortawesome/fontawesome-free/css/*.min.css", to({context, absoluteFileName}) {
                    return "fontawesome/css/[name].[ext]";
                }},
                {from: "node_modules/@fortawesome/fontawesome-free/js/*.min.js", to({context, absoluteFileName}) {
                    return "fontawesome/js/[name].[ext]";
                }},
                {from: "node_modules/@fortawesome/fontawesome-free/webfonts", to: "fontawesome/webfonts"}
            ],
        }),
        new WriteFilePlugin()
    ],
    optimization: {
        minimize: false
    }
};

if (env.NODE_ENV === "development") {
    options.devtool = "eval-cheap-module-source-map";
}

module.exports = options;
