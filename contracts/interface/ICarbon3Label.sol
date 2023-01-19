// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";

import "./IERC2309.sol";

interface ICarbon3Label is IERC721MetadataUpgradeable, IERC2309 {

  error Unsupported();

  /**
   * @dev Mint a batch of tokens to specified account. Only account with MINTER_ROLE is able to perform this operation.
   */
  function batchMint(address to, uint256 quantity, string memory batchBaseUri) external;

  /**
   * @dev Transfer a batch of tokens to specified account. Only owner of this token batch should be is able to perform this operation.
   */
  function batchTransfer(address to, uint256 batchId) external;

  /**
   * @dev Burn a batch of tokens. Only owner of this token batch should be is able to perform this operation.
   */
  function batchBurn(uint256 batchId) external;
}