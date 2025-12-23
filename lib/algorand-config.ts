import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";

export const peraWallet = new PeraWalletConnect();

export const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

export const indexerClient = new algosdk.Indexer(
  "",
  "https://testnet-idx.algonode.cloud",
  ""
);

// Network configurations
export const NETWORKS = {
  TestNet: {
    algodUrl: "https://testnet-api.algonode.cloud",
    indexerUrl: "https://testnet-idx.algonode.cloud",
    explorerUrl: "https://testnet.algoexplorer.io",
  },
  MainNet: {
    algodUrl: "https://mainnet-api.algonode.cloud", 
    indexerUrl: "https://mainnet-idx.algonode.cloud",
    explorerUrl: "https://algoexplorer.io",
  }
};