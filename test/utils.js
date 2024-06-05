import { expect } from 'vitest'
import { filter } from 'lodash/fp'

export const objectWithTimestamps = {
  created_at: expect.any(Date),
  updated_at: expect.any(Date)
}

export const filterNotNull = filter(it => !!it)
