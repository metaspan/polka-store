export type TTransaction = {
  chain: string,
  id: string,
  height: number,
  blockHash: string,
  type: string,
  subType: string | undefined,
  event: string | undefined,
  addData: string | undefined,
  timestamp: number,
  specVersion: number | undefined,
  transactionVersion: number | undefined,
  authorId: string | undefined,
  senderId: string | undefined,
  recipientId: string | undefined,
  amount: bigint | undefined,
  totalFee: bigint | undefined,
  feeBalances: bigint | undefined,
  feeTreasury: bigint | undefined,
  tip: bigint | undefined,
  success: number | undefined
};
