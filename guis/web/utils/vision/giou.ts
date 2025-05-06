import type Rectangle from './rectangle'

// Implementation of Generalized Intersectin Over Union (https://giou.stanford.edu/)
// given by chatgpt. Implementation comments by chatgpt.
function computeGIoU(rect1: Rectangle, rect2: Rectangle): number {
  // This function takes two DOMRect objects as input and returns the GIoU as
  // a number between - 1 and 1. The function first computes the coordinates of the
  // four corners of each rectangle, then computes the coordinates of the
  // intersection rectangle(if any) and its area, as well as the area of the union
  // rectangle.It then computes the coordinates of the enclosing rectangle that
  // contains both input rectangles, and its area. Finally, it computes the IoU as
  // the ratio of the intersection area to the union area, and the GIoU as the IoU
  // minus the term that penalizes the difference between the union area and the
  // enclosing area.

  // Note that the GIoU is a more generalized metric than the IoU, as it takes
  // into account the size and position of the enclosing rectangle, and can be
  // negative if the input rectangles do not overlap at all.
  const x1 = rect1.x
  const y1 = rect1.y
  const x2 = rect1.x + rect1.width
  const y2 = rect1.y + rect1.height

  const x3 = rect2.x
  const y3 = rect2.y
  const x4 = rect2.x + rect2.width
  const y4 = rect2.y + rect2.height

  const intersectionX1 = Math.max(x1, x3)
  const intersectionY1 = Math.max(y1, y3)
  const intersectionX2 = Math.min(x2, x4)
  const intersectionY2 = Math.min(y2, y4)

  const intersectionArea = Math.max(intersectionX2 - intersectionX1, 0)
    * Math.max(intersectionY2 - intersectionY1, 0)

  const unionArea = rect1.width * rect1.height + rect2.width * rect2.height - intersectionArea

  const enclosingX1 = Math.min(x1, x3)
  const enclosingY1 = Math.min(y1, y3)
  const enclosingX2 = Math.max(x2, x4)
  const enclosingY2 = Math.max(y2, y4)

  const enclosingArea = (enclosingX2 - enclosingX1) * (enclosingY2 - enclosingY1)

  const iou = intersectionArea / unionArea
  const giou = iou - ((enclosingArea - unionArea) / enclosingArea)

  return giou
}

export { computeGIoU }
