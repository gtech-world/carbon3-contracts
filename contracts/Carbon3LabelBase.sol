// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "./interface/ICarbon3Label.sol";

/**
 * ERC721 tokens that could only be minted / transferred / burned in batches.
 */
abstract contract Carbon3LabelBase is
  Initializable,
  ICarbon3Label,
  AccessControlEnumerableUpgradeable {
  using SafeMathUpgradeable for uint256;
  using StringsUpgradeable for uint256;
  using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToUintMap;
  using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToAddressMap;
  using EnumerableMapUpgradeable for EnumerableMapUpgradeable.AddressToUintMap;

  using CountersUpgradeable for CountersUpgradeable.Counter;

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  uint256 public constant BATCH_SIZE = 1_000_000;

  CountersUpgradeable.Counter internal _batchIdCounter;

  string internal _name;

  string internal _symbol;

  uint256 internal _totalSupply;

  /// @dev mapping(batchId => batch quantity)
  EnumerableMapUpgradeable.UintToUintMap internal _batchQuantities;

  /// @dev mapping(batchId => owner address)
  EnumerableMapUpgradeable.UintToAddressMap internal _batchOwners;

  /// @dev mapping(address => token count)
  EnumerableMapUpgradeable.AddressToUintMap internal _balances;

  /// @dev batchId => batchBaseUri
  mapping(uint256 => string) internal _batchBaseURIs;

  function __Carbon3LabelBase_init(string memory name_, string memory symbol_) internal onlyInitializing {
    __Carbon3LabelBase_init_unchained(name_, symbol_);
  }

  function __Carbon3LabelBase_init_unchained(string memory name_, string memory symbol_) internal onlyInitializing {
    _name = name_;
    _symbol = symbol_;
  }

  function batchMint(address to, uint256 quantity, string memory batchBaseUri) external onlyRole(MINTER_ROLE) {
    require(to != address(0), 'Could not mint to zero address');
    require(quantity > 0 && quantity <= BATCH_SIZE, 'Invalid batch mint quantity');

    _batchIdCounter.increment();
    uint256 batchId = _batchIdCounter.current();

    uint256 startTokenId = batchId.mul(BATCH_SIZE);
    uint256 endTokenId = startTokenId.add(quantity - 1);

    require(!_batch_exists(batchId), "Token batch already minted");

    _batchQuantities.set(batchId, quantity);

    _totalSupply = _totalSupply.add(quantity);
    _batchOwners.set(batchId, to);

    uint256 balance = quantity;
    if (_balances.contains(to)) {
      balance = balance.add(_balances.get(to));
    }
    _balances.set(to, balance);

    emit ConsecutiveTransfer(startTokenId, endTokenId, address(0), to);

    _batchBaseURIs[batchId] = batchBaseUri;
  }

  function batchTransfer(address to, uint256 batchId) external {
    address from = _msgSender();
    require(_batch_exists(batchId), "Invalid batch to transfer");
    require(_batchOwners.get(batchId) == from, "Batch transfer from incorrect owner");
    require(to != address(0), "Batch transfer to the zero address");

    assert(_batchQuantities.contains(batchId));
    uint256 quantity = _batchQuantities.get(batchId);
    _balances.set(from, _balances.get(from).sub(quantity));
    _balances.set(to, _balances.get(to).add(quantity));

    _batchOwners.set(batchId, to);

    uint256 startTokenId = batchId.mul(BATCH_SIZE);
    uint256 endTokenId = startTokenId.add(quantity - 1);
    emit ConsecutiveTransfer(startTokenId, endTokenId, from, to);
  }

  function batchBurn(uint256 batchId) external {
    address from = _msgSender();
    require(_batch_exists(batchId), "Invalid batch to burn");
    require(_batchOwners.get(batchId) == from, "Batch burn from incorrect owner");

    assert(_batchQuantities.contains(batchId));
    uint256 quantity = _batchQuantities.get(batchId);
    _balances.set(from, _balances.get(from).sub(quantity));

    _totalSupply = _totalSupply.sub(quantity);

    _batchQuantities.remove(batchId);
    _batchOwners.remove(batchId);

    uint256 startTokenId = batchId.mul(BATCH_SIZE);
    uint256 endTokenId = startTokenId.add(quantity - 1);
    emit ConsecutiveTransfer(startTokenId, endTokenId, from, address(0));
  }

  function totalSupply() public view virtual returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address owner) public view virtual returns (uint256) {
    require(owner != address(0), "Address zero is not a valid owner");
    if (_balances.contains(owner)) {
      return _balances.get(owner);
    }
    return 0;
  }

  function ownerOf(uint256 tokenId) public view virtual returns (address) {
    (bool exists, uint256 batchId) = _exists(tokenId);
    require(exists, 'Invalid token Id');

    assert(_batchOwners.contains(batchId));
    return _batchOwners.get(batchId);
  }

  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }

  function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
    (bool exists, uint256 batchId) = _exists(tokenId);
    require(exists, 'Invalid token Id');

    string memory baseURI = _batchBaseURIs[batchId];
    assert(bytes(baseURI).length > 0);

    uint256 tokenBatchIndex = tokenId.mod(BATCH_SIZE);
    return string(abi.encodePacked(baseURI, tokenBatchIndex.toString(), '.json'));
  }

  function _exists(uint256 tokenId) internal view virtual returns (bool, uint256) {
    uint256 batchId = tokenId.div(BATCH_SIZE);
    if (!_batch_exists(batchId)) {
      return (false, batchId);
    }

    uint256 batchQuantity = _batchQuantities.get(batchId);
    uint256 tokenBatchIndex = tokenId.mod(BATCH_SIZE);
    return (tokenBatchIndex < batchQuantity, batchId);
  }

  function _batch_exists(uint256 batchId) internal view virtual returns (bool) {
    return _batchQuantities.contains(batchId);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[46] private __gap;
}
