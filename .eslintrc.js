module.exports = {
    env: {
        browser: true,
        es2020: true,
        jest: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react'],
    rules: {
        'no-console': 0,
        'no-empty': 0,
        'no-prototype-builtins': 0,
        'no-redeclare': 0,
        'no-unused-vars': 0,
    },
    settings: {
        react: {
            pragma: 'React',
            version: '16.0',
        },
    },
};
