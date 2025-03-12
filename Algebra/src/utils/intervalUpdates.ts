import { ZERO_BD, ZERO_BI, ONE_BI } from './constants'
/* eslint-disable prefer-const */
import {
  AlgebraDayData,
  Factory,
  Pool,
  PoolDayData,
  Token,
  TokenDayData,
  TokenHourData,
  Bundle,
  PoolHourData,
  TickDayData,
  FeeHourData,
  Tick,
  Position,
  ActivePositions
} from './../types/schema'
import { FACTORY_ADDRESS } from './constants'
import { ethereum, BigInt, store, Entity, Value, ValueKind, BigDecimal } from '@graphprotocol/graph-ts'
/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
export function updateAlgebraDayData(event: ethereum.Event): AlgebraDayData {
  let algebra = Factory.load(FACTORY_ADDRESS)!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // rounded
  let dayStartTimestamp = dayID * 86400
  let algebraDayData = AlgebraDayData.load(dayID.toString())
  if (algebraDayData === null) {
    algebraDayData = new AlgebraDayData(dayID.toString())
    algebraDayData.date = dayStartTimestamp
    algebraDayData.volumeMatic = ZERO_BD
    algebraDayData.volumeUSD = ZERO_BD
    algebraDayData.volumeUSDUntracked = ZERO_BD
    algebraDayData.feesUSD = ZERO_BD
	}
	
  algebraDayData.tvlUSD = algebra.totalValueLockedUSD
  algebraDayData.txCount = algebra.txCount
  algebraDayData.save()
  return algebraDayData as AlgebraDayData
}


export function updatePoolDayData(event: ethereum.Event): PoolDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let dayPoolID = event.address
    .toHexString()
    .concat('-')
    .concat(dayID.toString())
  let pool = Pool.load(event.address.toHexString())!
  let poolDayData = PoolDayData.load(dayPoolID)
  if (poolDayData === null) {
    poolDayData = new PoolDayData(dayPoolID)
    poolDayData.date = dayStartTimestamp
    poolDayData.blockNumber = event.block.number
    poolDayData.pool = pool.id
    // things that dont get initialized always
    poolDayData.volumeToken0 = ZERO_BD
	poolDayData.volumeToken1 = ZERO_BD
	poolDayData.volumeToken0USD = ZERO_BD
	poolDayData.volumeToken1USD = ZERO_BD
    poolDayData.feesToken0 = ZERO_BD
    poolDayData.feesToken1 = ZERO_BD
    poolDayData.volumeUSD = ZERO_BD
    poolDayData.untrackedVolumeUSD = ZERO_BD
    poolDayData.feesUSD = ZERO_BD
    poolDayData.feesCommunityUSD = ZERO_BD
    poolDayData.txCount = ZERO_BI
    poolDayData.feeGrowthGlobal0X128 = ZERO_BI
    poolDayData.feeGrowthGlobal1X128 = ZERO_BI
    poolDayData.open = pool.token0Price
    poolDayData.high = pool.token0Price
    poolDayData.low = pool.token0Price
	poolDayData.close = pool.token0Price
	poolDayData.fees0 = ZERO_BD
	poolDayData.fees1 = ZERO_BD
  }

  if (pool.token0Price.gt(poolDayData.high)) {
    poolDayData.high = pool.token0Price
  }
  if (pool.token0Price.lt(poolDayData.low)) {
    poolDayData.low = pool.token0Price
  }

  poolDayData.sqrtPrice = pool.sqrtPrice
  poolDayData.token0Price = pool.token0Price
  poolDayData.token1Price = pool.token1Price
  poolDayData.tick = pool.tick
  poolDayData.tvlUSD = pool.totalValueLockedUSD
  poolDayData.tvlToken0 = pool.totalValueLockedToken0
  poolDayData.tvlToken0USD = pool.totalValueLockedToken0USD
  poolDayData.tvlToken1 = pool.totalValueLockedToken1
  poolDayData.tvlToken1USD = pool.totalValueLockedToken1USD
  poolDayData.fee = pool.fee
  poolDayData.txCount = poolDayData.txCount.plus(ONE_BI)
  poolDayData.save()

  return poolDayData as PoolDayData
}

