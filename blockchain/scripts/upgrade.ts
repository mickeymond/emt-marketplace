import { ethers, upgrades } from "hardhat";
import dotenv from "dotenv";

const generateAbis = require('./generateAbis');

dotenv.config();

async function main() {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const emtMarketplaceAddress = chainId === 80001n ? '0x6043DFca8ee0CDD60028e7262f08c1b59f256231' : chainId === 2359n ? '0x6043DFca8ee0CDD60028e7262f08c1b59f256231' : '0x6043DFca8ee0CDD60028e7262f08c1b59f256231';
  const mentorTokenAddress = chainId === 80001n ? '0xa9daB686576ca111B300FE9562796d6D40443eC0' : chainId === 2359n ? '0xa9daB686576ca111B300FE9562796d6D40443eC0' : '0xa9daB686576ca111B300FE9562796d6D40443eC0';
  const expertTokenAddress = chainId === 80001n ? '0xf72b93A8d7404038C90AF2B3ABB3b9eB3025949c' : chainId === 2359n ? '0xf72b93A8d7404038C90AF2B3ABB3b9eB3025949c' : '0xf72b93A8d7404038C90AF2B3ABB3b9eB3025949c';
  const stableCoinAddress = chainId === 80001n ? '0xb57D5B0967d87D89f266Dd8719A7FF2607Ceb59B' : chainId === 2359n ? '0xb57D5B0967d87D89f266Dd8719A7FF2607Ceb59B' : '0xb57D5B0967d87D89f266Dd8719A7FF2607Ceb59B';

  // Deploy Marketplace Contract
  const EMTMarketplace = await ethers.getContractFactory("EMTMarketplace");
  const emtMarketplace = await upgrades.upgradeProxy(emtMarketplaceAddress, EMTMarketplace);
  await emtMarketplace.waitForDeployment();
  console.log("EMT Marketplace deployed at: ", emtMarketplace.target);

  // const minter = process.env.TOKEN_MINTER || emtMarketplace.target;

  // Deploy Mentor Token
  const MentorToken = await ethers.getContractFactory("MentorToken");
  const mentorToken = await upgrades.upgradeProxy(mentorTokenAddress, MentorToken);
  await mentorToken.waitForDeployment();
  console.log("Mentor Token deployed at: ", mentorToken.target);

  // Deploy Expert Token
  const ExpertToken = await ethers.getContractFactory("ExpertToken");
  const expertToken = await upgrades.upgradeProxy(expertTokenAddress, ExpertToken);
  await expertToken.waitForDeployment();
  console.log("Expert Token deployed at: ", expertToken.target);

  // Deploy Stablecoin
  const StableCoin = await ethers.getContractFactory("StableCoin");
  const stableCoin = await upgrades.upgradeProxy(stableCoinAddress, StableCoin);
  await stableCoin.waitForDeployment();
  console.log("Stablecoin deployed at: ", stableCoin.target);

  //Generate files containining Abis and contract addresses for use in frontend
  generateAbis(chainId, {
    EMTMarketplace: emtMarketplace.target,
    MentorToken: mentorToken.target,
    ExpertToken: expertToken.target,
    StableCoin: stableCoin.target
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
