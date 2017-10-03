module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "dot-notation": [2, {"allowKeywords": false}],
    "indent": [2, 4, {"SwitchCase": 1}],
    "no-console": 0,
    "no-empty": 0,
    "no-redeclare": 0,
    "no-unused-vars": 0,
    "quotes": [2, "single"]
  }
}
