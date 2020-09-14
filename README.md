# polka-store

## 1 Overview

One of the most used functions of applications based on a blockchain is the
evaluation of transactions. Unfortunately this is not possible in the Polkadot
universe, because transaction data are not directly stored there.  
Ok, you can use the API of a block explorer, but latest if you want to follow the staking-rewards, that's it.

**Polka-store** is a Node.js program written in typescript which scans a Polkadot chain
(Polkadot/Kusama/Westend) and stores (hopefully all) balance-relevant transactions in a SQLite database.
This database can be used in other projects to easily access the transaction data.
What is balance-relevant? Currently the following data will be collected:

- balance transfers (directly and through reserved balance)
- fees
- staking rewards
- staking slashes

Btw, you can download regularly updated example databases from my file storage linked below.

## 2 Installation

### 2.1 Prerequisites

These steps should only be carried out during the initial installation.

#### 2.1.1 Repository

First you have to clone the repository:  

``` bash
git clone https://github.com/TheGoldenEye/polka-store.git
```

#### 2.1.2 Rust

The project uses rust code to calculate the transaction fees. Please make sure
your machine has an up-to-date version of `rustup` installed.  
Please check, if `rustup` is installed:

``` bash
rustup -V
```

If rustup is not installed, please install rust from here: <https://www.rust-lang.org/tools/install>

Alternatively you can execute the rust installer directly:

``` bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Hint: The rust installer changes the PATH environment variable.
If the `rustup` command is still unavailable, restart the console and/or logoff the user.

#### 2.1.3 Needad packages

We need some prerequisites:

``` bash
sudo apt install pkg-config node-typescript libssl-dev npm build-essential
```

#### 2.1.4 Install wasm-pack

`wasm-pack` is needed by the rust code.
Please install it, if your machine does not already have it:

``` bash
cargo install wasm-pack
```

#### 2.1.5 Minimum node.js version

Now its time to check the nodejs version:

``` bash
node -v
```

If your node version is minimum v10.4.0, its fine. Otherwise you have to install
a newer version, because of the missing BigInt support in Node.js prior to v10.4.  
You can do it with the 'n node installer':

``` bash
sudo npm install -g n
sudo n lts
```

Now you should have a current node version installed.

#### 2.1.6 yarn package manager

This repo uses yarn workspaces to organise the code.
As such, after cloning, its dependencies should be installed via yarn package manager,
not via npm, the latter will result in broken dependencies.  
Install yarn, if you haven't already:

``` bash
sudo npm install -g yarn
```

### 2.2 Installing the project dependencies

Please always run this when the sources have been updated from the git repository.

Use yarn to install the dependencies:

``` bash
cd polka-store
yarn
```

## 3 Configuration

### 3.1 config.json

Please find the configuration in src/config.json.
Here are some parameters defined for the different chains.  
There is currently no need to change the default configuration:

``` bash
{
  "filename": "",
  "defchain": "Polkadot",
  "chains": {
    "Polkadot": {
      "providers": [
        "ws://127.0.0.1:9944",
        "wss://rpc.polkadot.io",
        "wss://cc1-1.polkadot.network"
      ],
      "startBlock": 892,
      "PlanckPerUnit" : 1e10,
      "check_accounts": []
    },
    "Kusama": {
      "providers": [
        "ws://127.0.0.1:9944",
        "wss://cc3-3.kusama.network",
        "wss://kusama-rpc.polkadot.io",
        "wss://cc3-1.kusama.network",
        "wss://cc3-2.kusama.network",
        "wss://cc3-4.kusama.network",
        "wss://cc3-5.kusama.network"
      ],
      "startBlock": 3876,
      "PlanckPerUnit" : 1e12,
      "check_accounts": []
    },
    "Westend": {
      "providers": [
        "ws://127.0.0.1:9944",
        "wss://westend-rpc.polkadot.io"
      ],
      "startBlock": 1191,
      "PlanckPerUnit" : 1e12,
      "check_accounts": []
    }
  }
}
```

**_Global settings:_**  
**filename:** The path to the sqlite database, the (empty) default means, the
filename is set automatically: "data/\<chainname\>.db"  
**defchain:** The chain which is used (if no chain is given in the command line)  
**_Chain specific settings:_**  
**providers:** An array of websocket urls describing the nodes to connect. The program tries to connect the first node in list, if connection fails, the next one is used.  
**startBlock:** The first block in the chain to be scanned. The default values refer to the blocks with the first transactions on chain.
If the database is empty, the block scan starts at this block, if not, at the last block stored in the database.  
**PlanckPerUnit:** Defines the number of Plancks per DOT/KSM/WND, or simply the count of decimal places  
**check_accounts:** A list of accounts used in check mode (see below)

### 3.2 Copy example database

If you do not want to start from scratch, you can copy my provided example
databases to the data directory. The program will continue scanning the blockchain
starting from the last block found in the database.  
If the data directory is empty, a new database is created and the blockchain is
scanned from the beginning.

Available example databases:

|  Database   | Last Block |     Date     |   Download   |
|:------------|:-----------|:-------------|:-------------|
| Polkadot.db | 1579854    | Sep 13, 2020 | [Polkadot.db](https://e.pcloud.link/publink/show?code=kZx3eZENGTspnf6YLueJK6F2w8ULTpnFIk)  |
| Kusama.db   | 3983032    | Sep 10, 2020 | [Kusama.db](https://e.pcloud.link/publink/show?code=kZx3eZENGTspnf6YLueJK6F2w8ULTpnFIk)    |
| Westend.db  | 2213022    | Sep 13, 2020 | [Westend.db](https://e.pcloud.link/publink/show?code=kZx3eZENGTspnf6YLueJK6F2w8ULTpnFIk)   |

## 4 Running

### 4.1 Compile Typescript

Now you have to build the code (compile typescript to javascript)

``` bash
yarn build
```

### 4.2 Start program

**One** of the following commands starts the tool, collecting data from the **given** chain:

``` bash
yarn polkadot
yarn kusama
yarn westend
```

**Hint:** If you're connected to your own (or local) node, the chain of the node must match the given chain parameter.
Otherwise the program is cancelled.

## 5 Output

The created SQLite database you can find (by default) in the data directory.  
Here you can find the database structure:

|  Column            | Description                                               |
|:-------------------|:----------------------------------------------------------|
| chain              | chain name                                                |
| id                 | unique id                                                 |
| height             | bock height                                               |
| blockHash          | block hash                                                |
| type               | extrinsic method                                          |
| subType            | extrinsic submethod (e.g. in a 'utility.batch' extrinsic) |
| event              | the event triggered by the extrinsic                      |
| timestamp          | unix timestamp (in ms since Jan 1, 1970)                  |
| specVersion        | runtime version                                           |
| transactionVersion | transaction version                                       |
| authorId           | the account id of the block validator                     |
| senderId           | the account id of the block signer / transaction sender   |
| recipientId        | the account id of the transaction recipient               |
| amount             | the amount which was sent or rewarded                     |
| partialFee         | the fee which was paid by the block signer                |
| feeBalances        | the part of the fee that passed to the block author       |
| feeTreasury        | the part of the fee that passed to the treasury           |
| tip                | an additional tip paid by the block signer                |
| success            | the transaction was successfull                           |

## 6 Known issues

**Hint:** The issues only concern the kusama sample database, the program code has already been fixed.

- The 'multisig.asMulti' extrinsic is currently not specially treated.
Transfers resulting from this are currently missing in the database.
- The 'staking.Reward' event contains the stash account in each case.
If the reward destination is set to the controller account, this is not handled correctly.

## 7 Check mode

To make sure that I have all balance relevant transactions in the database,
I implemented a check mode. You can configure several accounts to check in config.json:

``` bash
"check_accounts": [
        "14K61ECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "165jxPGyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
        "14GYRjnzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
      ]
