/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const db = require('better-sqlite3-helper');
import { Sequelize, Model } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { TTransaction } from './types/Transaction'

// class Transaction extends Model {}
export type TDBOptions = Record<string, any>
// import CTransaction from './models/transaction'

export class CTxDB {
  // private _options: any;
  private _options: TDBOptions;
  private _db: Sequelize;
  private _transaction: any;
  private _chain: string;
  private _maxHeight: number;   // the highest block number in database (before program execution)

  // constructor(chain: string, filename?: string, dbOpts: TDBOptions) {
  constructor(chain: string, dbOpts: TDBOptions) {
    // console.debug('CTxDB()...', chain, dbOpts)
    // this._options = {
    //   path: './data/sqlite3.db', // this is the default
    //   readonly: false, // read only
    //   fileMustExist: false, // throw error if database not exists
    //   WAL: true, // automatically enable 'PRAGMA journal_mode = WAL'?
    //   migrate: {  // disable completely by setting `migrate: false`
    //     force: false, // set to 'last' to automatically reapply the last migration-file
    //     table: 'migration', // name of the database table that is used to keep track
    //     migrationsPath: './migrations' // path of the migration-files
    //   }
    // }
    // if (filename)
    //   this._options.path = filename;
    this._options = dbOpts
    if (dbOpts.logging === true) this._options.logging = false; // console.log
    this._chain = chain;

    console.log('Apply database migrations, please wait ...\n');
    // console.debug('this._options', this._options)

    // db(this._options);
    // db().defaultSafeIntegers(true);
    try {
      const { database, username, password } = this._options
      const sequelize = new Sequelize({
        ...this._options,
        // dialectOptions: this._options.dialectOptions,
        // database: this._options.database,
        // dialect: this._options.options.dialect,
        // username: this._options.options.username,
        // password: this._options.options.password,
        //this._options.options
        models: [__dirname + '/models']
      })
      // console.debug('sequelize.config', sequelize.config)
      // console.debug(sequelize.models)
      // sequelize.addModels([Transaction])
      // console.debug('calling Transaction.init')
      // Transaction.init(transactionModel.definition, { sequelize, ...transactionModel.options })
      // const tx = sequelize.define('transaction', { ...transactionModel.definition },  { ...transactionModel.options, sequelize })
      this._db = sequelize;
      this._transaction = sequelize.models.Transaction;
      // this._maxHeight = this.CalcMaxHeight();

    } catch (err) {
      console.error(err)
      process.exit(5)
    // } finally {
    //   console.debug('constructor done...')
    }

    // process.on('exit', () => db().close());     // close database on exit
    process.on('exit', () => this._db.close());     // close database on exit
  }

  // requires await, hence async
  static async Create(chain: string, dbOpts: TDBOptions) {
    console.debug('CTxDB.Create()...')
    const instance = new CTxDB(chain, dbOpts)
    // console.debug('instance._db.config', instance._db.config)
    await instance._db.sync({ alter: true })
    instance._maxHeight = await instance.CalcMaxHeight()
    console.debug('instance._maxHeight', instance._maxHeight)
    return instance
  }

  // --------------------------------------------------------------
  // access the better-sqlite3-helper
  get db(): any {
    return this._db;
  }

  // --------------------------------------------------------------
  // the chain
  get chain(): string {
    return this._chain;
  }

  // --------------------------------------------------------------
  // returns number of records in database
  async GetCount(): Promise<number> {
    // const row = db().queryFirstRow('SELECT count(*) as count FROM transactions WHERE chain=?', this._chain);
    const count = await this._transaction.count({ where: { chain: this._chain } });
    // return row.count;
    return Number(count);
  }

  // --------------------------------------------------------------
  // returns maximum blockheight in database (before program execution)
  async CalcMaxHeight(): Promise<number> {
    console.debug('CTxDB.CalcMaxHeight()...')
    // const row = db().queryFirstRow('SELECT max(height) as max FROM transactions WHERE chain=?', this._chain);
    
    const max = await this._transaction.max('height', { where: { chain: this._chain } });
    console.debug('max', max)
    // return row.max ? Number(row.max) : -1;
    return max ? Number(max) : -1;
  }

  // --------------------------------------------------------------
  // returns stored maximum blockheight in database
  GetMaxHeight(): number {
    return this._maxHeight;
  }

  // --------------------------------------------------------------
  // returns total number of records
  async InsertTransactions(txs: TTransaction[]): Promise<number> {
    if (!txs.length)
      return 0;

    while (txs.length > 100) {    // only 100 tx per insert
      const txs1 = txs.slice(0, 100);
      txs.splice(0, 100);
      this.InsertTransactions(txs1);
    }

    // if we continue an existing database we remove (possibly incomplete) existing records with the same block number
    if (txs[0].height == this._maxHeight) {
      // db().run('DELETE FROM transactions WHERE height>=?', this._maxHeight);
      await this._transaction.destroy({ where: { chain: this._chain, height: { [Op.gte]: this._maxHeight } } })
    }

    // return db().insert('transactions', txs);
    const ret = (await this._transaction.bulkCreate(txs)).length;
    return ret
  }
}
