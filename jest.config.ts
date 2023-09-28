/* eslint-disable unicorn/filename-case */
import {type Config} from 'jest';
import type {JestConfigWithTsJest} from 'ts-jest';

const esModules = ['@agm', 'ngx-bootstrap', '@ophidian/core', '@ophidian', '@ophidian\\core', '.*@ophidian.*'].join('|');

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],

  verbose: true,
  roots: [
    '<rootDir>',
    '<rootDir>/src',
  ],
  modulePaths: [
    '<rootDir>',
    '<rootDir>/src',
  ],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./dist'],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', {useESM: true}],
  },
};

export default config;
