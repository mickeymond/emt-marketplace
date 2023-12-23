import { ethers } from "hardhat";
import dotenv from "dotenv";
import RelayHub from "../build/gsn/RelayHub.json";
import Forwarder from "../build/gsn/Forwarder.json";

dotenv.config();

async function main() {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const [owner] = await ethers.getSigners();
  const defaultAdmin = process.env.TOKEN_DEFAULT_ADMIN || owner.address;

  const gsnRelayHub = chainId === 80001n ? '0x3232f21A6E08312654270c78A773f00dd61d60f5' : chainId === 2359n ? '0x265DCc4c1CCB68Bbe52a1dFd78f877BEe4537E18' : RelayHub.address;
  const gsnTrustedForwarder = chainId === 80001n ? '0xB2b5841DBeF766d4b521221732F9B618fCf34A87' : chainId === 2359n ? '0x05173225a04dBa98DaB18f8a0c7E4d89a4384d52' : Forwarder.address;

  // Deploy Paymaste Contract
  // const EMTPaymaster = await ethers.getContractFactory("EMTPaymaster");
  const emtPaymaster = await ethers.deployContract("EMTPaymaster", [defaultAdmin]);
  await emtPaymaster.waitForDeployment();
  console.log("EMT Paymaster deployed at: ", emtPaymaster.target);

  // Set Relay Hub
  await (await emtPaymaster.setRelayHub(gsnRelayHub)).wait();
  console.log("Done Setting GSN Relay Hub Address!");

  // Set Trusted Forwarder
  await (await emtPaymaster.setTrustedForwarder(gsnTrustedForwarder)).wait();
  console.log("Done Setting GSN Trusted Forwarder Address!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
