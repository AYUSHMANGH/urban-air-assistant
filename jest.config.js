module.exports = {
  projects: [
    {
      displayName: "node-api",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      },
      transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }]
      }
    },
    {
      displayName: "dom-ui",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["**/__tests__/**/*.test.tsx"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      },
      transform: {
        "^.+\\.tsx$": ["ts-jest", { tsconfig: "tsconfig.json" }]
      }
    }
  ]
};
