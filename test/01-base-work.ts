import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ADDRESS_0, batchMint, deployCarbon3Fixture } from "./utils";

describe("Base-Work", () => {
  it("Should batch mint", async () => {
    const { carbon3, Bob } = await loadFixture(deployCarbon3Fixture);
    const batch1 = await batchMint(Bob.address, 100000, carbon3);
    const batch2 = await batchMint(Bob.address, 111111, carbon3, "https://batch2base.uri");

    // balance
    expect(carbon3.balanceOf(Bob.address).then((b) => b.toString())).to.be.eventually.fulfilled.eq(
      "211111",
      "check balance"
    );
    // tokenUri
    expect(carbon3.tokenURI(batch1.start.add(100))).to.be.eventually.fulfilled.eq(batch1.baseUri + "/100.json");
    expect(carbon3.tokenURI(batch2.start.add(100))).to.be.eventually.fulfilled.eq(batch2.baseUri + "/100.json");
  });

  it("Should batch transfer", async () => {
    const { carbon3, Bob, Alice } = await loadFixture(deployCarbon3Fixture);
    const { start, end, batchId } = await batchMint(Bob.address, 100000, carbon3);

    expect(carbon3.connect(Bob).batchTransfer(Alice.address, batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(start, end, Bob.address, Alice.address);
  });

  it("Should batch burn", async () => {
    const { carbon3, Bob } = await loadFixture(deployCarbon3Fixture);
    const { start, end, batchId } = await batchMint(Bob.address, 100000, carbon3);

    expect(carbon3.connect(Bob).batchBurn(batchId))
      .to.emit(carbon3, "ConsecutiveTransfer")
      .withArgs(start, end, Bob.address, ADDRESS_0);
  });
});
