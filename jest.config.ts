/* eslint-disable unicorn/filename-case */
import {type Config} from 'jest';

const esModules = ['@agm', 'ngx-bootstrap', '@ophidian/core', '@ophidian', '@ophidian\\core', '.*@ophidian.*'].join('|');

const config: Config = {
  verbose: true,
  roots: [
    '<rootDir>',
    '<rootDir>/src',
  ],
  modulePaths: [
    '<rootDir>',
    '<rootDir>/src',
  ],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))`],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
};

export default config;
