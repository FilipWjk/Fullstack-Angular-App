module.exports = {
  root: true,
  env: { browser: true, es2023: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: { project: ["./tsconfig.json"] },
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["../../*", "../*/../*", "**/../../*"],
                message:
                  "Deep relative import detected. Use path aliases (e.g., @models/, @features/, @store/).",
              },
            ],
          },
        ],
      },
    },
  ],
};
