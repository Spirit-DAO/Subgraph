import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { EditedFees } from "../generated/schema"
import { EditedFees as EditedFeesEvent } from "../generated/SilverFees/SilverFees"
import { handleEditedFees } from "../src/silver-fees"
import { createEditedFeesEvent } from "./silver-fees-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let teamFees = BigInt.fromI32(234)
    let weeklyGiveawayFees = BigInt.fromI32(234)
    let buybackFees = BigInt.fromI32(234)
    let newEditedFeesEvent = createEditedFeesEvent(
      teamFees,
      weeklyGiveawayFees,
      buybackFees
    )
    handleEditedFees(newEditedFeesEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("EditedFees created and stored", () => {
    assert.entityCount("EditedFees", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "EditedFees",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "teamFees",
      "234"
    )
    assert.fieldEquals(
      "EditedFees",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "weeklyGiveawayFees",
      "234"
    )
    assert.fieldEquals(
      "EditedFees",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "buybackFees",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
