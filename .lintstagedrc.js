// @ts-check

/** @satisfies {import("lint-staged").Config} */
const config = {
  '{src,test}/**/*.{js,ts}': 'eslint --fix --report-unused-disable-directives-severity error',
  '*.{js,cjs,mjs,ts,cts,mts}': 'eslint --fix --report-unused-disable-directives-severity error',
  '{src,test}/**/*.json': 'prettier --loglevel=silent --write',
  '*.{json,md}': 'prettier --loglevel=silent --write',
};

export default config;
