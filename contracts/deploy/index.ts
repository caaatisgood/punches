import { InMemorySigner } from "@taquito/signer";
import { LedgerSigner } from '@taquito/ledger-signer';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import chalk from "chalk";
import * as dotenv from "dotenv";

import { missingEnvVarLog, makeSpinnerOperation } from "./utils";
import Puncher from "./compiled/puncher.json";

dotenv.config({ path: __dirname + "/.env" });

const toMainnet = !!process.env.TO_MAINNET
const {
  rpcUrl,
  pk,
  adminAddr
} = toMainnet ? {
  rpcUrl: process.env.MAINNET_RPC_URL,
  pk: process.env.MAINNET_PK,
  adminAddr: process.env.MAINNET_ADMIN_ADDRESS,
} : {
  rpcUrl: process.env.GHOST_RPC_URL,
  pk: process.env.GHOST_PK,
  adminAddr: process.env.GHOST_ADMIN_ADDRESS,
}
const withLedger = !!process.env.WITH_LEDGER;

if (!pk && !rpcUrl) {
  console.log(
    chalk.redBright`Couldn't find env variables. Have you renamed ` +
      chalk.red.bold.underline`deploy/.env.dist` +
      chalk.redBright` to ` +
      chalk.red.bold.underline(`deploy/.env`)
  );

  process.exit(-1);
}

if (!pk) {
  missingEnvVarLog("(GHOST|MAINNET)_PK");
  process.exit(-1);
}

if (!rpcUrl) {
  missingEnvVarLog("(GHOST|MAINNET)_RPC_URL");
  process.exit(-1);
}

if (!adminAddr) {
  missingEnvVarLog("(GHOST|MAINNET)_ADMIN_ADDRESS");
  process.exit(-1);
}

const Tezos = new TezosToolkit(rpcUrl);

async function deployPuncher() {
  let factory_store = {
    punches: new MichelsonMap(),
    tickets: new MichelsonMap(),
    wips: new MichelsonMap(),
    houses: new MichelsonMap(),
    punch_count: 0,
    punch_cd: 86_400, // one day
    wip_text_max_len: 100,
    punch_text_max_len: 50,
    house_set: ["erevald", "gaudmire", "alterok", "spectreseek"],
    admin: adminAddr,
    paused: false,
  };

  try {
    const origination = await makeSpinnerOperation(
      Tezos.contract.originate({
        code: Puncher,
        storage: factory_store,
      }),
      {
        loadingMessage: chalk.yellowBright`Deploying Puncher contract`,
        endMessage: chalk.green`Puncher Contract deployed!`,
      }
    );

    await makeSpinnerOperation(origination.contract(), {
      loadingMessage:
        chalk.yellowBright`Waiting for Puncher contract to be confirmed at: ` +
        chalk.yellow.bold(origination.contractAddress),
      endMessage: chalk.green`Puncher Contract confirmed!`,
    });

    console.log(
      chalk.green`\nPuncher Contract address: \n- ` +
        chalk.green.underline`${origination.contractAddress}`
    );
  } catch (error: any) {
    console.log("");
    console.log(chalk.redBright`Error during deployment:`);
    console.log(error);
    process.exit(1);
  }
}

async function deploy() {
  if (withLedger) {
    const transport = await TransportNodeHid.create();
    const ledgerSigner = new LedgerSigner(
      transport, //required
    );
    Tezos.setProvider({ signer: ledgerSigner });
  } else {
    const signer = new InMemorySigner(pk!);
    Tezos.setProvider({ signer: signer });
  }
  const publicKey = await Tezos.signer.publicKey();
  const publicKeyHash = await Tezos.signer.publicKeyHash();
  console.table({
    publicKey,
    publicKeyHash,
  });
  
  await deployPuncher();
}

deploy();
