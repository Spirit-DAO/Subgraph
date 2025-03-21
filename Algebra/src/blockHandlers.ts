import { ethereum, BigInt, store, Entity, Value, Bytes, Address, BigDecimal } from '@graphprotocol/graph-ts'
import { ActivePositions, Position, PositionSnapshot, Token, Bundle, Pool } from './types/schema'
import { ONE_BI, ZERO_BD, ZERO_BI } from './utils/constants'
import { convertTokenToDecimal } from './utils'


function getSqrtRatioAtTick(tick: BigInt): BigInt {
  // Check tick bounds
  const minTick = BigInt.fromI32(-887272)
  const maxTick = BigInt.fromI32(887272)
  
  if (tick.lt(minTick) || tick.gt(maxTick)) {
    return ZERO_BI
  }

  const absTick = tick.lt(BigInt.zero()) ? tick.neg() : tick
  let ratio = (absTick.bitAnd(BigInt.fromI32(0x1))).notEqual(ZERO_BI)
    ? BigInt.fromString('0xfffcb933bd6fad37aa2d162d1a594001')
    : BigInt.fromString('0x100000000000000000000000000000000')

  if (!absTick.bitAnd(BigInt.fromI32(0x2)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xfff97272373d413259a46990580e213a')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x4)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xfff2e50f5f656932ef12357cf3c7fdcc')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x8)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xffe5caca7e10e4e61c3624eaa0941cd0')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x10)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xffcb9843d60f6159c9db58835c926644')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x20)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xff973b41fa98c081472e6896dfb254c0')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x40)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xff2ea16466c96a3843ec78b326b52861')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x80)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xfe5dee046a99a2a811c461f1969c3053')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x100)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xfcbe86c7900a88aedcffc83b479aa3a4')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x200)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xf987a7253ac413176f2b074cf7815e54')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x400)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xf3392b0822b70005940c7a398e4b70f3')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x800)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xe7159475a2c29b7443b29c7fa6e889d9')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x1000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xd097f3bdfd2022b8845ad8f792aa5825')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x2000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0xa9f746462d870fdf8a65dc1f90e061e5')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x4000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x70d869a156d2a1b890bb3df62baf32f7')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x8000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x31be135f97d08fd981231505542fcfa6')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x10000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x9aa508b5b7a84e1c677de54f3e99bc9')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x20000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x5d6af8dedb81196699c329225ee604')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x40000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x2216e584f5fa1ea926041bedfe98')).rightShift(128)
  if (!absTick.bitAnd(BigInt.fromI32(0x80000)).equals(ZERO_BI))
    ratio = ratio.times(BigInt.fromString('0x48a170391f7dc42444e8fa2')).rightShift(128)

  if (tick.gt(BigInt.zero())) {
    ratio = BigInt.fromString('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').div(ratio)
  }

  // Convert to Q96
  const Q32 = BigInt.fromI32(2).pow(32)
  return ratio.mod(Q32).gt(ZERO_BI) ? ratio.div(Q32).plus(ONE_BI) : ratio.div(Q32)
}

// Define classes with constructors
class TickBoundaries {
  sqrtPriceLowerX96: BigInt
  sqrtPriceUpperX96: BigInt

  constructor() {
    this.sqrtPriceLowerX96 = BigInt.zero()
    this.sqrtPriceUpperX96 = BigInt.zero()
  }
}

class LiquidityAmounts {
  amount0: BigInt
  amount1: BigInt

  constructor() {
    this.amount0 = BigInt.zero()
    this.amount1 = BigInt.zero()
  }
}

function getAmount0Delta(sqrtRatioAX96: BigInt, sqrtRatioBX96: BigInt, liquidity: BigInt, roundUp: boolean): BigInt {
  if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
    let temp = sqrtRatioAX96
    sqrtRatioAX96 = sqrtRatioBX96
    sqrtRatioBX96 = temp
  }

  const TWO_96 = BigInt.fromI32(2).pow(96)
  const numerator1 = liquidity.times(TWO_96)
  const numerator2 = sqrtRatioBX96.minus(sqrtRatioAX96)
  const numerator = numerator1.times(numerator2)
  const denominator = sqrtRatioBX96.times(sqrtRatioAX96)

  let amount = numerator.div(denominator)
  if (roundUp && numerator.mod(denominator).gt(ZERO_BI)) {
    amount = amount.plus(ONE_BI)
  }

  return amount
}

function getAmount1Delta(sqrtRatioAX96: BigInt, sqrtRatioBX96: BigInt, liquidity: BigInt, roundUp: boolean): BigInt {
  if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
    let temp = sqrtRatioAX96
    sqrtRatioAX96 = sqrtRatioBX96
    sqrtRatioBX96 = temp
  }

  const TWO_96 = BigInt.fromI32(2).pow(96)
  const numerator = liquidity.times(sqrtRatioBX96.minus(sqrtRatioAX96))
  let amount = numerator.div(TWO_96)
  
  if (roundUp && numerator.mod(TWO_96).gt(ZERO_BI)) {
    amount = amount.plus(ONE_BI)
  }

  return amount
}

