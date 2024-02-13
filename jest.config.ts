/* eslint-disable unicorn/filename-case */
import {type Config} from 'jest';
import type {JestConfigWithTsJest} from 'ts-jest';

const esModules = ['@agm', 'ngx-bootstrap', '@ophidian/core', '@ophidian', '@ophidian\\core', '.*@ophidian.*'].join('|');

const config: JestConfigWithTsJest = {
  moduleFileExtensions: ['ts', 'js', 'jsx', 'tsx', 'json', 'node'],
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
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./dist'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

export default config;
