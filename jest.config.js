module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', 
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], 
  testMatch: ['**/__tests__/**/*.ts'], 
  moduleNameMapper: {
    
    '^@/(.*)$': '<rootDir>/src/$1',
  },

};
