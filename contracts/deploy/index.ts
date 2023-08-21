import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import chalk from "chalk";
import * as dotenv from "dotenv";

import { missingEnvVarLog, makeSpinnerOperation } from "./utils";
import PuncherKt from "./compiled/puncher.json";

dotenv.config({ path: __dirname + "/.env" });

const rpcUrl = process.env.RPC_URL; //"http://127.0.0.1:8732"
const pk = process.env.PK;
const adminAddr = process.env.ADMIN_ADDRESS;

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
  missingEnvVarLog("PK");
  process.exit(-1);
}

if (!rpcUrl) {
  missingEnvVarLog("RPC_URL");
  process.exit(-1);
}

if (!adminAddr) {
  missingEnvVarLog("ADMIN_ADDRESS");
  process.exit(-1);
}

const Tezos = new TezosToolkit(rpcUrl);
const signer = new InMemorySigner(pk);
Tezos.setProvider({ signer: signer });

async function deployPuncherKt() {
  let factory_store = {
    token_count: 0,
    tickets: new MichelsonMap(),
    goals: new MichelsonMap(),
    goal_chars: 100,
    note_chars: 50,
    admin: adminAddr,
  };

  try {
    const origination = await makeSpinnerOperation(
      Tezos.contract.originate({
        code: PuncherKt,
        storage: factory_store,
      }),
      {
        loadingMessage: chalk.yellowBright`Deploying PuncherKt contract`,
        endMessage: chalk.green`PuncherKt Contract deployed!`,
      }
    );

    await makeSpinnerOperation(origination.contract(), {
      loadingMessage:
        chalk.yellowBright`Waiting for PuncherKt contract to be confirmed at: ` +
        chalk.yellow.bold(origination.contractAddress),
      endMessage: chalk.green`PuncherKt Contract confirmed!`,
    });

    console.log(
      chalk.green`\nPuncherKt Contract address: \n- ` +
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
  await deployPuncherKt();
}

deploy();
