export default async function mockCreateConfig() {
  return {
    findAppIdByApiToken: jest.fn(),
  };
}
