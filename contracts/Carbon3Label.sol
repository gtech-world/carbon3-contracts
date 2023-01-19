// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./interface/IERC2309.sol";
import "./Carbon3LabelBase.sol";

contract Carbon3Label is 
  Initializable,
  PausableUpgradeable,
  Carbon3LabelBase,
  UUPSUpgradeable {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(string memory name, string memory symbol) initializer public {
    __Pausable_init();
    __UUPSUpgradeable_init();
    __Carbon3LabelBase_init(name, symbol);

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
    _grantRole(UPGRADER_ROLE, msg.sender);
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    onlyRole(UPGRADER_ROLE)
    override {

    }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(IERC165Upgradeable, AccessControlEnumerableUpgradeable)
    returns (bool) {
    return
      interfaceId == type(IERC165Upgradeable).interfaceId ||
      interfaceId == type(IERC721Upgradeable).interfaceId ||
      interfaceId == type(IERC721MetadataUpgradeable).interfaceId ||
      interfaceId == type(IERC2309).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function safeTransferFrom(address, address, uint256) public virtual override {
    revert Unsupported();
  }

  function safeTransferFrom(address, address, uint256, bytes calldata) public virtual override {
    revert Unsupported();
  }

  function transferFrom(address, address, uint256) public virtual override {
    revert Unsupported();
  }
 
  function approve(address, uint256) public virtual override {
    revert Unsupported();
  }

  function setApprovalForAll(address, bool) public virtual override {
    revert Unsupported();
  }
  
  function getApproved(uint256) public view virtual override returns (address)  {
    revert Unsupported();
  }
  
  function isApprovedForAll(address, address) public view virtual override returns (bool) {
    revert Unsupported();
  }
}