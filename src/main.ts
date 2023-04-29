import '@polkadot/api-augment'; // Introduced via `@polkadot/api v7.0.1`.

// Required imports
import { LoadConfigFile } from './utils';
import { CPolkaStore } from "./CPolkaStore";

// --------------------------------------------------------------
// --------------------------------------------------------------
async function main() {

  process.on('SIGINT', () => {  // Ctrl+C pressed
    console.log('\nctrl-c...');
    process.exit();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit();
  });

  const config = LoadConfigFile();
  if (!config)
    return;

  const chain = process.argv[2] || config.defchain;
  const chainData = config.chains[chain];
  if (!chainData) {
    console.log('Syntax: node build/main.js [chain]');
    const chains = Object.keys(config.chains).join(', ');
    console.log('        with chain in [%s]', chains);
    return;
  }

  // console.debug('creating polkastore...')
  const polkaStore = new CPolkaStore(chainData, chain);
  // console.debug(' -- calling InitAPI()...')
  await polkaStore.InitAPI();

  // Create transaction database instance
  // polkaStore.InitDataBase(chain, config.filename || 'data/' + chain + '.db');
  console.debug(' -- calling InitDataBase()...')
  await polkaStore.InitDataBase(chain, config.sequelize);

  console.log('Press "Ctrl+C" to cancel ...\n');
  console.debug(' -- calling ScanChain()...')
  await polkaStore.ScanChain();
}

main().catch(console.error).finally(() => { process.exit() });
