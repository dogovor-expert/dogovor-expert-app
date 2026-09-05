/**
 * commitlint — правила Conventional Commits.
 * Используется в .husky/commit-msg для валидации сообщений.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-case": [0],
    "scope-enum": [
      2,
      "always",
      [
        "auth",
        "templates",
        "supabase",
        "ui",
        "api",
        "deps",
        "config",
        "ci",
        "docs",
        "cookies",
        "analytics",
        "pdf",
        "perf",
        "audit",
        "agents",
      ],
    ],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 120],
  },
};
