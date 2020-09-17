// Required imports
import ApiHandler from './ApiHandler';
import { InitAPI } from './utils';
import * as config from './config.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('better-sqlite3-helper');


// --------------------------------------------------------------
// --------------------------------------------------------------
async function main() {
  // check given chain
  const chain = process.argv[2] || config.defchain;
  const chainData = config.chains[chain];
  if (!chainData) {
    console.log('Syntax: node build/test.js [chain]');
    const chains = Object.keys(config.chains).join(', ');
    console.log('        with chain in [%s]', chains);
    return;
  }

  // open database
  const options = {
    path: config.filename || 'data/' + chain + '.db',
    readonly: true, // read only
    fileMustExist: true, // throw error if database not exists
    WAL: false, // automatically enable 'PRAGMA journal_mode = WAL'?
    migrate: false,
  }
  db(options);

  const api = await InitAPI(chainData.providers, chain);

  // Create API Handler
  const handler = new ApiHandler(api);

  console.log('##########################################',);
  console.log('Chain:', chain);
  if (!chainData.check_accounts.length)
    console.log('  no accounts given');


  // iterate over all test accounts
  for (let i = 0, n = chainData.check_accounts.length; i < n; i++) {
    const accountID = chainData.check_accounts[i];
    const lastBlock = db().queryFirstRow('SELECT max(height) AS val FROM transactions').val;
    const feesReceived = db().queryFirstRow('SELECT sum(feeBalances) AS val FROM transactions WHERE authorId=?', accountID).val;
    // feesPaid calculated from feeBalances and feeTreasury
    const feesPaid1 = db().queryFirstRow('SELECT COALESCE(sum(feeBalances), 0)+COALESCE(sum(feeTreasury), 0) AS val FROM transactions WHERE senderId=?', accountID).val;
    // feesPaid calculated from partialFee
    const feesPaid2 = db().queryFirstRow('SELECT COALESCE(sum(partialFee), 0)+COALESCE(sum(tip), 0) AS val FROM transactions WHERE senderId=?', accountID).val;
    const paid = db().queryFirstRow('SELECT sum(amount) AS val FROM transactions WHERE senderId=?', accountID).val;
    const received = db().queryFirstRow('SELECT sum(amount) AS val FROM transactions WHERE recipientId=?', accountID).val;
    const total1 = feesReceived + received - feesPaid1 - paid;
    const total2 = feesReceived + received - feesPaid2 - paid;
    const plancks: number = chainData.PlanckPerUnit;

    const hash = await api.rpc.chain.getBlockHash(lastBlock);
    const balance = await handler.fetchBalance(hash, accountID);

    console.log('------------------------------------------',);
    console.log('AccointID:   ', accountID);
    console.log('feesReceived:', feesReceived / plancks);
    console.log('feesPaid1:   ', feesPaid1 / plancks, '(calculated from partialFee)');
    console.log('feesPaid2:   ', feesPaid2 / plancks, '(calculated from feeBalances and feeTreasury)');
    console.log('paid:        ', paid / plancks);
    console.log('received:    ', received / plancks);
    console.log('Balance at Block %d: %d', lastBlock, total1 / plancks, '(calculated with feesPaid1)');
    console.log('Balance at Block %d: %d', lastBlock, total2 / plancks, '(calculated with feesPaid2)');
    console.log('Balance at Block %d: %d', lastBlock, balance.free.toNumber() / plancks, '(from API)');
  }

}

main().catch(console.error).finally(() => { process.exit() });