export function updateFeeHourData(event: ethereum.Event, Fee: BigInt): void{
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 
  let hourStartUnix = hourIndex * 3600
  let hourFeeID = event.address
    .toHexString()
    .concat('-')
    .concat(hourIndex.toString())
  let FeeHourDataEntity = FeeHourData.load(hourFeeID)
  if(FeeHourDataEntity){
    FeeHourDataEntity.timestamp = BigInt.fromI32(hourStartUnix)
    FeeHourDataEntity.fee = FeeHourDataEntity.fee.plus(Fee)
    FeeHourDataEntity.changesCount = FeeHourDataEntity.changesCount.plus(ONE_BI)
    if(FeeHourDataEntity.maxFee < Fee) FeeHourDataEntity.maxFee = Fee
    if(FeeHourDataEntity.minFee > Fee) FeeHourDataEntity.minFee = Fee  
    FeeHourDataEntity.endFee = Fee
  }
  else{
    FeeHourDataEntity = new FeeHourData(hourFeeID)
    FeeHourDataEntity.timestamp = BigInt.fromI32(hourStartUnix)
    FeeHourDataEntity.fee = Fee
    FeeHourDataEntity.changesCount = ONE_BI
    FeeHourDataEntity.pool = event.address.toHexString()
    if(Fee != ZERO_BI){
      FeeHourDataEntity.startFee = Fee
      FeeHourDataEntity.endFee = Fee
      FeeHourDataEntity.maxFee = Fee 
      FeeHourDataEntity.minFee = Fee 
    }

  }
  FeeHourDataEntity.save()
}



export function updatePoolHourData(event: ethereum.Event): PoolHourData {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let hourPoolID = event.address
    .toHexString()
    .concat('-')
    .concat(hourIndex.toString())
  let pool = Pool.load(event.address.toHexString())!
  let poolHourData = PoolHourData.load(hourPoolID)
  if (poolHourData === null) {
    poolHourData = new PoolHourData(hourPoolID)
    poolHourData.periodStartUnix = hourStartUnix
    poolHourData.fees0 = ZERO_BD
    poolHourData.fees1 = ZERO_BD
    poolHourData.pool = pool.id
    // things that dont get initialized always
    poolHourData.volumeToken0 = ZERO_BD
    poolHourData.volumeToken1 = ZERO_BD
    poolHourData.volumeUSD = ZERO_BD
    poolHourData.untrackedVolumeUSD = ZERO_BD
    poolHourData.txCount = ZERO_BI
    poolHourData.feesUSD = ZERO_BD
	poolHourData.feesCommunityUSD = ZERO_BD
    poolHourData.feeGrowthGlobal0X128 = ZERO_BI
    poolHourData.feeGrowthGlobal1X128 = ZERO_BI
    poolHourData.open = pool.token0Price
    poolHourData.high = pool.token0Price
    poolHourData.low = pool.token0Price
    poolHourData.close = pool.token0Price
  }

  if (pool.token0Price.gt(poolHourData.high)) {
    poolHourData.high = pool.token0Price
  }
  if (pool.token0Price.lt(poolHourData.low)) {
    poolHourData.low = pool.token0Price
  }

  poolHourData.sqrtPrice = pool.sqrtPrice
  poolHourData.token0Price = pool.token0Price
  poolHourData.token1Price = pool.token1Price

  poolHourData.feeGrowthGlobal0X128 = pool.feeGrowthGlobal0X128
  poolHourData.feeGrowthGlobal1X128 = pool.feeGrowthGlobal1X128
  poolHourData.close = pool.token0Price
  poolHourData.tick = pool.tick
  poolHourData.tvlUSD = pool.totalValueLockedUSD
  poolHourData.tvlToken0 = pool.totalValueLockedToken0
  poolHourData.tvlToken1 = pool.totalValueLockedToken1
  poolHourData.fee = pool.fee
  poolHourData.feesToken0 = pool.feesToken0
  poolHourData.feesToken1 = pool.feesToken1
	
  poolHourData.txCount = poolHourData.txCount.plus(ONE_BI)
  poolHourData.save()
  // test
  return poolHourData as PoolHourData


}

