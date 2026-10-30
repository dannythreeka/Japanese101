import type {Page} from '@playwright/test'
export interface UsabilityFixture {
  schema:'japanese101-p3-fixture-v1'
  mode:'ENGINEERING_REHEARSAL'
  participantCode:string
  gradeBand:1|2|3
  origin:string
  unitId:'U01'
  profileId:'player'
  openingCoins:40
  coinSource:'SYNTHETIC_FIXTURE_OPENING_BALANCE_NOT_EARNED'
  learningAttemptsSeeded:0
  teachingCardsSeeded:0
  humanConsent:'NOT_RUN'
  humanTrial:'NOT_RUN'
  createdAt:string
}
export function prepareFixture(page:Page,input:{origin:string;code:string}):Promise<UsabilityFixture>
