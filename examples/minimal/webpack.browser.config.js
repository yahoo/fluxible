const path = require("path");

module.exports = {
  mode: "production",
  target: "web",
  entry: "./src/browser.js",
  output: {
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
