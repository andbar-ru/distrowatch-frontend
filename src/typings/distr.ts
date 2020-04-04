import { Static, Record, String as S, Number as N } from 'runtypes'

const PositiveIntNumber = N.withConstraint(n => (Number.isInteger(n) && n > 0) || `${n} is not positive integer`)
const DateString = S.withConstraint(s => !isNaN(new Date(s).valueOf()) || `${s} is not a date or invalid date`)

export const DistrRecord = Record({
  name: S,
  count: PositiveIntNumber,
  lastUpdate: DateString,
}).asReadonly()
type Distr = Static<typeof DistrRecord>

export class MyDistr {
  readonly name: string
  readonly count: number
  readonly lastUpdate: Date
  leader = false
  newest = false
  oldest = false

  constructor(distr: Distr) {
    this.name = distr.name
    this.count = distr.count
    this.lastUpdate = new Date(Date.parse(distr.lastUpdate))
  }

  /** Qualify this distrs as a leader. */
  setLeader(value: boolean) {
    this.leader = value
  }

  /** Get lastUpdate date as ISO string. */
  lastUpdateISO(): string {
    return this.lastUpdate.toISOString().split('T')[0]
  }
}
