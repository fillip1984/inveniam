import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { useState } from "react";
import {
  PiCheckSquare,
  PiDotsSixBold,
  PiDotsThreeOutlineVerticalFill,
  PiSortAscending,
  PiSquareBold,
  PiTrash,
} from "react-icons/pi";
import { api } from "~/utils/api";
import {
  type TaskPositionUpdateType,
  type BucketAndEverything,
  type DraggableData,
} from "~/utils/types";
import TaskCard from "../tasks/TaskCard";
import NewTask from "./NewTask";
import { isBefore, isEqual } from "date-fns";
import { sortByPriority } from "~/utils/taskUtils";

const BucketComponent = ({
  bucket,
  isOverlay,
  handleTaskSelected,
}: {
  bucket: BucketAndEverything;
  isOverlay?: boolean;
  handleTaskSelected: (id: string) => void;
}) => {
  // use a useEffect or useMemo and log out the values to observe what is happening if you want to see for yourself
  // attributes adds a role of button to the draggable item, and possibly aria hints, what I can tell the button causes the cursor to become cursor-pointer, otherwise not so necessary unless supporting screen readers
  // listeners causes the item to be draggable, if you don't specify {...listeners on the draggable item then the DnDContect doesn't register drag events}
  // setNodeRef is how DnDKit gains access to the element
  // combination of transform and applying the style to the draggable is what causes the item to actually lift up and visually move. It applies a translate3d(and then updates position of element)
  // transition doesn't seem to visually do much, it eases into being dragged (transform) but it happens so fast I can't see the difference
  // isDragging is as it says, boolean indicating if an element is actively being dragged, it allows for you to apply your own transform, I'm sure I could combine my own styles into the transform but I don't want to write my own css and rely on tailwind. Interestingly, I had to add tailwind to a lower element otherwise style seemed to override whatever I did on ${isDraggable ? 'styles' : ''}
  // inside of the sortable, id uniquely identifies the element
  // data gives you a chance to add data that is retrievable during the onDragStart or cancel or end or etc... so you don't have to take the id and then look them back up. You could throw the entire object there and forego having to look them up to effect them
  // go back to the DnDContext and see the DragOverlay to see what renders the draggable that is a placeholder showing where the item will go vs what is being dragged
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: bucket.id,
    data: {
      type: "Bucket",
      id: bucket.id,
    } as DraggableData,
  });
  const [showCompleted, setShowCompleted] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const utils = api.useContext();
  const removeBucket = api.boards.removeBucket.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
    },
  });

  const { mutate: updateTaskPositions } = api.tasks.updatePositions.useMutation(
    {
      // TODO: not sure if we should be using this here...
      // onSuccess: () => utils.boards.invalidate(),
    },
  );

  const handleSortByDueDate = () => {
    const tasksToUpdate: TaskPositionUpdateType[] = [];

    bucket.tasks
      .sort((task1, task2) => {
        // neither have due date
        if (!task1.dueDate && !task2.dueDate) {
          return sortByPriority(task1, task2);
        }

        // task1 has due date but task2 doesn't
        if (task1.dueDate && !task2.dueDate) {
          return -1;
        }

        // task 1 doesn't have a due date but task2 does
        if (!task1.dueDate && task2.dueDate) {
          return 1;
        }

        // both have due date and are equal, include priority in sort
        if (
          task1.dueDate &&
          task2.dueDate &&
          isEqual(task1.dueDate, task2.dueDate)
        ) {
          return sortByPriority(task1, task2);
        }

        // both have due date but are not equal
        return isBefore(
          task1.dueDate ?? new Date(0),
          task2.dueDate ?? new Date(0),
        )
          ? -1
          : 1;
      })
      .forEach((task, index) => {
        const taskToUpdate = {
          id: task.id,
          position: index,
          bucketId: bucket.id,
        };
        tasksToUpdate.push(taskToUpdate);
      });

    updateTaskPositions({ tasks: tasksToUpdate });
  };

  const handleShowCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  const handleDeleteBucket = () => {
    removeBucket.mutate({ bucketId: bucket.id });
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      <div
        className={clsx(
          "relative flex max-h-[85dvh] w-[85dvw] select-none flex-col overflow-hidden rounded-lg border bg-primary sm:w-[400px]",
          {
            "opacity-30": !isOverlay && isDragging,
            "z-50 rotate-1 scale-105": isOverlay,
          },
        )}>
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1/2 text-xl text-white/60">
          <PiDotsSixBold />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden py-2">
          <div className="mb-2 flex justify-between px-2">
            <div className="flex items-center gap-2">
              <h5>{bucket.name}</h5>
              <span className="text-secondary">
                {
                  bucket.tasks.filter((task) => !task.complete || showCompleted)
                    .length
                }
              </span>
            </div>
            <BucketMenu
              handleSortByDueDate={handleSortByDueDate}
              handleShowCompleted={handleShowCompleted}
              showCompleted={showCompleted}
              handleDeleteBucket={handleDeleteBucket}
            />
          </div>
          <NewTask bucket={bucket} />
          <div className="mb-4 flex flex-1 flex-col gap-2 overflow-y-auto px-4">
            <SortableContext
              items={bucket.tasks}
              // TODO: not sure what strategy does... keeping for now
              strategy={verticalListSortingStrategy}>
              {bucket.tasks
                .filter((task) => !task.complete || showCompleted)
                .map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    position={index}
                    handleTaskSelected={handleTaskSelected}
                  />
                ))}
            </SortableContext>
          </div>
          {showCompleted === false &&
            bucket.tasks.filter((task) => task.complete).length > 0 && (
              <button
                type="button"
                onClick={handleShowCompleted}
                className="mx-2 rounded bg-accent p-2 text-center text-primary">
                {bucket.tasks.filter((task) => task.complete).length} Completed
                task
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

const BucketMenu = ({
  handleSortByDueDate,
  handleShowCompleted,
  showCompleted,
  handleDeleteBucket,
}: {
  handleSortByDueDate: () => void;
  handleShowCompleted: () => void;
  showCompleted: boolean;
  handleDeleteBucket: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="rounded-full p-2 hover:bg-white/30">
        <PiDotsThreeOutlineVerticalFill />
      </button>

      {isMenuOpen && (
        <>
          <div className="absolute right-0 z-[999] w-40 rounded bg-secondary p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                toggleMenu();
                handleSortByDueDate();
              }}
              className="flex w-full items-center gap-1 rounded p-2 text-primary transition duration-300 hover:bg-primary/10">
              <PiSortAscending className="w-6" />
              Sort by due date
            </button>
            {!showCompleted ? (
              <button
                type="button"
                onClick={() => {
                  toggleMenu();
                  handleShowCompleted();
                }}
                className="flex w-full items-center gap-1 rounded p-2 text-primary transition duration-300 hover:bg-primary/10">
                <PiCheckSquare className="w-6" />
                Show completed
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toggleMenu();
                  handleShowCompleted();
                }}
                className="flex w-full items-center gap-1 rounded p-2 text-primary transition duration-300 hover:bg-primary/10">
                <PiSquareBold className="w-6" />
                Hide completed
              </button>
            )}

            <button
              onClick={() => {
                toggleMenu();
                handleDeleteBucket();
              }}
              className="flex w-full items-center gap-1 rounded p-2 text-danger transition duration-300 hover:bg-danger/10">
              <PiTrash className="w-6" />
              Delete bucket
            </button>
          </div>
          {/* backdrop */}
          <div
            onClick={toggleMenu}
            className="w-scree fixed inset-0 z-[998] h-screen"></div>
        </>
      )}
    </div>
  );
};

export default BucketComponent;
