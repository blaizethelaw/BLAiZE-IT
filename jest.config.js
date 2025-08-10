module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^swiper/css$': 'identity-obj-proxy',
    '^swiper/react$': '<rootDir>/__mocks__/swiperReact.js',
    '^three$': '<rootDir>/__mocks__/three.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  }
};
