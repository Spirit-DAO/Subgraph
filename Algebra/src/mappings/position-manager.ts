/* eslint-disable prefer-const */
import {
  Collect,
  IncreaseLiquidity,
  DecreaseLiquidity,
  NonfungiblePositionManager,
  Transfer
} from '../types/NonfungiblePositionManager/NonfungiblePositionManager'
import { Pool, Position, PositionSnapshot, Token} from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ZERO_BD, ZERO_BI, pools_list} from '../utils/constants'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
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
  const absTick = tick.lt(BigInt.zero()) ? tick.neg() : tick
  let ratio = (absTick.bitAnd(BigInt.fromI32(1))).equals(BigInt.zero())
    ? BigInt.fromString("79228162514264337593543950335")
    : BigInt.fromString("79228162514264337593543950336")

  if (!absTick.bitAnd(BigInt.fromI32(0x2)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79236085330515764027303304731")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x4)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79244008939048815603706035061")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x8)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79251933331272066969758029582")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x10)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79259858508743586581452568909")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x20)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79267784471576792882072434238")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x40)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79275711220608578541295342111")).rightShift(96)
  if (!absTick.bitAnd(BigInt.fromI32(0x80)).equals(BigInt.zero())) 
    ratio = ratio.times(BigInt.fromString("79283638756711037091108898807")).rightShift(96)

  if (tick.gt(BigInt.zero())) {
    ratio = BigInt.fromString("2").pow(192).div(ratio)
  }

  return ratio
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

function calculateLiquidityAmounts(
  liquidity: BigInt, 
  sqrtPriceX96: BigInt, 
  tickLower: BigInt, 
  tickUpper: BigInt
): LiquidityAmounts {
    let amounts = new LiquidityAmounts()
    // No need to initialize to zero since constructor does that
    
    const boundaries = calculateTickBoundaries(tickLower, tickUpper)
    const sqrtPriceLowerX96 = boundaries.sqrtPriceLowerX96
    const sqrtPriceUpperX96 = boundaries.sqrtPriceUpperX96
    const TWO_96 = BigInt.fromI32(2).pow(96)

    if (sqrtPriceX96.le(sqrtPriceLowerX96)) {
        // Current price is below range
        amounts.amount0 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceLowerX96)).div(TWO_96)
        // amounts.amount1 stays zero
    } else if (sqrtPriceX96.ge(sqrtPriceUpperX96)) {
        // Current price is above range
        // amounts.amount0 stays zero
        amounts.amount1 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceLowerX96)).div(TWO_96)
    } else {
        // Current price is within range
        amounts.amount0 = liquidity.times(sqrtPriceUpperX96.minus(sqrtPriceX96)).div(TWO_96)
        amounts.amount1 = liquidity.times(sqrtPriceX96.minus(sqrtPriceLowerX96)).div(TWO_96)
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

  let ethPrice = getEthPriceInUSD()

  positionSnapshot.liquidityToken0 = convertTokenToDecimal(amount0, token0.decimals)
  positionSnapshot.liquidityToken1 = convertTokenToDecimal(amount1, token1.decimals)
	
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

  position.depositedToken0USD = position.depositedToken0USD.plus(amount0.times(token0!.derivedMatic).times(getEthPriceInUSD()))
  position.depositedToken1USD = position.depositedToken1USD.plus(amount1.times(token1!.derivedMatic).times(getEthPriceInUSD()))

  // recalculatePosition(position)

  position.save()

  savePositionSnapshot(position, event)
  
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
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
  

  position.liquidity = position.liquidity.minus(event.params.liquidity)
  position.withdrawnToken0 = position.withdrawnToken0.plus(amount0)
  position.withdrawnToken1 = position.withdrawnToken1.plus(amount1)

  position.withdrawnToken0USD = position.withdrawnToken0USD.plus(amount0.times(token0!.derivedMatic).times(getEthPriceInUSD()))
  position.withdrawnToken1USD = position.withdrawnToken1USD.plus(amount1.times(token1!.derivedMatic).times(getEthPriceInUSD()))

  position = updateFeeVars(position, event, event.params.tokenId)
  // recalculatePosition(position)

  position.save()

  savePositionSnapshot(position, event)
}


export function handleCollect(event: Collect): void {
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
  

  position.collectedToken0 = position.collectedToken0.plus(amount0)
  position.collectedToken1 = position.collectedToken1.plus(amount1)

  position.collectedFeesToken0 = position.collectedToken0.minus(position.withdrawnToken0)
  position.collectedFeesToken1 = position.collectedToken1.minus(position.withdrawnToken1)

  position.collectedFeesToken0USD = position.collectedFeesToken0USD.plus(position.collectedToken0.times(token0!.derivedMatic).times(getEthPriceInUSD()))
  position.collectedFeesToken1USD = position.collectedFeesToken1USD.plus(position.collectedToken1.times(token1!.derivedMatic).times(getEthPriceInUSD()))

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

