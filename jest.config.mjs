import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// Wrap so we can override transformIgnorePatterns after next/jest sets them
async function getJestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      "/node_modules/(?!(marked)/)",
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
}

export default getJestConfig;