```

After configuring the accounts, you can start the check mode with one of the following commands:

``` bash
yarn check_polkadot
yarn check_kusama
yarn check_westend
```

For each account the balance at block xxxx (last block in database) will be
calculated based on the database entries. Please check the results with the real
balances and report possible missing transactions or issues.  
Thank you for your support!

## 8 Contributions

I welcome contributions. Before submitting your PR, make sure to run the following commands:

- `yarn lint`: Make sure your code follows the linting rules.
- `yarn lint --fix`: Automatically fix linting errors.

<https://github.com/TheGoldenEye/polka-store/graphs/contributors>

## 9 Authors

- GoldenEye
- Used some parts of the "Substrate API Sidecar" project <https://github.com/paritytech/substrate-api-sidecar>  
  (Fee calculation tool and API-Handler)

## 10 Please support me

If you like my work, please consider to support me in Polkadot.  
I would be happy if you nominate my validators in the Polkadot / Kusama networks:

**Polkadot:**

1. [Validator GoldenEye](https://polkadot.subscan.io/account/14K71ECxvekU8BXGJmSQLed2XssM3HdBYQBuDUwHeUMUgBHk)
2. [Validator GoldenEye/2](https://polkadot.subscan.io/account/13MjZA7vpcpxfGEUH2myFBkMxi3eSV2VUmActtUAFy2ESH4V)

**Kusama:**

1. [Validator GoldenEye](https://kusama.subscan.io/account/FiNuPk2iPirbKC7Spse3NuE9rWjzaQonZmk6wRvk1LcEU13)
2. [Validator GoldenEye/2](https://kusama.subscan.io/account/GcQXL1HgF1ZETZi3Tw3PoXGWeXbDpfsJrrgNgwxde4uoVaB)

## 11 License

Apache-2.0  
Copyright (c) 2020 GoldenEye

**Disclaimer:
The tool is provided as-is. I cannot give a guarantee for accuracy and I assume NO LIABILITY.**
