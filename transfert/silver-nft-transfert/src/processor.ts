import { Counter } from '@sentio/sdk'
import { ERC721Processor } from '@sentio/sdk/eth/builtin'
import { Transfer } from './schema/store.js'
import { EthChainId } from '@sentio/sdk/eth'

const address = '0x5084E9fDF9264489A14E77c011073D757e572bB4'

ERC721Processor.bind({ address, network: EthChainId.SONIC_MAINNET }).onEventTransfer(async (event, ctx) => {
	const from = event.args.from
	const to = event.args.to
	const tokenId = event.args.tokenId

	const logIndex = event.transactionIndex
	const blockNumber = event.blockNumber
	const transactionHash = event.transactionHash

	const transfer = new Transfer({
		id: `${from}-${to}-${tokenId}`,
		from: from,
		to: to,
		tokenId: tokenId,
		log_index: BigInt(logIndex),
		block_number: BigInt(blockNumber),
		transaction_hash: transactionHash,
		timestamp: BigInt((ctx.timestamp.getTime() / 1000).toFixed(0))
	})

	await ctx.store.upsert(transfer)
})
