// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

/**
 * @dev This is an revised version of ERC5192 (https://eips.ethereum.org/EIPS/eip-5192) interface for batch Locked/Unlocked events.
 * 
 * Why we need this? 
 * EIP5192 is the minimal interface for soulbinding EIP721 NFTs, Dapp may rely on the `locked` interface to tell whether an NFT is soulbound or not.
 */
interface IERC5192Batch {
  /// @notice Emitted when the locking status of a token batch is changed to locked.
  /// @dev If a token batch is minted and the status is locked, this event should be emitted.
  /// @param fromTokenId Token Id of the first token of the batch
  /// @param toTokenId Token Id of the last token of the batch
  event ConsecutiveLocked(uint256 fromTokenId, uint256 toTokenId);

  /// @notice Emitted when the locking status of a token batch is changed to unlocked.
  /// @dev If a token batch is minted and the status is unlocked, this event should be emitted.
  /// @param fromTokenId Token Id of the first token of the batch
  /// @param toTokenId Token Id of the last token of the batch
  event ConsecutiveUnlocked(uint256 fromTokenId, uint256 toTokenId);

  /// @notice Returns the locking status of an Soulbound Token
  /// @dev SBTs assigned to zero address are considered invalid, and queries
  /// about them do throw.
  /// @param tokenId The identifier for an SBT.
  function locked(uint256 tokenId) external view returns (bool);
}