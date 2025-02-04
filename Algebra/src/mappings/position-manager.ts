/* eslint-disable prefer-const */
import {
  Collect,
  IncreaseLiquidity,
  DecreaseLiquidity,
  NonfungiblePositionManager,
  Transfer
} from '../types/NonfungiblePositionManager/NonfungiblePositionManager'
import { Bundle, Pool, Position, PositionSnapshot, Token} from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ZERO_BD, ZERO_BI, pools_list, ONE_BI} from '../utils/constants'
import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal, loadTransaction } from '../utils'
import { getEthPriceInUSD } from '../utils/pricing'



function getPosition(event: ethereum.Event, tokenId: BigInt): Position | null {


  let position = Position.load(tokenId.toString())
  if (position === null) {
    let contract = NonfungiblePositionManager.bind(event.address)
    let positionCall = contract.try_positions(tokenId)

    // the following call reverts in situations where the position is minted
    // and deleted in the same block 
    const stringBoolean = `${positionCall.reverted}`;
    if (!positionCall.reverted) {
      let positionResult = positionCall.value
      let poolAddress = factoryContract.poolByPair(positionResult.value2, positionResult.value3)

      position = new Position(tokenId.toString())
      // The owner gets correctly updated in the Transfer handler
      position.owner = Address.fromString(ADDRESS_ZERO)
      position.pool = poolAddress.toHexString()
      if(pools_list.includes(position.pool)){
        position.token0 = positionResult.value3.toHexString()
        position.token1 = positionResult.value2.toHexString()
      }
      else{
        position.token0 = positionResult.value2.toHexString()
        position.token1 = positionResult.value3.toHexString()
      } 
      position.tickLower = position.pool.concat('#').concat(positionResult.value4.toString())
      position.tickUpper = position.pool.concat('#').concat(positionResult.value5.toString())
      position.liquidity = ZERO_BI
      position.depositedToken0 = ZERO_BD
      position.depositedToken1 = ZERO_BD
      position.depositedToken0USD = ZERO_BD
      position.depositedToken1USD = ZERO_BD
      position.withdrawnToken0 = ZERO_BD
      position.withdrawnToken1 = ZERO_BD
      position.withdrawnToken0USD = ZERO_BD
      position.withdrawnToken1USD = ZERO_BD
      position.collectedToken0 = ZERO_BD
      position.collectedToken1 = ZERO_BD
      position.collectedFeesToken0 = ZERO_BD
	  position.collectedFeesToken1 = ZERO_BD
	  position.collectedFeesToken0USD = ZERO_BD
	  position.collectedFeesToken1USD = ZERO_BD
      position.transaction = loadTransaction(event).id
      position.feeGrowthInside0LastX128 = positionResult.value7
      position.feeGrowthInside1LastX128 = positionResult.value8
    }
  }

  return position
  
  return null 
}


function updateFeeVars(position: Position, event: ethereum.Event, tokenId: BigInt): Position {

  let positionManagerContract = NonfungiblePositionManager.bind(event.address)
  let positionResult = positionManagerContract.try_positions(tokenId)
  if (!positionResult.reverted) {
    position.feeGrowthInside0LastX128 = positionResult.value.value7
    position.feeGrowthInside1LastX128 = positionResult.value.value8
  }
  return position
}

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

