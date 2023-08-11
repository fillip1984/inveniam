import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { format, isAfter, startOfDay } from "date-fns";
import { BsChatSquareTextFill } from "react-icons/bs";
import { FaCalendarDay, FaList, FaPaperclip } from "react-icons/fa";
import { yyyyMMddHyphenated } from "~/utils/dateUtils";
import { type DraggableData, type TaskAndEverything } from "~/utils/types";

const TaskCard = ({
  task,
  handleTaskSelected,
  isOverlay,
}: {
  task: TaskAndEverything;
  position?: number;
  handleTaskSelected?: (id: string) => void;
  isOverlay?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      id: task.id,
    } as DraggableData,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <div
        onClick={() =>
          handleTaskSelected ? handleTaskSelected(task.id) : null
        }
        className={clsx(
          "cursor-pointer select-none rounded border border-white bg-primary p-2 text-white",
          {
            "opacity-30": !isOverlay && isDragging,
            "z-50 rotate-3 scale-105": isOverlay,
          }
        )}>
        {task.tags && task.tags.length > 0 && (
          <div className="my-1 flex gap-2">
            {task.tags.map((taskTag) => (
              <span
                key={taskTag.tag.id}
                className="rounded bg-accent2 p-1 text-xs">
                {taskTag.tag.name}
              </span>
            ))}
          </div>
        )}

        <p
          className={clsx("m-2", {
            "line-through": task.complete,
          })}>
          {task.text}
        </p>
        {task.attachments.length > 0 && task.attachments[0]?.link && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            height={150}
            width={150}
            src={task.attachments[0].link.url}
            alt="Preview"
            className="mx-auto bg-white"
          />
        )}

        {(task.dueDate ||
          task.attachments.length > 0 ||
          task.checkListItems.length > 0 ||
          task.comments.length > 0) && (
          <div className="task-info flex justify-between pt-2">
            {task.dueDate && (
              <div
                className={clsx(
                  "flex items-center gap-1 rounded bg-accent2 px-1 text-xs",
                  {
                    "bg-danger":
                      !task.complete &&
                      isAfter(startOfDay(new Date()), startOfDay(task.dueDate)),
                  }
                )}>
                <FaCalendarDay />
                {format(task.dueDate, yyyyMMddHyphenated)}
              </div>
            )}

            {task.checkListItems.length > 0 && (
              <div className="flex items-center gap-1 rounded bg-accent2 p-1 text-xs">
                <FaList />(
                {task.checkListItems.filter((item) => item.complete).length}/
                {task.checkListItems.length})
              </div>
            )}

            {task.comments.length > 0 && (
              <div className="flex items-center gap-1 rounded bg-accent2 p-1 text-xs">
                <BsChatSquareTextFill />
                {task.comments.length}
              </div>
            )}

            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1 rounded bg-accent2 p-1 text-xs">
                <FaPaperclip />
                {task.attachments.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
