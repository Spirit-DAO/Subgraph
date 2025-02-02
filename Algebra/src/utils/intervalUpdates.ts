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
  Tick
} from './../types/schema'
import { FACTORY_ADDRESS } from './constants'
import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal } from '.';
import { getEthPriceInUSD } from './pricing';

// Add the LiquidityAmounts class definition
class LiquidityAmounts {
  amount0: BigInt
  amount1: BigInt

  constructor() {
    this.amount0 = BigInt.zero()
    this.amount1 = BigInt.zero()
  }
}

function calculateTotalLiquidityAmounts(liquidity: BigInt, sqrtPriceX96: BigInt): LiquidityAmounts {
    let amounts = new LiquidityAmounts()
    
    // Define global min/max price bounds for the whole pool
    const sqrtPriceLowerX96 = BigInt.zero()
    const sqrtPriceUpperX96 = BigInt.fromString("6277101735386680763835789423207666416102355444464034512896")
    const TWO_96 = BigInt.fromI32(2).pow(96)

    if (sqrtPriceX96.le(sqrtPriceLowerX96)) {
        amounts.amount0 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceLowerX96)).div(TWO_96)
        // amounts.amount1 stays zero
    } else if (sqrtPriceX96.ge(sqrtPriceUpperX96)) {
        // amounts.amount0 stays zero
        amounts.amount1 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceLowerX96)).div(TWO_96)
    } else {
        amounts.amount0 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceX96)).div(TWO_96)
        amounts.amount1 = liquidity.times(sqrtPriceX96.minus(sqrtPriceLowerX96)).div(TWO_96)
    }

    return amounts
}

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
    poolDayData.pool = pool.id
    // things that dont get initialized always
    poolDayData.volumeToken0 = ZERO_BD
    poolDayData.volumeToken1 = ZERO_BD
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

  let amounts = calculateTotalLiquidityAmounts(pool.liquidity, pool.sqrtPrice)
  let amount0 = amounts.amount0
  let amount1 = amounts.amount1

  let token0 = Token.load(pool.token0)!
  let token1 = Token.load(pool.token1)!

  let ethPrice = getEthPriceInUSD()

  poolDayData.liquidity = pool.liquidity
  poolDayData.liquidityToken0 = convertTokenToDecimal(amount0, token0.decimals)
  poolDayData.liquidityToken1 = convertTokenToDecimal(amount1, token1.decimals)

  let amount0Matic = poolDayData.liquidityToken0.times(token0.derivedMatic)
  let amount1Matic = poolDayData.liquidityToken1.times(token1.derivedMatic)

  let amount0USD = amount0Matic.times(ethPrice)
  let amount1USD = amount1Matic.times(ethPrice)

  poolDayData.liquidityUsdToken0 = amount0USD
  poolDayData.liquidityUsdToken1 = amount1USD

  poolDayData.sqrtPrice = pool.sqrtPrice
  poolDayData.token0Price = pool.token0Price
  poolDayData.token1Price = pool.token1Price
  poolDayData.tick = pool.tick
  poolDayData.tvlUSD = pool.totalValueLockedUSD
  poolDayData.tvlToken0 = pool.totalValueLockedToken0
  poolDayData.tvlToken1 = pool.totalValueLockedToken1
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
    FeeHourDataEntity.fee += Fee
    FeeHourDataEntity.changesCount += ONE_BI
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
	
  let amounts = calculateTotalLiquidityAmounts(pool.liquidity, pool.sqrtPrice)
  let amount0 = amounts.amount0
  let amount1 = amounts.amount1

  let token0 = Token.load(pool.token0)!
  let token1 = Token.load(pool.token1)!
	
  let ethPrice = getEthPriceInUSD()
	
  poolHourData.liquidity = pool.liquidity
  poolHourData.liquidityToken0 = convertTokenToDecimal(amount0, token0.decimals)
  poolHourData.liquidityToken1 = convertTokenToDecimal(amount1, token1.decimals)

  let amount0Matic = poolHourData.liquidityToken0.times(token0.derivedMatic)
  let amount1Matic = poolHourData.liquidityToken1.times(token1.derivedMatic)
  
  let amount0USD = amount0Matic.times(ethPrice)
  let amount1USD = amount1Matic.times(ethPrice)
	
  poolHourData.liquidityUsdToken0 = amount0USD
  poolHourData.liquidityUsdToken1 = amount1USD
	
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