function calculateTickBoundaries(tickLower: BigInt, tickUpper: BigInt): TickBoundaries {
  const sqrtPriceLowerX96 = getSqrtRatioAtTick(tickLower)
  const sqrtPriceUpperX96 = getSqrtRatioAtTick(tickUpper)
  
  let boundaries = new TickBoundaries()
  boundaries.sqrtPriceLowerX96 = sqrtPriceLowerX96
  boundaries.sqrtPriceUpperX96 = sqrtPriceUpperX96
  return boundaries
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

  // Debug logging
  log.debug(
    'Calculating liquidity amounts: liquidity={}, sqrtPrice={}, tickLower={}, tickUpper={}, sqrtRatioLower={}, sqrtRatioUpper={}',
    [
      liquidity.toString(),
      sqrtPriceX96.toString(),
      tickLower.toString(),
      tickUpper.toString(),
      sqrtRatioLowerX96.toString(),
      sqrtRatioUpperX96.toString()
    ]
  )

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

function savePositionSnapshot(position: Position, event: ethereum.Event): void {
  let positionSnapshot = new PositionSnapshot(position.id.concat('#').concat(event.block.number.toString()))
  positionSnapshot.owner = position.owner
  positionSnapshot.pool = position.pool
  positionSnapshot.position = position.id
  positionSnapshot.blockNumber = event.block.number
  positionSnapshot.timestamp = event.block.timestamp
  positionSnapshot.liquidity = position.liquidity

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

  positionSnapshot.liquidityToken0 = convertTokenToDecimal(amount0, token0.decimals)
  positionSnapshot.liquidityToken1 = convertTokenToDecimal(amount1, token1.decimals)

  positionSnapshot.tickLower = getSqrtRatioAtTick(tickLower)
  positionSnapshot.tickUpper = getSqrtRatioAtTick(tickUpper)

  let amount0Matic = positionSnapshot.liquidityToken0.times(token0.derivedMatic)
  let amount1Matic = positionSnapshot.liquidityToken1.times(token1.derivedMatic)

  let amount0USD = amount0Matic.times(ethPrice)
  let amount1USD = amount1Matic.times(ethPrice)

  positionSnapshot.liquidityUsdToken0 = amount0USD
  positionSnapshot.liquidityUsdToken1 = amount1USD

  if(pools_list.includes(position.pool)){
    positionSnapshot.depositedToken0 = position.depositedToken1
    positionSnapshot.depositedToken1 = position.depositedToken0
    positionSnapshot.withdrawnToken0 = position.withdrawnToken1
    positionSnapshot.withdrawnToken1 = position.withdrawnToken0
    positionSnapshot.collectedFeesToken0 = position.collectedFeesToken1
	positionSnapshot.collectedFeesToken1 = position.collectedFeesToken0
    positionSnapshot.transaction = loadTransaction(event).id
    positionSnapshot.feeGrowthInside0LastX128 = position.feeGrowthInside1LastX128
    positionSnapshot.feeGrowthInside1LastX128 = position.feeGrowthInside0LastX128
  }
  else{
    positionSnapshot.depositedToken0 = position.depositedToken0
    positionSnapshot.depositedToken1 = position.depositedToken1
    positionSnapshot.withdrawnToken0 = position.withdrawnToken0
    positionSnapshot.withdrawnToken1 = position.withdrawnToken1
    positionSnapshot.collectedFeesToken0 = position.collectedFeesToken0
	positionSnapshot.collectedFeesToken1 = position.collectedFeesToken1
    positionSnapshot.transaction = loadTransaction(event).id
    positionSnapshot.feeGrowthInside0LastX128 = position.feeGrowthInside0LastX128
    positionSnapshot.feeGrowthInside1LastX128 = position.feeGrowthInside1LastX128
  }

  positionSnapshot.save()
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let bundle = Bundle.load('1')!
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)

  let amount1 = ZERO_BD
  let amount0 = ZERO_BD

    if(pools_list.includes(position.pool))
      amount0 = convertTokenToDecimal(event.params.amount1, token0!.decimals)
    else
      amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)

    if(pools_list.includes(position.pool))
      amount1 = convertTokenToDecimal(event.params.amount0, token1!.decimals)
    else
      amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)

  position.liquidity = position.liquidity.plus(event.params.liquidity)
  position.depositedToken0 = position.depositedToken0.plus(amount0)
  position.depositedToken1 = position.depositedToken1.plus(amount1)

  position.depositedToken0USD = position.depositedToken0USD.plus(amount0.times(token0!.derivedMatic).times(bundle.maticPriceUSD))
  position.depositedToken1USD = position.depositedToken1USD.plus(amount1.times(token1!.derivedMatic).times(bundle.maticPriceUSD))


  // recalculatePosition(position)

  position.save()

  savePositionSnapshot(position, event)
  
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let position = getPosition(event, event.params.tokenId)
  let bundle = Bundle.load('1')!

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)


  let amount1 = ZERO_BD
  let amount0 = ZERO_BD

    if(pools_list.includes(position.pool))
      amount0 = convertTokenToDecimal(event.params.amount1, token0!.decimals)
    else
      amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)
  

    if(pools_list.includes(position.pool))
      amount1 = convertTokenToDecimal(event.params.amount0, token1!.decimals)
    else
      amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)
  

  position.liquidity = position.liquidity.minus(event.params.liquidity)
  position.withdrawnToken0 = position.withdrawnToken0.plus(amount0)
  position.withdrawnToken1 = position.withdrawnToken1.plus(amount1)

  position.withdrawnToken0USD = position.withdrawnToken0USD.plus(amount0.times(token0!.derivedMatic).times(bundle.maticPriceUSD))
  position.withdrawnToken1USD = position.withdrawnToken1USD.plus(amount1.times(token1!.derivedMatic).times(bundle.maticPriceUSD))


  position = updateFeeVars(position, event, event.params.tokenId)
  // recalculatePosition(position)

  position.save()

  savePositionSnapshot(position, event)
}


export function handleCollect(event: Collect): void {
  let position = getPosition(event, event.params.tokenId)
  let bundle = Bundle.load('1')!

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)


  let amount1 = ZERO_BD
  let amount0 = ZERO_BD


    if(pools_list.includes(position.pool))
      amount0 = convertTokenToDecimal(event.params.amount1, token0!.decimals)
    else
      amount0 = convertTokenToDecimal(event.params.amount0, token0!.decimals)
  
  
    if(pools_list.includes(position.pool))
      amount1 = convertTokenToDecimal(event.params.amount0, token1!.decimals)
    else
      amount1 = convertTokenToDecimal(event.params.amount1, token1!.decimals)
  

  position.collectedToken0 = position.collectedToken0.plus(amount0)
  position.collectedToken1 = position.collectedToken1.plus(amount1)

  position.collectedFeesToken0 = position.collectedToken0.minus(position.withdrawnToken0)
  position.collectedFeesToken1 = position.collectedToken1.minus(position.withdrawnToken1)

  position.collectedFeesToken0USD = position.collectedFeesToken0USD.plus(position.collectedToken0.times(token0!.derivedMatic).times(bundle.maticPriceUSD))
  position.collectedFeesToken1USD = position.collectedFeesToken1USD.plus(position.collectedToken1.times(token1!.derivedMatic).times(bundle.maticPriceUSD))

  position = updateFeeVars(position, event, event.params.tokenId)

  // recalculatePosition(position)

  position.save()

  savePositionSnapshot(position, event)
}

export function handleTransfer(event: Transfer): void {
  
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.owner = event.params.to
  position.save()

  savePositionSnapshot(position, event)
}

