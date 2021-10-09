const isNodeTarget = (api) =>
    api.caller((caller) => caller && caller.target === 'node');

module.exports = (api) => ({
    presets: [
        [
            '@babel/preset-env',
            {
                targets: isNodeTarget(api) ? { node: 'current' } : 'defaults',
            },
        ],
        '@babel/preset-react',
    ],
});
