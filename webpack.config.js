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
    mode: process.env.NODE_ENV || "development",
    entry: {
        gmail: path.join(__dirname, "src", "js", "gmail.js"),
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
                    description: process.env.npm_package_description,
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
        new CopyWebpackPlugin([{from: 'src/css',to:'css'}]),
        new CopyWebpackPlugin([{from: 'src/fontawesome',to:'fontawesome'}]),
        new CopyWebpackPlugin([{from: 'src/icons',to:'icons'}]),
        new CopyWebpackPlugin([{from: 'src/js',to:'js'}]),
        new CopyWebpackPlugin([{from: 'src/lib',to:'lib'}]),
        new CopyWebpackPlugin([{from: 'src/ui',to:'ui'}]),
        new WriteFilePlugin()
    ]
};

if (env.NODE_ENV === "development") {
    options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
