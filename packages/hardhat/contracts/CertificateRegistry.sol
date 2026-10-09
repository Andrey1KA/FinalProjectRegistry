// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract CertificateRegistry {
    address public immutable issuer;
    uint256 public certificateCount;

    struct Certificate {
        uint256 id;
        address recipient;
        string title;
        address issuedBy;
        uint256 issuedAt;
    }

    mapping(uint256 => Certificate) private certificates;
    mapping(bytes32 => bool) private issuedKey;

    event CertificateIssued(uint256 indexed id, address indexed recipient, string title);

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Not the issuer");
        _;
    }

    constructor(address _issuer) {
        issuer = _issuer;
    }

    function issueCertificate(address recipient, string memory title) public onlyIssuer returns (uint256) {
        require(recipient != address(0), "Empty recipient");
        require(bytes(title).length > 0, "Empty title");
        bytes32 key = keccak256(abi.encode(recipient, title));
        require(!issuedKey[key], "Certificate already issued");

        issuedKey[key] = true;
        uint256 id = certificateCount + 1;
        certificateCount = id;
        certificates[id] = Certificate(id, recipient, title, msg.sender, block.timestamp);

        emit CertificateIssued(id, recipient, title);
        return id;
    }

    function getCertificate(uint256 id) public view returns (Certificate memory) {
        require(id > 0 && id <= certificateCount, "Unknown certificate");
        return certificates[id];
    }

    function isAuthentic(uint256 id) public view returns (bool) {
        return id > 0 && id <= certificateCount && certificates[id].recipient != address(0);
    }
}
