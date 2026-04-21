// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/packages/react/',
        '/packages/twig/',
        '/examples/react/',
        '/examples/twig/',
    ],
};
