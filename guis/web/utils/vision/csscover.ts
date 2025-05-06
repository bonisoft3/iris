// Coordinate related operations for the "object: cover" css property.
import resizeToFit from 'intrinsic-scale'
import Rectangle from './rectangle'

/**
 * Compute coordinates in parent element for a rectangle in a child element with "object: cover" css property
 *
 * @param coordinates the coordinates relative to the dimensions given by child
 * @param child the dimensions of a child element rendered with "object: cover" css property
 * @param parent the dimensions of the parent element
 * @returns coordinates relative to the parent element
 */
function rescaleCoverCoordinates(
  coordinates: Rectangle,
  child: Rectangle,
  parent: Rectangle,
): Rectangle {
  const { width: scaledWidth, height: scaledHeight, x: cropX, y: cropY } = resizeToFit(
    'cover',
    { width: child.width, height: child.height },
    { width: parent.width, height: parent.height },
  )
  const scale = cropX ? child.height / scaledHeight : child.width / scaledWidth
  const rescaledCoordinates = new Rectangle(
    (coordinates.x + child.x + cropX) / scale,
    (coordinates.y + child.y + cropY) / scale,
    coordinates.width / scale,
    coordinates.height / scale,
  )
  // Drop NaN
  return new Rectangle(
    rescaledCoordinates.x || 0,
    rescaledCoordinates.y || 0,
    rescaledCoordinates.width || 0,
    rescaledCoordinates.height || 0,
  )
}

/**
 * Compute a crop mask to be applied in a child element coordinate set, extracting the contents show in the parent element,
 * assuming that the child element has been positioned with "object: cover" css property.
 *
 */
function cropToCover(child: Rectangle, parent: Rectangle): Rectangle {
  const { width: scaledWidth, height: scaledHeight, x: cropX, y: cropY } = resizeToFit(
    'cover',
    { width: child.width, height: child.height },
    { width: parent.width, height: parent.height },
  )
  const scale = cropX ? child.height / scaledHeight : child.width / scaledWidth
  const cropMask = new Rectangle(
    cropX * -1 * scale,
    cropY * -1 * scale,
    parent.width * scale,
    parent.height * scale,
  )
  // Drop NaN
  return new Rectangle(cropMask.x || 0, cropMask.y || 0, cropMask.width || 0, cropMask.height || 0)
}

export { rescaleCoverCoordinates, cropToCover }
