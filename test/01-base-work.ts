import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from "chai";
import { ADDRESS_0, batchMint, deployCarbon3Fixture } from "./utils";

describe("Base-Work", () => {

  it("Basic scenario works", async () => {
    const { carbon3, Alice, Bob, Caro } = await loadFixture(deployCarbon3Fixture);

    await expect(carbon3.connect(Bob).batchMint(Bob.address, 100, 'ipfs://<BATCH_FOLDER_CID>'))
      .to.be.rejectedWith(
        /AccessControl/,
        'Trying to batch mint without minter role should fail'
      );

    const minterRole = await carbon3.MINTER_ROLE();
    await expect(carbon3.connect(Alice).grantRole(minterRole, Bob.address))
      .to.emit(carbon3, 'RoleGranted').withArgs(minterRole, Bob.address, anyValue);
    
    const batchSize = (await carbon3.BATCH_SIZE()).toNumber();
    await expect(carbon3.connect(Bob).batchMint(Bob.address, 100, 'ipfs://<BATCH_FOLDER_CID_1>'))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batchSize, batchSize + 100 - 1, ADDRESS_0, Bob.address);
    await expect(carbon3.connect(Bob).batchMint(Caro.address, 100, 'ipfs://<BATCH_FOLDER_CID_2>'))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batchSize * 2, batchSize * 2 + 100 - 1, ADDRESS_0, Caro.address);
    
    expect(await carbon3.totalSupply()).to.equal(100 + 100);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(100);
    expect(await carbon3.balanceOf(Caro.address)).to.equal(100);

    await expect(carbon3.connect(Bob).batchBurn(2))
      .to.be.rejectedWith(
        /Batch burn from incorrect owner/,
        'Trying to batch burn unowned tokens should fail'
      );
    
    await expect(carbon3.connect(Bob).batchBurn(1))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batchSize, batchSize + 100 - 1, Bob.address, ADDRESS_0);
    expect(await carbon3.totalSupply()).to.equal(100);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(0);
  

  });

  it("Should be batch mintable", async () => {
    const { carbon3, Bob } = await loadFixture(deployCarbon3Fixture);
    const batch1 = await batchMint(Bob.address, 100000, carbon3);
    const batch2 = await batchMint(Bob.address, 111111, carbon3, "ipfs://<BASE_CID2>");

    // balance
    expect(carbon3.balanceOf(Bob.address).then((b) => b.toString())).to.be.eventually.fulfilled.eq(
      "211111",
      "check balance"
    );
    // tokenUri
    expect(carbon3.tokenURI(batch1.start.add(100))).to.be.eventually.fulfilled.eq(batch1.baseUri + "/100.json");
    expect(carbon3.tokenURI(batch2.start.add(100))).to.be.eventually.fulfilled.eq(batch2.baseUri + "/100.json");
  });

  it("Should be batch transferrable", async () => {
    const { carbon3, Bob, Alice } = await loadFixture(deployCarbon3Fixture);
    const { start, end, batchId } = await batchMint(Bob.address, 100000, carbon3);

    expect(carbon3.connect(Bob).batchTransfer(Alice.address, batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(start, end, Bob.address, Alice.address);
  });

  it("Should be batch burnable", async () => {
    const { carbon3, Bob } = await loadFixture(deployCarbon3Fixture);
    const { start, end, batchId } = await batchMint(Bob.address, 100000, carbon3);

    expect(carbon3.connect(Bob).batchBurn(batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(start, end, Bob.address, ADDRESS_0);
  });
});
