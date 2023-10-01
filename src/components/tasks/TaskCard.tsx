import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { format, isAfter, startOfDay } from "date-fns";
import {
  BsChatSquareTextFill,
  BsChevronDoubleDown,
  BsChevronDoubleUp,
  BsChevronDown,
  BsChevronUp,
  BsDashLg,
  BsFillTagFill,
} from "react-icons/bs";
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="touch-manipulation">
      <div
        onClick={() =>
          handleTaskSelected ? handleTaskSelected(task.id) : null
        }
        className={clsx(
          "cursor-pointer select-none rounded border border-white bg-primary text-white",
          {
            "opacity-30": !isOverlay && isDragging,
            "z-50 rotate-3 scale-105": isOverlay,
          },
        )}>
        <div className="px-1">
          <Tags task={task} />
        </div>
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
        <div className="p-1">
          <div className="task-info flex items-center gap-1">
            <PriorityBadge task={task} />
            <DueDateBadge task={task} />
            <ChecklistBadge task={task} />
            <CommentBadge task={task} />
            <AttachmentBadge task={task} />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

const PriorityBadge = ({ task }: { task: TaskAndEverything }) => {
  const priorityIconSelector = () => {
    switch (task.priority) {
      case "LOWEST":
        return (
          <div className="rounded bg-calm p-1">
            <BsChevronDoubleDown />
          </div>
        );
      case "LOW":
        return (
          <div className="rounded bg-calm/80 p-1">
            <BsChevronDown />
          </div>
        );
      case "MEDIUM":
        return (
          <div className="rounded bg-accent p-1">
            <BsDashLg />
          </div>
        );
      case "HIGH":
        return (
          <div className="rounded bg-danger/80 p-1">
            <BsChevronUp />
          </div>
        );
      case "HIGHEST":
        return (
          <div className="rounded bg-danger p-1">
            <BsChevronDoubleUp />
          </div>
        );
    }
  };
  return (
    <div className="flex w-8 items-center justify-center">
      {priorityIconSelector()}
    </div>
  );
};

const DueDateBadge = ({ task }: { task: TaskAndEverything }) => {
  return (
    <div className="w-24">
      {task && task.dueDate && (
        <div
          className={clsx(
            "flex items-center gap-1 rounded bg-accent2 p-1 text-xs",
            {
              "bg-danger":
                !task.complete &&
                isAfter(startOfDay(new Date()), startOfDay(task.dueDate)),
            },
          )}>
          <FaCalendarDay />
          {format(task.dueDate, yyyyMMddHyphenated)}
        </div>
      )}
    </div>
  );
};

const ChecklistBadge = ({ task }: { task: TaskAndEverything }) => {
  return (
    <div className="w-14">
      {task.checkListItems.length > 0 && (
        <div className="flex items-center justify-center gap-1 rounded bg-accent2 p-1 text-xs">
          <FaList />(
          {task.checkListItems.filter((item) => item.complete).length}/
          {task.checkListItems.length})
        </div>
      )}
    </div>
  );
};

const CommentBadge = ({ task }: { task: TaskAndEverything }) => {
  return (
    <div className="col-start-5">
      {task.comments.length > 0 && (
        <div className="flex items-center justify-center gap-1 rounded bg-accent2 p-1 text-xs">
          <BsChatSquareTextFill />
          {task.comments.length}
        </div>
      )}
    </div>
  );
};

const AttachmentBadge = ({ task }: { task: TaskAndEverything }) => {
  return (
    <div className="col-start-6">
      {task.attachments.length > 0 && (
        <div className="flex items-center justify-center gap-1 rounded bg-accent2 p-1 text-xs">
          <FaPaperclip />
          {task.attachments.length}
        </div>
      )}
    </div>
  );
};

const Tags = ({ task }: { task: TaskAndEverything }) => {
  return (
    <>
      {task.tags && task.tags.length > 0 && (
        <div className="my-1 flex items-center gap-1">
          <BsFillTagFill />
          {task.tags.map((taskTag) => (
            <span
              key={taskTag.tag.id}
              className="rounded bg-accent2 p-1 text-xs">
              {taskTag.tag.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default TaskCard;
