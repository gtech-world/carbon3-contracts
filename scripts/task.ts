import { ethers } from "hardhat";
import { Carbon3Label__factory } from "../typechain";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = "0xb305345Ef63CCdBfFb4B8BeEA2c4cedCDA2f322B";
  const c3 = Carbon3Label__factory.connect(address, signer);
  const to = "0xB7A3639019aC9086494d1023f17Ac8171879b0bb";
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
