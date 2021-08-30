/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const chalk = require('chalk');
const yargs = require('yargs');

const validFlags = ['mocks', 'schema'];

const enableMocks = (mocksArg = '') => {
  // Handle adding mocks enabled flag if passed and any scenario names
  const scenario = mocksArg.trim();
  process.env['REACT_APP_ENABLE_MOCKS'] = 'true';
  process.env['REACT_APP_MOCK_SCENARIO'] =
    scenario === '' ? 'default' : scenario;

  console.log(
    chalk.cyan(
      `Mocks enabled. Using scenario "${process.env['REACT_APP_MOCK_SCENARIO']}"`
    )
  );
};
/**
 * processArgs used to set envs for valid flags passed to a command
 * @param {Object} args
 */
const processArgs = args => {
  // Check and set any Auth0 options to env
  const hasAnyArg = Object.keys(args).filter(arg => {
    return validFlags.includes(arg) && args[arg];
  }).length;
  const hasMocksArg = 'mocks' in args || process.env['REACT_APP_ENABLE_MOCKS'];
  const hasSchemaArg = 'schema' in args;

  if (hasMocksArg) {
    enableMocks(args.mocks);
  }

  if (hasSchemaArg) {
    console.log(chalk.blue(`Using Zeus schema gateway ${args.schema}`));
    process.env[
      'REACT_APP_GRAPHQL_SCHEMA_PACKAGE'
    ] = `gateway-${args.schema}`;
  } else if (process.env['REACT_APP_GRAPHQL_SCHEMA_PACKAGE']) {
    console.log(
      chalk.blue(
        `Using Zeus schema gateway ${process.env['REACT_APP_GRAPHQL_SCHEMA_PACKAGE']}`
      )
    );
  } else {
    console.log(chalk.yellow(`Using Zeus schema gateway production`));
    process.env['REACT_APP_GRAPHQL_SCHEMA_PACKAGE'] = 'gateway-production';
  }

  if (!hasAnyArg) return;
};

const { argv } = yargs
  .parserConfiguration({
    'unknown-options-as-args': true,
  })
  .option('mocks', {
    describe: 'use mocks to simulate backend and pass optional scenario name',
    type: 'string',
  })
  .option('schema', {
    describe: 'set REACT_APP_GRAPHQL_SCHEMA_PACKAGE for schema app will use',
    type: 'string',
  })
  .help()
  .usage('Usage: $0 <command> [options]')
  .showHelpOnFail(false, 'Specify --help for available options');

processArgs(argv);
const child = spawnSync('yarn', argv._, {
  stdio: 'inherit',
});
process.exit(child.status);
