import { Static, Record, Number } from 'runtypes'

export const CoordsRecord = Record({
  latitude: Number,
  longitude: Number,
  latitudeDiff: Number,
  longitudeDiff: Number,
}).asReadonly()

export type Coords = Static<typeof CoordsRecord>
