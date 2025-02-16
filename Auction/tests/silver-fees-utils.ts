import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  EditedFees,
  EditedTeamMultisig,
  FeesManagementExecuted,
  FeesTokenAdded,
  FeesTokenRemoved,
  FeesTokenSwapped,
  FlareAuction,
  FlareBuyback,
  FlareExecution,
  GelatoFeesCheck,
  GelatoTaskCancelFailed,
  GelatoTaskCanceled,
  GelatoTaskCreated,
  OwnershipTransferStarted,
  OwnershipTransferred,
  SnatchAuction,
  SnatchExecution,
  SnatchSteal,
  SwapToWrappedToken,
  SwapTypeChanged,
  SyncFeesManagement,
  SyncFeesStarted,
  TokensBurned,
  WithdrawnNative,
  WithdrawnToken
} from "../generated/SilverFees/SilverFees"

export function createEditedFeesEvent(
  teamFees: BigInt,
  weeklyGiveawayFees: BigInt,
  buybackFees: BigInt
): EditedFees {
  let editedFeesEvent = changetype<EditedFees>(newMockEvent())

  editedFeesEvent.parameters = new Array()

  editedFeesEvent.parameters.push(
    new ethereum.EventParam(
      "teamFees",
      ethereum.Value.fromUnsignedBigInt(teamFees)
    )
  )
  editedFeesEvent.parameters.push(
    new ethereum.EventParam(
      "weeklyGiveawayFees",
      ethereum.Value.fromUnsignedBigInt(weeklyGiveawayFees)
    )
  )
  editedFeesEvent.parameters.push(
    new ethereum.EventParam(
      "buybackFees",
      ethereum.Value.fromUnsignedBigInt(buybackFees)
    )
  )

  return editedFeesEvent
}

export function createEditedTeamMultisigEvent(
  teamMultisig: Address
): EditedTeamMultisig {
  let editedTeamMultisigEvent = changetype<EditedTeamMultisig>(newMockEvent())

  editedTeamMultisigEvent.parameters = new Array()

  editedTeamMultisigEvent.parameters.push(
    new ethereum.EventParam(
      "teamMultisig",
      ethereum.Value.fromAddress(teamMultisig)
    )
  )

  return editedTeamMultisigEvent
}

export function createFeesManagementExecutedEvent(
  forTeam: BigInt,
  forWeeklyGiveaway: BigInt,
  forBuyback: BigInt
): FeesManagementExecuted {
  let feesManagementExecutedEvent =
    changetype<FeesManagementExecuted>(newMockEvent())

  feesManagementExecutedEvent.parameters = new Array()

  feesManagementExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "forTeam",
      ethereum.Value.fromUnsignedBigInt(forTeam)
    )
  )
  feesManagementExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "forWeeklyGiveaway",
      ethereum.Value.fromUnsignedBigInt(forWeeklyGiveaway)
    )
  )
  feesManagementExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "forBuyback",
      ethereum.Value.fromUnsignedBigInt(forBuyback)
    )
  )

  return feesManagementExecutedEvent
}

export function createFeesTokenAddedEvent(
  token: Address,
  taskId: Bytes
): FeesTokenAdded {
  let feesTokenAddedEvent = changetype<FeesTokenAdded>(newMockEvent())

  feesTokenAddedEvent.parameters = new Array()

  feesTokenAddedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feesTokenAddedEvent.parameters.push(
    new ethereum.EventParam("taskId", ethereum.Value.fromFixedBytes(taskId))
  )

  return feesTokenAddedEvent
}

export function createFeesTokenRemovedEvent(token: Address): FeesTokenRemoved {
  let feesTokenRemovedEvent = changetype<FeesTokenRemoved>(newMockEvent())

  feesTokenRemovedEvent.parameters = new Array()

  feesTokenRemovedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return feesTokenRemovedEvent
}

