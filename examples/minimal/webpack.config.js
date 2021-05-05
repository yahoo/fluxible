const path = require("path");
const nodeExternals = require("webpack-node-externals");

const isServer = process.env.BABEL_ENV === "server";
const isProduction = process.env.NODE_ENV !== "development";

module.exports = {
  mode: isProduction ? "production" : "development",
  target: isServer ? "node" : "web",
  externalsPresets: isServer ? { node: true } : undefined,
  externals: isServer ? [nodeExternals()] : undefined,
  entry: isServer ? "./src/server.js" : "./src/browser.js",
  output: isServer
    ? {
        filename: "server.js",
        path: path.resolve(__dirname, "dist"),
      }
    : {
        filename: "browser.js",
        path: path.resolve(__dirname, "dist/assets"),
      },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
    ],
  },
};
