import { ethers, upgrades } from "hardhat";

async function main() {
  const Carbon3TrustLabel = await ethers.getContractFactory("Carbon3TrustLabel");
  const contract = await upgrades.deployProxy(Carbon3TrustLabel, ["Carbon3TrustLabel", "C3TL"]);
  console.log(`Deployed Carbon3TrustLabel to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
