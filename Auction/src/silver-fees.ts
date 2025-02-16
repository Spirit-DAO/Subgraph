import {
  EditedFees as EditedFeesEvent,
  EditedTeamMultisig as EditedTeamMultisigEvent,
  FeesManagementExecuted as FeesManagementExecutedEvent,
  FeesTokenAdded as FeesTokenAddedEvent,
  FeesTokenRemoved as FeesTokenRemovedEvent,
  FeesTokenSwapped as FeesTokenSwappedEvent,
  FlareAuction as FlareAuctionEvent,
  FlareBuyback as FlareBuybackEvent,
  FlareExecution as FlareExecutionEvent,
  GelatoFeesCheck as GelatoFeesCheckEvent,
  GelatoTaskCancelFailed as GelatoTaskCancelFailedEvent,
  GelatoTaskCanceled as GelatoTaskCanceledEvent,
  GelatoTaskCreated as GelatoTaskCreatedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SnatchAuction as SnatchAuctionEvent,
  SnatchExecution as SnatchExecutionEvent,
  SnatchSteal as SnatchStealEvent,
  SwapToWrappedToken as SwapToWrappedTokenEvent,
  SwapTypeChanged as SwapTypeChangedEvent,
  SyncFeesManagement as SyncFeesManagementEvent,
  SyncFeesStarted as SyncFeesStartedEvent,
  TokensBurned as TokensBurnedEvent,
  WithdrawnNative as WithdrawnNativeEvent,
  WithdrawnToken as WithdrawnTokenEvent
} from "../generated/SilverFees/SilverFees"
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
} from "../generated/schema"

export function handleEditedFees(event: EditedFeesEvent): void {
  let entity = new EditedFees(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.teamFees = event.params.teamFees
  entity.weeklyGiveawayFees = event.params.weeklyGiveawayFees
  entity.buybackFees = event.params.buybackFees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEditedTeamMultisig(event: EditedTeamMultisigEvent): void {
  let entity = new EditedTeamMultisig(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.teamMultisig = event.params.teamMultisig

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeesManagementExecuted(
  event: FeesManagementExecutedEvent
): void {
  let entity = new FeesManagementExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.forTeam = event.params.forTeam
  entity.forWeeklyGiveaway = event.params.forWeeklyGiveaway
  entity.forBuyback = event.params.forBuyback

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeesTokenAdded(event: FeesTokenAddedEvent): void {
  let entity = new FeesTokenAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.taskId = event.params.taskId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeesTokenRemoved(event: FeesTokenRemovedEvent): void {
  let entity = new FeesTokenRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeesTokenSwapped(event: FeesTokenSwappedEvent): void {
  let entity = new FeesTokenSwapped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.amountIn = event.params.amountIn
  entity.amountOut = event.params.amountOut

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlareAuction(event: FlareAuctionEvent): void {
  let entity = new FlareAuction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.auctionAmount = event.params.auctionAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlareBuyback(event: FlareBuybackEvent): void {
  let entity = new FlareBuyback(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlareExecution(event: FlareExecutionEvent): void {
  let entity = new FlareExecution(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.buybackAmount = event.params.buybackAmount
  entity.programAmount = event.params.programAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGelatoFeesCheck(event: GelatoFeesCheckEvent): void {
  let entity = new GelatoFeesCheck(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.fees = event.params.fees
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGelatoTaskCancelFailed(
  event: GelatoTaskCancelFailedEvent
): void {
  let entity = new GelatoTaskCancelFailed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGelatoTaskCanceled(event: GelatoTaskCanceledEvent): void {
  let entity = new GelatoTaskCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGelatoTaskCreated(event: GelatoTaskCreatedEvent): void {
  let entity = new GelatoTaskCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSnatchAuction(event: SnatchAuctionEvent): void {
  let entity = new SnatchAuction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.poolToSteal = event.params.poolToSteal
  entity.auctionAmount = event.params.auctionAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSnatchExecution(event: SnatchExecutionEvent): void {
  let entity = new SnatchExecution(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.poolToSteal = event.params.poolToSteal

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSnatchSteal(event: SnatchStealEvent): void {
  let entity = new SnatchSteal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.rewardsPool = event.params.rewardsPool
  entity.rewardsToken = event.params.rewardsToken
  entity.rewardsAmount = event.params.rewardsAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwapToWrappedToken(event: SwapToWrappedTokenEvent): void {
  let entity = new SwapToWrappedToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.swapToWrappedToken = event.params.swapToWrappedToken

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwapTypeChanged(event: SwapTypeChangedEvent): void {
  let entity = new SwapTypeChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSyncFeesManagement(event: SyncFeesManagementEvent): void {
  let entity = new SyncFeesManagement(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSyncFeesStarted(event: SyncFeesStartedEvent): void {
  let entity = new SyncFeesStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensBurned(event: TokensBurnedEvent): void {
  let entity = new TokensBurned(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdrawnNative(event: WithdrawnNativeEvent): void {
  let entity = new WithdrawnNative(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdrawnToken(event: WithdrawnTokenEvent): void {
  let entity = new WithdrawnToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
