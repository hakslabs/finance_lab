module.exports = {
  ci: {
    collect: {
      startServerCommand: "corepack pnpm start --hostname 127.0.0.1 --port 3000",
      startServerReadyPattern: "Ready",
      url: ["http://127.0.0.1:3000/login"],
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};
