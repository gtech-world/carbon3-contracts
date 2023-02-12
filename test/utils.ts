import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Carbon3Label, Carbon3Label__factory } from "../typechain";
const { provider } = ethers;

export const ADDRESS_0 = "0x0000000000000000000000000000000000000000";

export async function deployCarbon3Fixture() {
  const Carbon3 = await ethers.getContractFactory("Carbon3Label");
  const carbon3Proxy = await upgrades.deployProxy(Carbon3, ["Carbon3", "C3L"]);
  const carbon3 = Carbon3Label__factory.connect(carbon3Proxy.address, provider);
  const implAddress = await upgrades.erc1967.getImplementationAddress(carbon3.address);

  const [Alice, Bob, Caro, Dave] = await ethers.getSigners();

  return { carbon3: carbon3.connect(Alice), implAddress, Alice, Bob, Caro, Dave };
}

export async function batchMint(to: string, count: number, carbon3: Carbon3Label, baseUri: string = "ipfs://<BATCH_FOLDER_CID>") {
  const batchSize = await carbon3.BATCH_SIZE();
  const batchId = (await carbon3.currentBatchId()).add(1);
  const start = batchSize.mul(batchId);
  const end = start.add(count - 1);
  expect(carbon3.batchMint(to, count, baseUri))
    .to.emit(carbon3, "ConsecutiveTransfer")
    .withArgs(start, end, ADDRESS_0, to);
  return { batchSize, batchId, start, end, baseUri };
}
