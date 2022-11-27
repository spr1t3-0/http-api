export default function createLogger() {
  return {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}
