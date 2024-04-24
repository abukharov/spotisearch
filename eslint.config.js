const prettier = require("eslint-config-prettier");
const svelte = require("eslint-plugin-svelte");
const { rule } = require("postcss");

module.exports = [
    prettier,
    ...svelte.configs['flat/recommended'],
]
