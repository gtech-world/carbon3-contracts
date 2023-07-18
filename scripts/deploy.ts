import { ethers, upgrades } from "hardhat";
import { Carbon3Label } from "../typechain";

async function testTx() {
  const signer = (await ethers.getSigners())[0];
  const balance = await signer.getBalance();
  console.info("address:", signer.address);
  console.info("balance:", ethers.utils.formatEther(balance));
  const to = "0xAb69CF7CB15EE88ab4CBD397cB9B8a5df5F544ff"
  const tx = await signer.sendTransaction({ to, value: ethers.utils.parseEther('1')})
  console.info('sended:', tx.hash)
  const res = await tx.wait()
  console.info('txFinish')
  console.info('to:', to, ":" ,ethers.utils.formatEther(await ethers.provider.getBalance(to)))

}

async function main() {
  const signer = (await ethers.getSigners())[0];
  const Carbon3Label = await ethers.getContractFactory("Carbon3Label");
  const balance = await signer.getBalance()
  console.info('balance:', balance.toString())
  const contract = await upgrades.deployProxy(Carbon3Label, ["Automotive Carbon3 Trust Label", "PCFLabel"]) as Carbon3Label;
  console.log(`Deployed Carbon3Label to ${contract.address}`);
  const adminRole = await contract.DEFAULT_ADMIN_ROLE()
  const hasAdminRole = await contract.hasRole(adminRole, signer.address)
  console.info('adminrole:', adminRole)
  console.info('hasadminrole:', hasAdminRole)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
