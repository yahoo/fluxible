const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  entry: "./src/server.js",
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist"),
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
