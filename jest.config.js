module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  detectOpenHandles: false,
  testTimeout: 3000, 
};
