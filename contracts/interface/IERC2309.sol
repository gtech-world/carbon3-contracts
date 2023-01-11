// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

/**
 * @dev Required interface of an ERC2309 compliant contract
 */
interface IERC2309 {
  event ConsecutiveTransfer(uint256 indexed fromTokenId, uint256 toTokenId, address indexed fromAddress, address indexed toAddress);
}