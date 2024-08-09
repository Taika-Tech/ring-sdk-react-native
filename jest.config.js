module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    moduleFileExtensions: ['ts', 'js', 'tsx', 'jsx'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['**/?(*.)+(spec|test).ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'text-summary']
  };
  