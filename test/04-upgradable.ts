import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { ADDRESS_0, deployCarbon3Fixture, nextBatchInfo } from "./utils";

describe("Upgradable", () => {

  it("Upgradable", async () => {
    const { carbon3, Alice, Bob } = await loadFixture(deployCarbon3Fixture);

    const batch1 = await nextBatchInfo(carbon3, 100, 'ipfs://<BATCH_FOLDER_CID_1>');
    await expect(carbon3.connect(Alice).batchMint(Bob.address, batch1.batchQuantity, batch1.batchBaseUri))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batch1.startTokenId, batch1.endTokenId, ADDRESS_0, Bob.address);
    
    expect(await carbon3.totalSupply()).to.equal(batch1.batchQuantity);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(batch1.batchQuantity);

    // upgrade
    const TestCarbon3LabelV2 = await ethers.getContractFactory("TestCarbon3LabelV2");
    const carbon3V2 = await upgrades.upgradeProxy(carbon3.address, TestCarbon3LabelV2);

    // contract address should be kept
    expect(carbon3V2.address).to.equal(carbon3.address, 'Should keep same address after upgrade');

    // contract state should be kept
    expect(await carbon3V2.totalSupply()).to.equal(batch1.batchQuantity);
    expect(await carbon3V2.balanceOf(Bob.address)).to.equal(batch1.batchQuantity);

    // contract behavior could be revised
    await expect(carbon3V2.connect(Alice).batchBurn(batch1.batchId)).not.to.be.reverted;
  });

});