export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = token.id
    .toString()
    .concat('-')
    .concat(dayID.toString())
  let tokenPrice = token.derivedMatic.times(bundle.maticPriceUSD)

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = token.id
    tokenDayData.volume = ZERO_BD
    tokenDayData.volumeUSD = ZERO_BD
    tokenDayData.feesUSD = ZERO_BD
    tokenDayData.untrackedVolumeUSD = ZERO_BD
    tokenDayData.open = tokenPrice
    tokenDayData.high = tokenPrice
    tokenDayData.low = tokenPrice
    tokenDayData.close = tokenPrice
  }

  if (tokenPrice.gt(tokenDayData.high)) {
    tokenDayData.high = tokenPrice
  }

  if (tokenPrice.lt(tokenDayData.low)) {
    tokenDayData.low = tokenPrice
  }

  tokenDayData.close = tokenPrice
  tokenDayData.priceUSD = token.derivedMatic.times(bundle.maticPriceUSD)
  tokenDayData.totalValueLocked = token.totalValueLocked
  tokenDayData.totalValueLockedUSD = token.totalValueLockedUSD
  tokenDayData.save()

  return tokenDayData as TokenDayData
}


export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let tokenHourID = token.id
    .toString()
    .concat('-')
    .concat(hourIndex.toString())
  let tokenHourData = TokenHourData.load(tokenHourID)
  let tokenPrice = token.derivedMatic.times(bundle.maticPriceUSD)

  if (tokenHourData === null) {
    tokenHourData = new TokenHourData(tokenHourID)
    tokenHourData.periodStartUnix = hourStartUnix
    tokenHourData.token = token.id
    tokenHourData.volume = ZERO_BD
    tokenHourData.volumeUSD = ZERO_BD
    tokenHourData.untrackedVolumeUSD = ZERO_BD
    tokenHourData.feesUSD = ZERO_BD
    tokenHourData.open = tokenPrice
    tokenHourData.high = tokenPrice
    tokenHourData.low = tokenPrice
    tokenHourData.close = tokenPrice
  }

  if (tokenPrice.gt(tokenHourData.high)) {
    tokenHourData.high = tokenPrice
  }

  if (tokenPrice.lt(tokenHourData.low)) {
    tokenHourData.low = tokenPrice
  }

  tokenHourData.close = tokenPrice
  tokenHourData.priceUSD = tokenPrice
  tokenHourData.totalValueLocked = token.totalValueLocked
  tokenHourData.totalValueLockedUSD = token.totalValueLockedUSD
  tokenHourData.save()

  return tokenHourData as TokenHourData
}

export function updateTickDayData(tick: Tick, event: ethereum.Event): TickDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tickDayDataID = tick.id.concat('-').concat(dayID.toString())
  let tickDayData = TickDayData.load(tickDayDataID)
  if (tickDayData === null) {
    tickDayData = new TickDayData(tickDayDataID)
    tickDayData.date = dayStartTimestamp
    tickDayData.pool = tick.pool
    tickDayData.tick = tick.id
  }
  tickDayData.liquidityGross = tick.liquidityGross
  tickDayData.liquidityNet = tick.liquidityNet
  tickDayData.volumeToken0 = tick.volumeToken0
  tickDayData.volumeToken1 = tick.volumeToken0
  tickDayData.volumeUSD = tick.volumeUSD
  tickDayData.feesUSD = tick.feesUSD
  tickDayData.feeGrowthOutside0X128 = tick.feeGrowthOutside0X128
  tickDayData.feeGrowthOutside1X128 = tick.feeGrowthOutside1X128

  tickDayData.save()

  return tickDayData as TickDayData
}

/**
 * Adds a position to the active positions tracking entity
 */
export function trackPosition(positionId: string): void {
  let activePositions = ActivePositions.load('all')
  
  if (activePositions === null) {
    activePositions = new ActivePositions('all')
    activePositions.positions = []
    activePositions.count = ZERO_BI
  }
  
  let positions = activePositions.positions
  let found = false
  
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] == positionId) {
      found = true
      break
    }
  }
  
  if (!found) {
    positions.push(positionId)
    activePositions.positions = positions
    activePositions.count = BigInt.fromI32(positions.length)
    activePositions.save()
  }
}

