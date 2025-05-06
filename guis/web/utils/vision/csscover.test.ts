import { describe, expect, it } from 'vitest'
import Rectangle from './rectangle'
import { rescaleCoverCoordinates } from './csscover'

describe('generalized Intersection over Union', async () => {
  it('zero rectangles', () => {
    const r = rescaleCoverCoordinates(new Rectangle(), new Rectangle(), new Rectangle())
    expect(r).toEqual(new Rectangle())
  })
  it('desktop camera', () => {
    const webcamDimensions = new Rectangle(0, 0, 1920, 1080)
    const screenDimensions = new Rectangle(0, 0, 1140, 1186)
    const coordinatesInWebCam = new Rectangle(
      719.8405838012695,
      504.45817708969116,
      745.8368682861328,
      602.5756573677063,
    )
    const coordinatesInScreen = rescaleCoverCoordinates(coordinatesInWebCam, webcamDimensions, screenDimensions)
    expect(coordinatesInScreen.x).toBeCloseTo(258.74386743773164)
    expect(coordinatesInScreen.y).toBeCloseTo(553.9698129892349)
    expect(coordinatesInScreen.width).toBeCloseTo(819.039375729031)
    expect(coordinatesInScreen.height).toBeCloseTo(661.7173422574997)
  })
})
