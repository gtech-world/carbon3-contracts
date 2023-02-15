// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "../Carbon3Label.sol";

contract TestCarbon3LabelV2 is Carbon3Label {

  function funcV2()
      public
      pure
      returns (bool)
  {
      return true;
  }

  function batchBurn(uint256 batchId) override external whenNotPaused {

  }
}