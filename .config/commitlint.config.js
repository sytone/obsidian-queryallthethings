module.exports = {
    extends: ['@commitlint/config-conventional'],

    rules: {
        'body-case': [2, 'always', 'sentence-case'],
        'body-max-line-length': [1, 'always', 72],
        'header-max-length': [1, 'always', 52],
        'type-enum': [
            2,
            'always',
            [
                'build',
                'change',
                'chore',
                'ci',
                'deprecate',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'remove',
                'revert',
                'security',
                'style',
                'test',
            ],
        ],
    },
};