export function createFeesTokenSwappedEvent(
  token: Address,
  amountIn: BigInt,
  amountOut: BigInt
): FeesTokenSwapped {
  let feesTokenSwappedEvent = changetype<FeesTokenSwapped>(newMockEvent())

  feesTokenSwappedEvent.parameters = new Array()

  feesTokenSwappedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feesTokenSwappedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  feesTokenSwappedEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(amountOut)
    )
  )

  return feesTokenSwappedEvent
}

export function createFlareAuctionEvent(
  user: Address,
  auctionAmount: BigInt
): FlareAuction {
  let flareAuctionEvent = changetype<FlareAuction>(newMockEvent())

  flareAuctionEvent.parameters = new Array()

  flareAuctionEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  flareAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "auctionAmount",
      ethereum.Value.fromUnsignedBigInt(auctionAmount)
    )
  )

  return flareAuctionEvent
}

export function createFlareBuybackEvent(
  token: Address,
  amount: BigInt
): FlareBuyback {
  let flareBuybackEvent = changetype<FlareBuyback>(newMockEvent())

  flareBuybackEvent.parameters = new Array()

  flareBuybackEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  flareBuybackEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return flareBuybackEvent
}

export function createFlareExecutionEvent(
  user: Address,
  buybackAmount: BigInt,
  programAmount: BigInt
): FlareExecution {
  let flareExecutionEvent = changetype<FlareExecution>(newMockEvent())

  flareExecutionEvent.parameters = new Array()

  flareExecutionEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  flareExecutionEvent.parameters.push(
    new ethereum.EventParam(
      "buybackAmount",
      ethereum.Value.fromUnsignedBigInt(buybackAmount)
    )
  )
  flareExecutionEvent.parameters.push(
    new ethereum.EventParam(
      "programAmount",
      ethereum.Value.fromUnsignedBigInt(programAmount)
    )
  )

  return flareExecutionEvent
}

export function createGelatoFeesCheckEvent(
  fees: BigInt,
  token: Address
): GelatoFeesCheck {
  let gelatoFeesCheckEvent = changetype<GelatoFeesCheck>(newMockEvent())

  gelatoFeesCheckEvent.parameters = new Array()

  gelatoFeesCheckEvent.parameters.push(
    new ethereum.EventParam("fees", ethereum.Value.fromUnsignedBigInt(fees))
  )
  gelatoFeesCheckEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return gelatoFeesCheckEvent
}

export function createGelatoTaskCancelFailedEvent(
  id: Bytes
): GelatoTaskCancelFailed {
  let gelatoTaskCancelFailedEvent =
    changetype<GelatoTaskCancelFailed>(newMockEvent())

  gelatoTaskCancelFailedEvent.parameters = new Array()

  gelatoTaskCancelFailedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return gelatoTaskCancelFailedEvent
}

export function createGelatoTaskCanceledEvent(id: Bytes): GelatoTaskCanceled {
  let gelatoTaskCanceledEvent = changetype<GelatoTaskCanceled>(newMockEvent())

  gelatoTaskCanceledEvent.parameters = new Array()

  gelatoTaskCanceledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return gelatoTaskCanceledEvent
}

export function createGelatoTaskCreatedEvent(id: Bytes): GelatoTaskCreated {
  let gelatoTaskCreatedEvent = changetype<GelatoTaskCreated>(newMockEvent())

  gelatoTaskCreatedEvent.parameters = new Array()

  gelatoTaskCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return gelatoTaskCreatedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createSnatchAuctionEvent(
  user: Address,
  poolToSteal: Address,
  auctionAmount: BigInt
): SnatchAuction {
  let snatchAuctionEvent = changetype<SnatchAuction>(newMockEvent())

  snatchAuctionEvent.parameters = new Array()

  snatchAuctionEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  snatchAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "poolToSteal",
      ethereum.Value.fromAddress(poolToSteal)
    )
  )
  snatchAuctionEvent.parameters.push(
    new ethereum.EventParam(
      "auctionAmount",
      ethereum.Value.fromUnsignedBigInt(auctionAmount)
    )
  )

  return snatchAuctionEvent
}

