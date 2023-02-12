import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ADDRESS_0, batchMint, deployCarbon3Fixture } from "./utils";
describe("Should reject on incorrect input", () => {
  it("Should reject batch mint", async () => {
    const { carbon3, Bob } = await loadFixture(deployCarbon3Fixture);
    // count > 1000000
    expect(carbon3.batchMint(Bob.address, 1000001, "ipfs://<BASE_CID>")).to.be.rejectedWith(
      "/Invalid batch mint quantity/"
    );
    // count < 0
    expect(carbon3.batchMint(Bob.address, -1, "ipfs://<BASE_CID>")).to.be.rejectedWith("/Invalid batch mint quantity/");
    // address(0)
    expect(carbon3.batchMint(ADDRESS_0, 1000, "ipfs://<BASE_CID>")).to.be.rejectedWith(
      "/Could not mint to zero address/"
    );
  });

  it("Should reject batch transfer", async () => {
    const { carbon3, Bob, Alice, Dave } = await loadFixture(deployCarbon3Fixture);
    const { batchId } = await batchMint(Bob.address, 100000, carbon3);

    // batchId not exists
    expect(carbon3.connect(Bob).batchTransfer(Alice.address, batchId.add(100))).to.be.rejectedWith(
      "/Invalid batch to transfer/",
      "batchId not exists"
    );
    // incorrect owner
    expect(carbon3.connect(Alice).batchTransfer(Dave.address, batchId)).to.be.rejectedWith(
      "/Batch transfer from incorrect owner/",
      "incorrect owner"
    );
    // address(0)
    expect(carbon3.connect(Bob).batchTransfer(ADDRESS_0, batchId)).to.be.rejectedWith(
      "/Batch transfer to the zero address/",
      "to the zero address"
    );
  });

  it("Should reject batch burn", async () => {
    const { carbon3, Bob, Alice } = await loadFixture(deployCarbon3Fixture);
    const { batchId } = await batchMint(Bob.address, 100000, carbon3);
    // batchId not exists
    expect(carbon3.connect(Bob).batchBurn(batchId.add(100))).to.be.rejectedWith(
      "/Invalid batch to burn/",
      "batchId not exists"
    );
    // incorrect owner
    expect(carbon3.connect(Alice).batchBurn(batchId)).to.be.rejectedWith(
      "/Batch burn from incorrect owner/",
      "incorrect owner"
    );
  });
});
