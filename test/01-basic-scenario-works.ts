import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from "chai";
import { ADDRESS_0, deployCarbon3Fixture, nextBatchInfo } from "./utils";

describe("Base-Work", () => {

  it("Basic scenario works", async () => {
    const { carbon3, Alice, Bob, Caro } = await loadFixture(deployCarbon3Fixture);

    // Bob could not mint batches without minter role
    await expect(carbon3.connect(Bob).batchMint(Bob.address, 100, 'ipfs://<BATCH_FOLDER_CID>'))
      .to.be.rejectedWith(
        /AccessControl/,
        'Trying to batch mint without minter role should fail'
      );

    // grant minter role to Bob
    const minterRole = await carbon3.MINTER_ROLE();
    await expect(carbon3.connect(Alice).grantRole(minterRole, Bob.address))
      .to.emit(carbon3, 'RoleGranted').withArgs(minterRole, Bob.address, anyValue);
    
    // Bob mint batches to himself and Caro
    const batch1 = await nextBatchInfo(carbon3, 100, 'ipfs://<BATCH_FOLDER_CID_1>');
    await expect(carbon3.connect(Bob).batchMint(Bob.address, batch1.batchQuantity, batch1.batchBaseUri))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batch1.startTokenId, batch1.endTokenId, ADDRESS_0, Bob.address);
    const batch2 = await nextBatchInfo(carbon3, 1000, 'ipfs://<BATCH_FOLDER_CID_2>');
    await expect(carbon3.connect(Bob).batchMint(Caro.address, batch2.batchQuantity, batch2.batchBaseUri))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batch2.startTokenId, batch2.endTokenId, ADDRESS_0, Caro.address);
    
    expect(await carbon3.totalSupply()).to.equal(batch1.batchQuantity + batch2.batchQuantity);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(batch1.batchQuantity);
    expect(await carbon3.balanceOf(Caro.address)).to.equal(batch2.batchQuantity);

    // Assert tokenURI and ownerOf
    const someTokenId = batch2.startTokenId + 1;
    expect(await carbon3.ownerOf(someTokenId)).to.equal(Caro.address);
    expect(await carbon3.tokenURI(someTokenId)).to.equal(batch2.batchBaseUri + "/1.json");

    // Bob could not burn a batch he does not own
    await expect(carbon3.connect(Bob).batchBurn(batch2.batchId))
      .to.be.rejectedWith(
        /Batch burn from incorrect owner/,
        'Trying to batch burn unowned tokens should fail'
      );
    
    // Bob burn a batch
    await expect(carbon3.connect(Bob).batchBurn(batch1.batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batch1.startTokenId, batch1.endTokenId, Bob.address, ADDRESS_0);
    expect(await carbon3.totalSupply()).to.equal(batch2.batchQuantity);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(0);
  
    // Caro transfer a batch to Bob
    await expect(carbon3.connect(Caro).batchTransfer(Bob.address, batch2.batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(batch2.startTokenId, batch2.endTokenId, Caro.address, Bob.address);
    expect(await carbon3.balanceOf(Bob.address)).to.equal(batch2.batchQuantity);
    expect(await carbon3.balanceOf(Caro.address)).to.equal(0);
    expect(await carbon3.ownerOf(someTokenId)).to.equal(Bob.address);
  });
});
