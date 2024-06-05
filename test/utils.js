import { expect } from 'vitest'
import { filter, map } from 'lodash/fp'

export const mapAttrs = map('attributes')

export const objectWithTimestamps = {
  created_at: expect.any(Date),
  updated_at: expect.any(Date)
}

export const filterNotNull = filter(it => !!it)
