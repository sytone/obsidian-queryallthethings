/* eslint-disable unicorn/filename-case */
import {type Config} from 'jest';
import type {JestConfigWithTsJest} from 'ts-jest';

const esModules = ['obsidian', 'micromark-*.', 'micromark', '@agm', 'ngx-bootstrap', '@ophidian/core', '@ophidian', '@ophidian\\core', '.*@ophidian.*'].join('|');

const config: JestConfigWithTsJest = {
  moduleFileExtensions: ['ts', 'js', 'jsx', 'tsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  verbose: true,
  roots: [
    '<rootDir>',
    '<rootDir>/src',
    'node_modules',
  ],
  modulePaths: [
    '<rootDir>',
    '<rootDir>/src',
    'node_modules',
  ],
  moduleDirectories: ['src', 'node_modules'],
  preset: 'ts-jest',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./dist'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {useESM: true},
    ],
  },
};

export default config;
