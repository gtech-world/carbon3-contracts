import { ethers, upgrades } from "hardhat";

async function main() {
  const Carbon3Label = await ethers.getContractFactory("Carbon3Label");
  const contract = await upgrades.deployProxy(Carbon3Label, ["Automotive Carbon3 Trust Label", "PCFLabel"]);
  console.log(`Deployed Carbon3Label to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
