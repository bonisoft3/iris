import { describe, expect, it } from 'vitest'
import Rectangle from './rectangle'
import { computeGIoU } from './giou'

describe('generalized Intersection over Union', async () => {
  it('zero rectangles', () => {
    const a = new Rectangle()
    const b = new Rectangle()
    const giou = computeGIoU(a, b)
    expect(giou).toBe(Number.NaN)
  })
  it('identical rectangles', () => {
    const a = new Rectangle(0, 0, 1, 1)
    const b = new Rectangle(0, 0, 1, 1)
    const giou = computeGIoU(a, b)
    expect(giou).toBe(1)
  })
})
