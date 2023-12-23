// SPDX-License-Identifier: APACHE
pragma solidity ^0.8.20;

import "@opengsn/contracts/src/BasePaymaster.sol";

contract EMTPaymaster is BasePaymaster {
    constructor(address initialOwner) Ownable(initialOwner) {}

    address public target;

    event TargetChanged(address oldTarget, address newTarget);

    function versionPaymaster()
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "3.0.0-beta.3+opengsn.recipient.ipaymaster";
    }

    function setTarget(address _target) external onlyOwner {
        emit TargetChanged(target, _target);
        target = _target;
    }

    function _preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    )
        internal
        virtual
        override
        returns (bytes memory context, bool revertOnRecipientRevert)
    {
        (relayRequest, signature, approvalData, maxPossibleGas);
        require(relayRequest.request.to == target, "wrong target");
        //returning "true" means this paymaster accepts all requests that
        // are not rejected by the recipient contract.
        return ("", true);
    }

    function _postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) internal virtual override {
        (context, success, gasUseWithoutPost, relayData);
    }
}
