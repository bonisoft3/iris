import type {
  Row,
  GetExtensions,
  ShapeStreamOptions,
} from "@electric-sql/client";

import { Shape, ShapeStream } from "@electric-sql/client";

type UnknownShape = Shape<Row<unknown>>;
type UnknownShapeStream = ShapeStream<Row<unknown>>;

const streamCache = new Map<string, UnknownShapeStream>();
const shapeCache = new Map<UnknownShapeStream, UnknownShape>();

export async function preloadShape<T extends Row<unknown> = Row>(
  options: ShapeStreamOptions<GetExtensions<T>>
): Promise<Shape<T>> {
  const shapeStream = getShapeStream<T>(options);
  const shape = getShape<T>(shapeStream);
  await shape.rows;
  return shape;
}

export function sortedOptionsHash<T>(options: ShapeStreamOptions<T>): string {
  return JSON.stringify(options, Object.keys(options).sort());
}

export function getShapeStream<T extends Row<unknown>>(
  options: ShapeStreamOptions<GetExtensions<T>>
): ShapeStream<T> {
  const shapeHash = sortedOptionsHash(options);

  // If the stream is already cached, return it if valid
  if (streamCache.has(shapeHash)) {
    const stream = streamCache.get(shapeHash)! as ShapeStream<T>;
    if (stream.error === undefined && !stream.options.signal?.aborted) {
      return stream;
    }

    // if stream is cached but errored/aborted, remove it and related shapes
    streamCache.delete(shapeHash);
    shapeCache.delete(stream);
  }

  const newShapeStream = new ShapeStream<T>(options);
  streamCache.set(shapeHash, newShapeStream);
  return newShapeStream;
}

export function getShape<T extends Row<unknown>>(
  shapeStream: ShapeStream<T>
): Shape<T> {
  // If the stream is already cached, return it if valid
  if (shapeCache.has(shapeStream)) {
    if (
      shapeStream.error === undefined &&
      !shapeStream.options.signal?.aborted
    ) {
      return shapeCache.get(shapeStream)! as Shape<T>;
    }

    // if stream is cached but errored/aborted, remove it and related shapes
    streamCache.delete(sortedOptionsHash(shapeStream.options));
    shapeCache.delete(shapeStream);
  }

  const newShape = new Shape<T>(shapeStream);
  shapeCache.set(shapeStream, newShape);
  return newShape;
}

export interface UseShapeResult<T extends Row<unknown> = Row> {
  data: T[];
  shape: Shape<T>;
  isLoading: boolean;
  lastSyncedAt?: number;
  error: Shape<T>["error"];
  isError: boolean;
}

function parseShapeData<T extends Row<unknown>>(
  shape: Shape<T>
): UseShapeResult<T> {
  return {
    data: shape.currentRows,
    isLoading: shape.isLoading(),
    lastSyncedAt: shape.lastSyncedAt(),
    isError: shape.error !== false,
    shape,
    error: shape.error,
  };
}

function identity<T>(arg: T): T {
  return arg;
}

interface UseShapeOptions<SourceData extends Row<unknown>, Selection>
  extends ShapeStreamOptions<GetExtensions<SourceData>> {
  selector?: (value: UseShapeResult<SourceData>) => Selection;
}

// Main composable function that replaces React's useShape
export function useShape<
  SourceData extends Row<unknown> = Row,
  Selection = UseShapeResult<SourceData>
>({
  selector = identity as (arg: UseShapeResult<SourceData>) => Selection,
  ...options
}: UseShapeOptions<SourceData, Selection>): ComputedRef<Selection> {
  // Initialize stream and shape
  const shapeStream = getShapeStream<SourceData>(
    options as ShapeStreamOptions<GetExtensions<SourceData>>
  );
  const shape = getShape<SourceData>(shapeStream);

  // Create a reactive reference for the shape data
  const latestShapeData = ref<UseShapeResult<SourceData>>(
    parseShapeData(shape)
  );

  watchEffect((onCleanup) => {
    if (!shape) return;

    const unsubscribe = shape.subscribe(() => {
      latestShapeData.value = parseShapeData(shape);
    });

    onCleanup(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });
  });

  return computed(() => {
    try {
      return selector(unref(latestShapeData) as UseShapeResult<SourceData>);
    } catch (error) {
      console.error("Error in shape selector:", error);
      return latestShapeData.value as unknown as Selection;
    }
  });
}

export function useShapeWithDefaults<SourceData extends Row<unknown>>(
  options: Omit<
    UseShapeOptions<SourceData, UseShapeResult<SourceData>>,
    "selector"
  >
): ComputedRef<UseShapeResult<SourceData>> {
  return useShape<SourceData>({
    ...options,
    selector: identity,
  });
}
