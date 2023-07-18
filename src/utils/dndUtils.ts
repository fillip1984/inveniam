import { type BoardAndEverything, type BucketAndEverything } from "./types";

export const findBucketById = (bucketId: string, board: BoardAndEverything) => {
  const bucket = board.buckets.find((bucket) => bucket.id === bucketId);

  if (!bucket) {
    throw new Error("Unable to find bucket by id: " + bucketId);
  }

  return bucket;
};

export const findBucketByTaskId = (
  taskId: string,
  board: BoardAndEverything
) => {
  for (const bucket of board.buckets) {
    const taskFound = bucket.tasks.find((task) => task.id === taskId);

    if (taskFound) {
      return bucket;
    }
  }

  throw new Error("Unable to find bucket by task id:" + taskId);
};

export const findTaskById = (taskId: string, board: BoardAndEverything) => {
  for (const bucket of board.buckets) {
    const task = bucket.tasks.find((task) => task.id === taskId);
    if (task) {
      return task;
    }
  }

  throw new Error("Unable to find task by id" + taskId);
};

export const reorderBucketPositions = (buckets: BucketAndEverything[]) => {
  buckets.forEach((bucket, index) => {
    bucket.position = index;
  });
};

export const reorderTaskPositions = (buckets: BucketAndEverything[]) => {
  buckets.forEach((bucket) => {
    bucket.tasks = bucket.tasks.map((task, index) => {
      return { ...task, position: index };
    });
  });
};
