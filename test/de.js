const ethers = require('ethers');
const { BigNumber } = ethers;

function calculateTotalLiquidityAmounts(liquidity, sqrtPriceX96) {
    let amounts = {
        amount0: BigNumber.from(0),
        amount1: BigNumber.from(0)
    }

    // Define global min/max price bounds for the whole pool
    const sqrtPriceLowerX96 = BigNumber.from("4295128739") // 1.0001^(-887272)
    const sqrtPriceUpperX96 = BigNumber.from("1461446703485210103287273052203988822378723970342") // 1.0001^(887272)
    const Q96 = BigNumber.from(2).pow(96)

    // For token0: Δx = L * (1/sqrtP - 1/sqrtPu)
    // For token1: Δy = L * (sqrtP - sqrtPl)
    if (sqrtPriceX96.lte(sqrtPriceLowerX96)) {
        // All liquidity is in token0
        amounts.amount0 = liquidity.mul(Q96).div(sqrtPriceLowerX96)
            .sub(liquidity.mul(Q96).div(sqrtPriceUpperX96))
    } else if (sqrtPriceX96.gte(sqrtPriceUpperX96)) {
        // All liquidity is in token1
        amounts.amount1 = liquidity.mul(sqrtPriceUpperX96.sub(sqrtPriceLowerX96)).div(Q96)
    } else {
        // In range liquidity - both tokens exist
        amounts.amount0 = liquidity.mul(Q96).div(sqrtPriceX96)
            .sub(liquidity.mul(Q96).div(sqrtPriceUpperX96))
        amounts.amount1 = liquidity.mul(sqrtPriceX96.sub(sqrtPriceLowerX96)).div(Q96)
    }

    return {
        amount0: amounts.amount0.toString(),
        amount1: amounts.amount1.toString()
    }
}

// Example usage:
const liquidity = BigNumber.from("128164675902025008343123");
const sqrtPriceX96 = BigNumber.from("3630297820509568583424103459553");

const { amount0, amount1 } = calculateTotalLiquidityAmounts(liquidity, sqrtPriceX96);

console.log("Total Token0 in Pool (ETH):", amount0.toString());
console.log("Total Token1 in Pool (ETH):", amount1.toString());