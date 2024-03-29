import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployCarbon3Fixture } from "./utils";

describe("Pausable work", () => {

  it("pause mint,transfer,burn", async () => {
    const { carbon3, Alice, Bob } = await loadFixture(deployCarbon3Fixture);
    await carbon3.batchMint(Alice.address, 100000, "ipfs://<BASE_CID>");
    expect(carbon3.pause()).to.emit(carbon3, "Paused").withArgs(Alice.address);
    expect(carbon3.batchMint(Alice.address, 10000, "ipfs://<BASE_CID>")).to.be.rejectedWith(
      /Pausable: paused/,
      "Should not be able to batch mint"
    );
    expect(carbon3.batchTransfer(Bob.address, 1)).to.be.rejectedWith(
      /Pausable: paused/,
      "Should not be able to batch transfer"
    );
    expect(carbon3.batchBurn(1)).to.be.rejectedWith(/Pausable: paused/, "Should not be able to batch burn");
  });

});
