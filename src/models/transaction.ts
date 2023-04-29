import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript'
import { DataTypes } from 'sequelize'

@Table
export default class Transaction extends Model<Transaction> {

  @PrimaryKey
  @Column(DataTypes.STRING(64))
  declare chain: string;

  @PrimaryKey
  @Column(DataTypes.STRING(64))
  declare id: string;

  @Column(DataTypes.BIGINT)
  declare height: BigInt;

  @Column(DataTypes.STRING(84))
  declare blockHash: string;

  @Column(DataTypes.STRING(64))
  declare type: string;

  @Column(DataTypes.STRING(132))
  declare subType: string;

  @Column(DataTypes.STRING(64))
  declare event: string;

  @Column(DataTypes.STRING(64))
  declare addData: string;

  @Column(DataTypes.BIGINT)
  declare timestamp: BigInt;

  @Column(DataTypes.INTEGER)
  declare specVersion: number | null;

  @Column(DataTypes.INTEGER)
  declare transactionVersion: string | null;

  @Column(DataTypes.STRING(64))
  declare authorId: number | null;

  @Column(DataTypes.STRING(128))
  declare senderId: string | null;

  @Column(DataTypes.STRING(128))
  declare recipientId: string | null;

  @Column(DataTypes.BIGINT)
  declare amount: BigInt | null;

  @Column(DataTypes.BIGINT)
  declare totalFee: BigInt | null;

  @Column(DataTypes.BIGINT)
  declare feeBalances: BigInt | null;

  @Column(DataTypes.BIGINT)
  declare feeTreasury: BigInt | null;

  @Column(DataTypes.BIGINT)
  declare tip: BigInt | null;

  @Column(DataTypes.BOOLEAN)
  declare success: boolean | null;

  options: {
    tableName: 'Transactions',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}
