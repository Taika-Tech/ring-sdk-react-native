module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    moduleFileExtensions: ['ts', 'js', 'tsx', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|react-native-device-info)/)',
    ],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'text-summary']
  };
  