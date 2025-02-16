const ethers = require('ethers');
const { BigNumber } = ethers;

function getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp) {
    if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
        [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    const Q96 = BigNumber.from(2).pow(96);
    const numerator = liquidity.mul(sqrtRatioBX96.sub(sqrtRatioAX96)).mul(Q96);
    const denominator = sqrtRatioBX96.mul(sqrtRatioAX96);

    let amount = numerator.div(denominator);
    if (roundUp && numerator.mod(denominator).gt(0)) {
        amount = amount.add(1);
    }

    return amount;
}

function getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp) {
    if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
        [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }

    const Q96 = BigNumber.from(2).pow(96);
    let amount = liquidity.mul(sqrtRatioBX96.sub(sqrtRatioAX96)).div(Q96);
    if (roundUp && liquidity.mul(sqrtRatioBX96.sub(sqrtRatioAX96)).mod(Q96).gt(0)) {
        amount = amount.add(1);
    }

    return amount;
}

function getMintAmounts(
    currentTick,
    tickLower,
    tickUpper,
    liquidity,
    sqrtPriceX96
) {
    const sqrtRatioLowerX96 = getSqrtPriceFromTick(tickLower);
	const sqrtRatioUpperX96 = getSqrtPriceFromTick(tickUpper);
	
	console.log("sqrtRatioLowerX96", sqrtRatioLowerX96.toString());
	console.log("sqrtRatioUpperX96", sqrtRatioUpperX96.toString());

    let amount0, amount1;


    if (currentTick < tickLower) {
        // Current price is below the position
        amount0 = getAmount0Delta(
            sqrtRatioLowerX96,
            sqrtRatioUpperX96,
            liquidity,
            true
        );
        amount1 = BigNumber.from(0);
    } else if (currentTick < tickUpper) {
        // Current price is within the position
        amount0 = getAmount0Delta(
            sqrtPriceX96,
            sqrtRatioUpperX96,
            liquidity,
            true
        );
        amount1 = getAmount1Delta(
            sqrtRatioLowerX96,
            sqrtPriceX96,
            liquidity,
            true
        );
    } else {
        // Current price is above the position
        amount0 = BigNumber.from(0);
        amount1 = getAmount1Delta(
            sqrtRatioLowerX96,
            sqrtRatioUpperX96,
            liquidity,
            true
        );
    }

    // Convert to ETH units (divide by 1e18)
    

    return { amount0, amount1 };
}

function mulShift(val, mulBy) {
    return val.mul(mulBy).shr(128);
}

function getSqrtPriceFromTick(tick) {
    const minTick = -887272;
    const maxTick = -minTick;
    
    if (tick < minTick || tick > maxTick || !Number.isInteger(tick)) {
        throw new Error('TICK');
    }

    const absTick = Math.abs(tick);

    let ratio = (absTick & 0x1) !== 0
        ? BigNumber.from('0xfffcb933bd6fad37aa2d162d1a594001')
        : BigNumber.from('0x100000000000000000000000000000000');

    if ((absTick & 0x2) !== 0) ratio = mulShift(ratio, BigNumber.from('0xfff97272373d413259a46990580e213a'));
    if ((absTick & 0x4) !== 0) ratio = mulShift(ratio, BigNumber.from('0xfff2e50f5f656932ef12357cf3c7fdcc'));
    if ((absTick & 0x8) !== 0) ratio = mulShift(ratio, BigNumber.from('0xffe5caca7e10e4e61c3624eaa0941cd0'));
    if ((absTick & 0x10) !== 0) ratio = mulShift(ratio, BigNumber.from('0xffcb9843d60f6159c9db58835c926644'));
    if ((absTick & 0x20) !== 0) ratio = mulShift(ratio, BigNumber.from('0xff973b41fa98c081472e6896dfb254c0'));
    if ((absTick & 0x40) !== 0) ratio = mulShift(ratio, BigNumber.from('0xff2ea16466c96a3843ec78b326b52861'));
    if ((absTick & 0x80) !== 0) ratio = mulShift(ratio, BigNumber.from('0xfe5dee046a99a2a811c461f1969c3053'));
    if ((absTick & 0x100) !== 0) ratio = mulShift(ratio, BigNumber.from('0xfcbe86c7900a88aedcffc83b479aa3a4'));
    if ((absTick & 0x200) !== 0) ratio = mulShift(ratio, BigNumber.from('0xf987a7253ac413176f2b074cf7815e54'));
    if ((absTick & 0x400) !== 0) ratio = mulShift(ratio, BigNumber.from('0xf3392b0822b70005940c7a398e4b70f3'));
    if ((absTick & 0x800) !== 0) ratio = mulShift(ratio, BigNumber.from('0xe7159475a2c29b7443b29c7fa6e889d9'));
    if ((absTick & 0x1000) !== 0) ratio = mulShift(ratio, BigNumber.from('0xd097f3bdfd2022b8845ad8f792aa5825'));
    if ((absTick & 0x2000) !== 0) ratio = mulShift(ratio, BigNumber.from('0xa9f746462d870fdf8a65dc1f90e061e5'));
    if ((absTick & 0x4000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x70d869a156d2a1b890bb3df62baf32f7'));
    if ((absTick & 0x8000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x31be135f97d08fd981231505542fcfa6'));
    if ((absTick & 0x10000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x9aa508b5b7a84e1c677de54f3e99bc9'));
    if ((absTick & 0x20000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x5d6af8dedb81196699c329225ee604'));
    if ((absTick & 0x40000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x2216e584f5fa1ea926041bedfe98'));
    if ((absTick & 0x80000) !== 0) ratio = mulShift(ratio, BigNumber.from('0x48a170391f7dc42444e8fa2'));

    if (tick > 0) {
        ratio = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').div(ratio);
    }

    // back to Q96
    const Q32 = BigNumber.from(2).pow(32);
    return ratio.mod(Q32).gt(0) ? ratio.div(Q32).add(1) : ratio.div(Q32);
}

// Example usage:
const currentTick = 32137;
const lowerTick = -887220;
const upperTick = 887220;
const liquidity = BigNumber.from("248986198453811426151");
const currentSqrtPriceX96 = BigNumber.from("395090501501757608929212989131");

const { amount0, amount1 } = getMintAmounts(
    currentTick,
    lowerTick,
    upperTick,
    liquidity,
    currentSqrtPriceX96
);

console.log("Position Details:");
console.log("Current Tick:", currentTick);
console.log("Lower Tick:", lowerTick);
console.log("Upper Tick:", upperTick);
console.log("Token0 Amount (ETH):", amount0.toString());
console.log("Token1 Amount (ETH):", amount1.toString()); 