import { ethers } from "hardhat";
import { Carbon3Label__factory } from "../typechain";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = "0xb305345Ef63CCdBfFb4B8BeEA2c4cedCDA2f322B";
  const c3 = Carbon3Label__factory.connect(address, signer);
  const to = "0x90921CA7B23c327Ab9f1e0331806149a427299a3";
  const mintRole = await c3.MINTER_ROLE();
  const tx = await c3.grantRole(mintRole, to);
  console.info("send:tx:", tx.hash);
  await tx.wait();
  const hasRole = await c3.hasRole(mintRole, to);
  console.info("hasRole:", hasRole);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