/**
 * Removes a position from the active positions tracking entity
 */
export function untrackPosition(positionId: string): void {
  let activePositions = ActivePositions.load('all')
  
  if (activePositions !== null) {
    let positions = activePositions.positions
    let updatedPositions: string[] = []
    
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] != positionId) {
        updatedPositions.push(positions[i])
      }
    }
    
    activePositions.positions = updatedPositions
    activePositions.count = BigInt.fromI32(updatedPositions.length)
    activePositions.save()
  }
}

export function updatePositionDayData(position: Position, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let positionDayDataID = position.id
    .toString()
    .concat('-')
    .concat(dayID.toString())
  
  // Since PositionDayData type may not be available until we regenerate types,
  // we'll use the generic Entity API
  let entity = new Entity()
  entity.set('id', Value.fromString(positionDayDataID))
  entity.set('date', Value.fromI32(dayStartTimestamp))
  entity.set('position', Value.fromString(position.id))
  entity.set('owner', Value.fromBytes(position.owner))
  entity.set('pool', Value.fromString(position.pool))
  entity.set('token0', Value.fromString(position.token0))
  entity.set('token1', Value.fromString(position.token1))
  entity.set('tickLower', Value.fromString(position.tickLower))
  entity.set('tickUpper', Value.fromString(position.tickUpper))
  entity.set('liquidity', Value.fromBigInt(position.liquidity))
  entity.set('blockNumber', Value.fromBigInt(event.block.number))
  entity.set('depositedToken0', Value.fromBigDecimal(position.depositedToken0))
  entity.set('depositedToken1', Value.fromBigDecimal(position.depositedToken1))
  entity.set('depositedToken0USD', Value.fromBigDecimal(position.depositedToken0USD))
  entity.set('depositedToken1USD', Value.fromBigDecimal(position.depositedToken1USD))
  entity.set('withdrawnToken0', Value.fromBigDecimal(position.withdrawnToken0))
  entity.set('withdrawnToken1', Value.fromBigDecimal(position.withdrawnToken1))
  entity.set('withdrawnToken0USD', Value.fromBigDecimal(position.withdrawnToken0USD))
  entity.set('withdrawnToken1USD', Value.fromBigDecimal(position.withdrawnToken1USD))
  entity.set('collectedFeesToken0', Value.fromBigDecimal(position.collectedFeesToken0))
  entity.set('collectedFeesToken1', Value.fromBigDecimal(position.collectedFeesToken1))
  entity.set('collectedFeesToken0USD', Value.fromBigDecimal(position.collectedFeesToken0USD))
  entity.set('collectedFeesToken1USD', Value.fromBigDecimal(position.collectedFeesToken1USD))
  entity.set('feeGrowthInside0LastX128', Value.fromBigInt(position.feeGrowthInside0LastX128))
  entity.set('feeGrowthInside1LastX128', Value.fromBigInt(position.feeGrowthInside1LastX128))
  
  // Add token TVL values if they exist
  if (position.token0Tvl !== null) {
    entity.set('token0Tvl', Value.fromBigDecimal(position.token0Tvl as BigDecimal))
  }
  
  if (position.token1Tvl !== null) {
    entity.set('token1Tvl', Value.fromBigDecimal(position.token1Tvl as BigDecimal))
  }
  
  store.set('PositionDayData', positionDayDataID, entity)
}

/**
 * Update all positions for a given block - ensures that even if positions 
 * don't have user interactions, they will have updated day data
 */
export function updateAllPositionDayData(event: ethereum.Event): void {
  // Check if we're at the end of a day
  let timestamp = event.block.timestamp.toI32()
  let isEndOfDay = timestamp % 86400 >= 86350 // Within ~1 minute of day end
  
  if (isEndOfDay) {
    let activePositions = ActivePositions.load('all')
    if (activePositions !== null) {
      let positions = activePositions.positions
      
      for (let i = 0; i < positions.length; i++) {
        let position = Position.load(positions[i])
        if (position !== null) {
          updatePositionDayData(position, event)
        }
      }
    }
  }
}