function calculateLiquidityAmounts(
  liquidity: BigInt,
  sqrtPriceX96: BigInt,
  tickLower: BigInt,
  tickUpper: BigInt
): LiquidityAmounts {
  let amounts = new LiquidityAmounts()
  
  const sqrtRatioLowerX96 = getSqrtRatioAtTick(tickLower)
  const sqrtRatioUpperX96 = getSqrtRatioAtTick(tickUpper)

  if (sqrtRatioLowerX96.equals(ZERO_BI) || sqrtRatioUpperX96.equals(ZERO_BI)) {
    return amounts
  }

  if (sqrtPriceX96.lt(sqrtRatioLowerX96)) {
    // Current price is below the position
    amounts.amount0 = getAmount0Delta(
      sqrtRatioLowerX96,
      sqrtRatioUpperX96,
      liquidity,
      true
    )
    amounts.amount1 = ZERO_BI
  } else if (sqrtPriceX96.lt(sqrtRatioUpperX96)) {
    // Current price is within the position
    amounts.amount0 = getAmount0Delta(
      sqrtPriceX96,
      sqrtRatioUpperX96,
      liquidity,
      true
    )
    amounts.amount1 = getAmount1Delta(
      sqrtRatioLowerX96,
      sqrtPriceX96,
      liquidity,
      true
    )
  } else {
    // Current price is above the position
    amounts.amount0 = ZERO_BI
    amounts.amount1 = getAmount1Delta(
      sqrtRatioLowerX96,
      sqrtRatioUpperX96,
      liquidity,
      true
    )
  }

  return amounts
}

/**
 * Block handler that processes each block
 * Used for automatically updating position day data without requiring user interaction
 */
export function handleBlock(block: ethereum.Block): void {
  // Check if we're at the end of a day
  let timestamp = block.timestamp.toI32()
  let isEndOfDay = timestamp % 86400 >= 86350 // Within ~1 minute of day end
  
  // Check if Bundle exists - it's required for price calculations
  let bundle = Bundle.load('1')
  if (bundle === null) {
	// Bundle doesn't exist yet, can't calculate USD values
	return
  }

  if (isEndOfDay) {
	let activePositions = ActivePositions.load('all')
	if (activePositions !== null) {
	  let positions = activePositions.positions
	  
	  for (let i = 0; i < positions.length; i++) {
		let position = Position.load(positions[i])
		if (position !== null) {
		  // We'll implement the day data logic directly here
		  let dayID = timestamp / 86400
		  let dayStartTimestamp = dayID * 86400
		  let positionDayDataID = position.id
			.toString()
			.concat('-')
			.concat(dayID.toString())
		  
		  // Use the Entity API to create/update position day data
		  let entity = new PositionSnapshot(positionDayDataID)
		  entity.timestamp = block.timestamp
		  entity.position = position.id
		  entity.owner = position.owner
		  entity.pool = position.pool
		  entity.liquidity = position.liquidity
      entity.blockNumber = block.number
      entity.timestamp = block.timestamp
		  entity.depositedToken0 = position.depositedToken0
		  entity.depositedToken1 = position.depositedToken1
		  entity.withdrawnToken0 = position.withdrawnToken0
		  entity.withdrawnToken1 = position.withdrawnToken1
		  entity.collectedFeesToken0 = position.collectedFeesToken0
		  entity.collectedFeesToken1 = position.collectedFeesToken1
		  entity.feeGrowthInside0LastX128 = position.feeGrowthInside0LastX128
		  entity.feeGrowthInside1LastX128 = position.feeGrowthInside1LastX128
		  entity.liquidityToken0 = ZERO_BD
		  entity.liquidityToken1 = ZERO_BD
		  entity.liquidityUsdToken0 = ZERO_BD
			entity.liquidityUsdToken1 = ZERO_BD
			
			let pool = Pool.load(position.pool)!
			let bundle = Bundle.load('1')!
				
			const tickLowerLst = position.tickLower.split('#')
			const tickLower = BigInt.fromString(tickLowerLst[tickLowerLst.length - 1])
			const tickUpperLst = position.tickUpper.split('#')
			const tickUpper = BigInt.fromString(tickUpperLst[tickUpperLst.length - 1])
				
			let amounts = calculateLiquidityAmounts(
				position.liquidity, 
				pool.sqrtPrice, 
				tickLower, 
				tickUpper
			)
			let amount0 = amounts.amount0
			let amount1 = amounts.amount1

			let token0 = Token.load(pool.token0)!
			let token1 = Token.load(pool.token1)!

			let ethPrice = bundle.maticPriceUSD

			entity.liquidityToken0 = convertTokenToDecimal(amount0, token0.decimals)
			entity.liquidityToken1 = convertTokenToDecimal(amount1, token1.decimals)
			entity.currentTick = pool.tick

			let amount0Matic = entity.liquidityToken0.times(token0.derivedMatic)
			let amount1Matic = entity.liquidityToken1.times(token1.derivedMatic)

			let amount0USD = amount0Matic.times(ethPrice)
			let amount1USD = amount1Matic.times(ethPrice)

			entity.liquidityUsdToken0 = amount0USD
			entity.liquidityUsdToken1 = amount1USD

			entity.save()
		}
	  }
	}
  }
} 