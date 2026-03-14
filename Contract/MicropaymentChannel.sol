// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Micropayment Channel
/// @notice Smart contract cho phép thanh toán vi mô bằng chữ ký off-chain
contract MicropaymentChannel {

    address public sender;     // người mở kênh
    address public receiver;   // người nhận
    uint public deposit;       // số tiền nạp vào kênh
    bool public isClosed;

    mapping(uint => bool) public usedNonce;

    event ChannelOpened(address sender, address receiver, uint deposit);
    event ChannelClosed(uint amountPaid);

    constructor(address _receiver) payable {
        sender = msg.sender;
        receiver = _receiver;
        deposit = msg.value;

        emit ChannelOpened(sender, receiver, deposit);
    }

    /// tạo hash của message
    function getMessageHash(uint amount, uint nonce)
        public
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(address(this), amount, nonce)
        );
    }

    /// verify chữ ký
    function verify(
        uint amount,
        uint nonce,
        bytes memory signature
    )
        public
        view
        returns (bool)
    {
        bytes32 messageHash = getMessageHash(amount, nonce);

        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                messageHash
            )
        );

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        address signer = ecrecover(
            ethSignedMessageHash,
            v,
            r,
            s
        );

        return signer == sender;
    }

    /// đóng kênh và thanh toán
    function closeChannel(
        uint amount,
        uint nonce,
        bytes memory signature
    )
        public
    {
        require(msg.sender == receiver, "Only receiver");
        require(!isClosed, "Channel already closed");
        require(!usedNonce[nonce], "Nonce already used");
        require(verify(amount, nonce, signature), "Invalid signature");

        usedNonce[nonce] = true;
        isClosed = true;

        payable(receiver).transfer(amount);

        uint remaining = address(this).balance;
        payable(sender).transfer(remaining);

        emit ChannelClosed(amount);
    }

    /// tách chữ ký
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}