// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";

import "./IERC2309.sol";

interface ICarbon3Label is IERC2309 {
  /**
   * @dev Returns the token collection name.
   */
  function name() external view returns (string memory);

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external view returns (string memory);

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  function tokenURI(uint256 tokenId) external view returns (string memory);

  /**
   * @dev Returns the number of tokens in ``owner``'s account.
   */
  function balanceOf(address owner) external view returns (uint256 balance);

  /**
   * @dev Returns the owner of the `tokenId` token.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function ownerOf(uint256 tokenId) external view returns (address owner);

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