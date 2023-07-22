import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { PiDotsSixBold } from "react-icons/pi";
import { api } from "~/utils/api";
import { type BucketAndEverything, type DraggableData } from "~/utils/types";
import TaskCard from "../tasks/TaskCard";
import NewTask from "./NewTask";

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

  const handleDeleteBucket = () => {
    removeBucket.mutate({ bucketId: bucket.id });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={clsx(
          "relative max-h-[88vh] w-[350px] select-none overflow-y-auto rounded-lg border bg-primary",
          {
            "opacity-30": !isOverlay && isDragging,
            "z-50 rotate-1 scale-105": isOverlay,
          }
        )}>
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1/2 text-xl text-white/60">
          <PiDotsSixBold />
        </div>
        <div className="p-2">
          <div className="mb-2 flex justify-between">
            <div className="flex items-center gap-2">
              <h5>{bucket.name}</h5>
              <span className="text-primary">{bucket.tasks.length}</span>
            </div>
            <button
              onClick={handleDeleteBucket}
              className="text rounded-full bg-danger px-2 text-black">
              X
            </button>
          </div>
          <NewTask bucket={bucket} />
          <div className="mb-8 flex flex-col gap-2">
            <SortableContext
              items={bucket.tasks}
              // TODO: not sure what strategy does... keeping for now
              strategy={verticalListSortingStrategy}>
              {bucket.tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  position={index}
                  handleTaskSelected={handleTaskSelected}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketComponent;
