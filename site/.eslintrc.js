module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "mocha": true,
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
    "no-class-assign": 0,
    "no-console": 0,
    "no-empty": 0,
    "no-redeclare": 0,
    "no-unused-vars": 0,
    "quotes": [2, "single"],
    "react/no-find-dom-node": 0,
    "react/no-string-refs": 0,
    "react/no-unescaped-entities": 0,
    "react/prop-types": 0
  },
  "settings": {
    "react": {
      "pragma": "React",
      "version": "16.0"
    }
  }
}
