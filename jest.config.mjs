export default {
  // Disables code transforms so raw ESM flows through
  // transform: {},
  testEnvionment: 'node',
  testMatch: [
    '**/tests/**/*.js',
    '**/tests/**/*.mjs'
  ],
  clearMocks: true
  // Forces Jest to support standard ESM file extensions
  // extensionsToTreatAsEsm: ['.js'],
};
