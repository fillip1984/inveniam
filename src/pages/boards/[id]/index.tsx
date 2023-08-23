import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { useDebounce } from "usehooks-ts";
import BucketComponent from "~/components/boards/BucketComponent";
import NewBucket from "~/components/boards/NewBucket";
import Loading from "~/components/shared/Loading";
import TaskCard from "~/components/tasks/TaskCard";
import TaskModal from "~/components/tasks/TaskModal";
import { api } from "~/utils/api";

import {
  findBucketById,
  findBucketByTaskId,
  findTaskById,
  reorderBucketPositions,
  reorderTaskPositions,
} from "~/utils/dndUtils";
import {
  type BucketPositionUpdateType,
  type DraggableData,
  type TaskPositionUpdateType,
} from "~/utils/types";

const BoardView = () => {
  const router = useRouter();
  const { id } = router.query;
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce<string>(search, 500);
  const { data: board, isLoading } = api.boards.readOne.useQuery(
    {
      id: id as string,
      search: debouncedValue,
    },
    { enabled: !!id, refetchOnWindowFocus: false }
  );

  // const utils = api.useContext();
  const { mutate: updateTaskPositions } = api.tasks.updatePositions.useMutation(
    {
      // TODO: not sure if we should be using this here...
      // onSuccess: () => utils.boards.invalidate(),
    }
  );
  const { mutate: updateBucketPositions } =
    api.boards.updateBucketPositions.useMutation();

  /**************************************************
   * DND Stuff
   **************************************************/
  const [activeDraggable, setActiveDraggable] = useState<DraggableData | null>(
    null
  );
  const renderDraggable = () => {
    if (!activeDraggable || !board) {
      return null;
    } else if (activeDraggable.type === "Bucket") {
      return (
        <BucketComponent
          isOverlay
          bucket={findBucketById(activeDraggable.id, board)}
          handleTaskSelected={handleTaskSelected}
        />
      );
    } else if (activeDraggable.type === "Task") {
      return (
        <TaskCard isOverlay task={findTaskById(activeDraggable.id, board)} />
      );
    } else {
      console.warn("Unsupported draggable");
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    // allows for buttons to be pressed and not activate dnd (clicking on cards to open modal or clicking the ellipsis to access context menus on lists are examples of why this is necessary)
    activationConstraint: {
      distance: 10,
    },
  });

  // you want this to work on a touch screen (laptop, phone, or tablet) then you need to define a TouchSensor
  const touchSensor = useSensor(TouchSensor, {
    // allows for buttons to be pressed and not activate dnd (clicking on cards to open modal or clicking the ellipsis to access context menus on lists are examples of why this is necessary)
    activationConstraint: {
      distance: 10,
    },
  });

  const handleDragStart = (e: DragStartEvent) => {
    const draggableData = e.active.data.current as DraggableData;

    if (!draggableData) {
      console.warn("did something go wrong, we do not have draggable data");
      setActiveDraggable(null);
    }

    //  set overlay draggable so that we see the draggable item floating over
    //  things (this is the overlay) and then see a placeholder for where the
    //  draggable (this is the original dom element) will end up if we let go
    if (draggableData.type === "Bucket") {
      setActiveDraggable(draggableData);
    } else if (draggableData.type === "Task") {
      setActiveDraggable(draggableData);
    } else {
      console.warn("Unsupported draggable");
    }
  };

  // this is what causes tasks to appear to be dragged from bucket to bucket
  const handleDragOver = (e: DragOverEvent) => {
    if (!board) {
      return;
    }

    // determine what we have dragged the draggable over top of to determine position
    const currentlyOver = e.over?.data.current as DraggableData;
    if (!currentlyOver) {
      return;
    }

    if (activeDraggable?.type === "Task") {
      const task = findTaskById(activeDraggable.id, board);
      const originalBucket = findBucketByTaskId(task.id, board);
      const originalPosition = originalBucket.tasks.indexOf(task);
      // default to current location
      let overBucket = originalBucket;
      let currentPosition = originalPosition;
      if (currentlyOver.type === "Bucket") {
        // currently over a bucket
        overBucket = findBucketById(currentlyOver.id, board);
        currentPosition = overBucket.tasks.length;
      } else if (currentlyOver.type === "Task") {
        //   // currently over a task
        const overTask = findTaskById(currentlyOver.id, board);
        overBucket = findBucketByTaskId(overTask.id, board);
        currentPosition = overBucket.tasks.indexOf(overTask);
      }

      // debugging
      // console.log(
      //   `currently over: ${
      //     overBucket?.name ?? "unknown"
      //   } in position in bucket: ${currentPosition}`
      // );

      if (originalBucket.id === overBucket.id) {
        if (originalPosition === currentPosition) {
          // item did not move
          return;
        }

        // item moved within existing bucket, delete and move to proper location
        originalBucket.tasks.splice(originalPosition, 1);
        originalBucket.tasks.splice(currentPosition, 0, task);
        // TODO: caused a bug, try again if you'd like to make it work better. Bug occurred when you dragged way beyond (before or after) lists it would add undefined elements
        // moveElement(originalBucket.tasks, originalPosition, currentPosition);
        reorderTaskPositions([originalBucket]);
      } else {
        // item moved to another bucket
        // remove from original bucket
        originalBucket.tasks.splice(originalPosition, 1);
        // place in new location on bucket to which it moved to
        overBucket.tasks.splice(currentPosition, 0, task);
        reorderTaskPositions([originalBucket, overBucket]);
      }
    }

    // See handleDragEnd to see how Buckets are reodered
  };

  // updates tasks once they are dropped to their new position/bucket
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragEnd = (e: DragEndEvent) => {
    if (!board) {
      return;
    }

    if (activeDraggable?.type === "Task") {
      // update server state of task positions
      const tasksToUpdate: TaskPositionUpdateType[] = [];
      for (const bucket of board?.buckets) {
        bucket.tasks.map((task) => {
          const taskToUpdate = {
            id: task.id,
            position: task.position,
            bucketId: bucket.id,
          };
          tasksToUpdate.push(taskToUpdate);
        });
      }
      updateTaskPositions({ tasks: tasksToUpdate });
    }

    if (
      activeDraggable?.type === "Bucket" &&
      e.over?.data.current &&
      e.over.data.current.type === "Bucket"
    ) {
      // reorder buckets and update server state
      const bucket = findBucketById(activeDraggable.id, board);
      const originalPosition = bucket.position;
      const currentPosition = findBucketById(
        e.over.data.current.id as string,
        board
      ).position;

      // debugging
      // console.log(`orig: ${originalPosition}, curr: ${currentPosition}`);

      board.buckets.splice(originalPosition, 1);
      board.buckets.splice(currentPosition, 0, bucket);
      // TODO: caused a bug, try again if you'd like to make it work better. Bug occurred when you dragged way beyond (before or after) lists it would add undefined elements
      // moveElement(board.buckets, originalPosition, currentPosition);
      reorderBucketPositions(board.buckets);
      const bucketsToUpdate: BucketPositionUpdateType[] = board.buckets.map(
        (bucket) => {
          return {
            id: bucket.id,
            position: bucket.position,
          };
        }
      );
      updateBucketPositions({ buckets: bucketsToUpdate });
    }

    // HINT HINT HINT!
    // You have to kill the overlay as soon as you can after letting go
    // of the draggable otherwise once you let go of the draggable it
    // has a tendency to try and return, visually, to it's original spot
    setActiveDraggable(null);
  };

  const handleDragCancel = () => {
    // console.log("cancelling drag");
    setActiveDraggable(null);
  };

  // modal stuff
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskId, setTaskId] = useState("");

  const handleTaskSelected = (taskId: string) => {
    setTaskId(taskId);
    setShowTaskModal(true);
  };

  useEffect(() => {
    if (showTaskModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showTaskModal]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden px-2">
      <div className="flex items-center justify-between px-2">
        <h4>{board?.name}</h4>
        <div className="flex flex-1 items-center justify-end gap-1">
          <button type="button" className="rounded-lg bg-primary p-2 text-xl">
            <FaSearchengin />
          </button>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for tasks on this board..."
            className="md:w-2/3 lg:w-1/2"
          />
        </div>
      </div>

      {isLoading && <Loading />}
      {!isLoading && board && (
        <div className="flex flex-nowrap gap-4 overflow-x-auto p-4 pr-12">
          <DndContext
            sensors={[mouseSensor, touchSensor]}
            // TODO: not sure what the collision or measuring is doing, only reason I
            // removed them is when moving buckets if a shorter bucket was dragged over
            // another taller bucket it didn't always detect that the item was being
            // dragged over it so I removed for now
            // collisionDetection={closestCenter}
            // measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}>
            <SortableContext
              items={board.buckets}
              // TODO: not sure what strategy does, keeping for now...
              strategy={horizontalListSortingStrategy}>
              {board.buckets.map((bucket) => (
                <BucketComponent
                  key={bucket.id}
                  bucket={bucket}
                  handleTaskSelected={handleTaskSelected}
                />
              ))}
            </SortableContext>
            {/* the overlay is a clone of what you actually click to drag, 
                  dropAnimation isn't necessary it just makes things 'snap' 
                  into place more quickly and smoothly than out of box */}
            <DragOverlay
              dropAnimation={{
                duration: 150,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}>
              {renderDraggable()}
            </DragOverlay>
          </DndContext>
          <NewBucket board={board} />
          <TaskModal
            isOpen={showTaskModal}
            close={() => setShowTaskModal(false)}
            taskId={taskId}
          />
        </div>
      )}
    </div>
  );
};

export default BoardView;
