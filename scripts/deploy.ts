import { ethers, upgrades } from "hardhat";

async function main() {
  const Carbon3Label = await ethers.getContractFactory("Carbon3Label");
  const contract = await upgrades.deployProxy(Carbon3Label, ["Carbon3Label", "C3L"]);
  console.log(`Deployed Carbon3Label to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
