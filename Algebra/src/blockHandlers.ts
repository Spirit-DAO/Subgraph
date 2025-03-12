import { ethereum, BigInt, store, Entity, Value, Bytes, Address, BigDecimal } from '@graphprotocol/graph-ts'
import { ActivePositions, Position, PositionSnapshot, Token, Bundle } from './types/schema'
import { ZERO_BD } from './utils/constants'

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
          let entity = new PositionSnapshot("auto")
          entity.id = positionDayDataID
          entity.position = position.id
          entity.owner = position.owner
          entity.pool = position.pool
          entity.liquidity = position.liquidity
          entity.blockNumber = block.number
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

          // Add token TVL values if they exist
          if (position.token0Tvl !== null) {
            let token0Tvl = position.token0Tvl as BigDecimal
            entity.liquidityToken0 = token0Tvl
          }
          
          if (position.token1Tvl !== null) {
            let token1Tvl = position.token1Tvl as BigDecimal
            entity.liquidityToken1 = token1Tvl
          }

          if (position.token0Tvl !== null) {
            const token = Token.load(position.token0)
            if (token !== null && token.derivedMatic !== null) {
              let token0Tvl = position.token0Tvl as BigDecimal
              entity.liquidityUsdToken0 = token0Tvl.times(token.derivedMatic).times(bundle.maticPriceUSD)
            }
          }

          if (position.token1Tvl !== null) {
            const token = Token.load(position.token1)
            if (token !== null && token.derivedMatic !== null) {
              let token1Tvl = position.token1Tvl as BigDecimal
              entity.liquidityUsdToken1 = token1Tvl.times(token.derivedMatic).times(bundle.maticPriceUSD)
            }
          }

			    entity.save()
        }
      }
    }
  }
} 