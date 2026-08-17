module.exports = {
  roots: ['<rootDir>/src/test/routes'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
  "testEnvironment": "node",
  transform: {
    '^.+\\.ts?$': ['ts-jest', {tsconfig: 'tsconfig.jest.json'}],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