export function createSnatchExecutionEvent(
  user: Address,
  poolToSteal: Address
): SnatchExecution {
  let snatchExecutionEvent = changetype<SnatchExecution>(newMockEvent())

  snatchExecutionEvent.parameters = new Array()

  snatchExecutionEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  snatchExecutionEvent.parameters.push(
    new ethereum.EventParam(
      "poolToSteal",
      ethereum.Value.fromAddress(poolToSteal)
    )
  )

  return snatchExecutionEvent
}

export function createSnatchStealEvent(
  user: Address,
  rewardsPool: Address,
  rewardsToken: Address,
  rewardsAmount: BigInt
): SnatchSteal {
  let snatchStealEvent = changetype<SnatchSteal>(newMockEvent())

  snatchStealEvent.parameters = new Array()

  snatchStealEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  snatchStealEvent.parameters.push(
    new ethereum.EventParam(
      "rewardsPool",
      ethereum.Value.fromAddress(rewardsPool)
    )
  )
  snatchStealEvent.parameters.push(
    new ethereum.EventParam(
      "rewardsToken",
      ethereum.Value.fromAddress(rewardsToken)
    )
  )
  snatchStealEvent.parameters.push(
    new ethereum.EventParam(
      "rewardsAmount",
      ethereum.Value.fromUnsignedBigInt(rewardsAmount)
    )
  )

  return snatchStealEvent
}

export function createSwapToWrappedTokenEvent(
  swapToWrappedToken: boolean
): SwapToWrappedToken {
  let swapToWrappedTokenEvent = changetype<SwapToWrappedToken>(newMockEvent())

  swapToWrappedTokenEvent.parameters = new Array()

  swapToWrappedTokenEvent.parameters.push(
    new ethereum.EventParam(
      "swapToWrappedToken",
      ethereum.Value.fromBoolean(swapToWrappedToken)
    )
  )

  return swapToWrappedTokenEvent
}

export function createSwapTypeChangedEvent(): SwapTypeChanged {
  let swapTypeChangedEvent = changetype<SwapTypeChanged>(newMockEvent())

  swapTypeChangedEvent.parameters = new Array()

  return swapTypeChangedEvent
}

export function createSyncFeesManagementEvent(
  timestamp: BigInt
): SyncFeesManagement {
  let syncFeesManagementEvent = changetype<SyncFeesManagement>(newMockEvent())

  syncFeesManagementEvent.parameters = new Array()

  syncFeesManagementEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return syncFeesManagementEvent
}

export function createSyncFeesStartedEvent(): SyncFeesStarted {
  let syncFeesStartedEvent = changetype<SyncFeesStarted>(newMockEvent())

  syncFeesStartedEvent.parameters = new Array()

  return syncFeesStartedEvent
}

export function createTokensBurnedEvent(amount: BigInt): TokensBurned {
  let tokensBurnedEvent = changetype<TokensBurned>(newMockEvent())

  tokensBurnedEvent.parameters = new Array()

  tokensBurnedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokensBurnedEvent
}

export function createWithdrawnNativeEvent(
  to: Address,
  amount: BigInt
): WithdrawnNative {
  let withdrawnNativeEvent = changetype<WithdrawnNative>(newMockEvent())

  withdrawnNativeEvent.parameters = new Array()

  withdrawnNativeEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  withdrawnNativeEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawnNativeEvent
}

export function createWithdrawnTokenEvent(
  token: Address,
  to: Address,
  amount: BigInt
): WithdrawnToken {
  let withdrawnTokenEvent = changetype<WithdrawnToken>(newMockEvent())

  withdrawnTokenEvent.parameters = new Array()

  withdrawnTokenEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  withdrawnTokenEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  withdrawnTokenEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawnTokenEvent
}
