import { zodResolver } from "@hookform/resolvers/zod";
// import { TaskStatus } from "@prisma/client";
import clsx from "clsx";
import { format } from "date-fns";
import { useEffect } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { BsChatSquareTextFill } from "react-icons/bs";
import { CiMemoPad } from "react-icons/ci";
import {
  // FaBitbucket,
  FaCalendarDay,
  FaChevronLeft,
  FaEllipsisV,
  FaFlag,
  FaList,
  // FaPaperclip,
  FaTag,
} from "react-icons/fa";
// import { TbCircleHalfVertical } from "react-icons/tb";
import TextareaAutosize from "react-textarea-autosize";
import { api } from "~/utils/api";
import {
  PriorityOptions,
  taskFormSchema,
  type TaskFormSchemaType,
} from "~/utils/types";
// import AttachmentListView from "./AttachmentListView";
import CheckListView from "./CheckListView";
import CommentListView from "./CommentListView";
import TagSelector from "./TagSelector";

const TaskModal = ({
  isOpen,
  close,
  taskId,
  boardId,
}: {
  isOpen: boolean;
  close: () => void;
  taskId: string;
  boardId: string;
}) => {
  const { data: task } = api.tasks.readOne.useQuery(
    { taskId },
    {
      refetchOnWindowFocus: false,
    }
  );

  // const { data: buckets } = api.boards.readAllBuckets.useQuery({ boardId });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    getValues,
  } = useForm<TaskFormSchemaType>({
    resolver: zodResolver(taskFormSchema),
  });

  // we can look into useFormContext instead if we want to make this look simpler
  const {
    append: appendChecklistItem,
    remove: removeChecklistItem,
    fields: checklistItems,
  } = useFieldArray({
    control,
    name: "checklistItems",
  });

  const {
    append: appendTag,
    remove: removeTag,
    fields: taskTags,
  } = useFieldArray({ control, name: "taskTag" });
  const checklistState = useWatch({ control, name: "checklistItems" });

  const {
    append: appendComment,
    remove: removeComment,
    fields: comments,
  } = useFieldArray({ control, name: "comments" });
  const commentsState = useWatch({ control, name: "comments" });

  const {
    append: appendAttachment,
    remove: removeAttachment,
    fields: attachments,
  } = useFieldArray({ control, name: "attachments" });
  const attachmentState = useWatch({ control, name: "attachments" });

  const isComplete = useWatch({ control, name: "complete" });

  const textWatch = useWatch({ control, name: "text" });
  useEffect(() => {
    console.log("text", textWatch);
  }, [textWatch]);

  useEffect(() => {
    if (task) {
      reset({
        id: task.id,
        bucketId: task.bucket.id,
        text: task.text,
        description: task.description,
        complete: task.complete,
        // status: task.status,
        priority: task.priority,
        startDate: task.startDate ? format(task.startDate, "yyyy-MM-dd") : "",
        dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "",
        checklistItems: task.checkListItems,
        taskTag: task.tags,
        comments: task.comments,
        attachments: task.attachments,
      });
    }
  }, [reset, task]);

  const utils = api.useContext();
  const { mutate: updateTask } = api.tasks.update.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
      close();
    },
  });

  const onSubmit: SubmitHandler<TaskFormSchemaType> = (formData) => {
    updateTask({ ...formData });
  };

  const { mutate: deleteTask } = api.tasks.delete.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
      close();
    },
  });

  const handleDelete = () => {
    if (task) {
      deleteTask({ taskId: task.id });
    }
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  return (
    <div
      className={clsx("relative", {
        "hidden opacity-0": !isOpen,
        "visible opacity-100": isOpen,
      })}>
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div
        onClick={close}
        className="fixed inset-0 z-[998] bg-black/30 backdrop-blur"
      />

      <div className="fixed inset-4 z-[999] mx-auto w-full max-w-[650px] overflow-hidden">
        <div className="h-full rounded bg-primary">
          <div
            id="modal-header"
            className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={close}
              className="flex items-center justify-center rounded-full bg-primary/20 p-2 text-2xl">
              <FaChevronLeft />
            </button>
            <div className="flex items-center justify-center gap-2">
              <button
                type="submit"
                form="taskForm"
                className="rounded border bg-primary px-4 py-2 text-white">
                Save
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded border border-primary px-4 py-2 text-primary">
                Close
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded border bg-danger px-4 py-2 text-white">
                Delete
              </button>
            </div>
            <button
              type="button"
              className="flex items-center justify-center rounded-full bg-primary/20 p-2 text-2xl">
              <FaEllipsisV />
            </button>
          </div>
          <hr className="my-2" />
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            id="taskForm"
            className="h-full overflow-y-scroll p-2 pb-44">
            <input type="hidden" {...register("id")} />
            <input type="hidden" {...register("bucketId")} />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-8 text-center">
                  <input
                    type="checkbox"
                    {...register("complete")}
                    className="h-6 w-6 rounded"
                  />
                </span>
                <div className="w-full">
                  <input
                    type="text"
                    {...register("text")}
                    className={clsx("", {
                      "line-through": isComplete,
                    })}
                  />
                  {errors.text && (
                    <span className="ml-2 text-sm">{errors.text.message}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="description"
                  className="flex w-8 justify-center">
                  <CiMemoPad className="text-2xl text-white" />
                </label>
                <TextareaAutosize
                  minRows={3}
                  {...register("description")}
                  id="description"
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="tags"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaTag className="text-2xl text-white" />
                  <span>Tags</span>
                </label>
                <TagSelector
                  append={appendTag}
                  remove={removeTag}
                  taskTags={taskTags}
                />
              </div>
              {/* <div className="flex items-center gap-2">
                <label
                  htmlFor="bucket"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaBitbucket className="text-2xl text-white" />
                  <span>Bucket</span>
                </label>
                <select id="bucket" {...register("bucketId")}>
                  {buckets?.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              </div> */}
              {/* <div className="flex items-center gap-2">
                <label
                  htmlFor="status"
                  className="flex w-36 items-center gap-2 pl-2">
                  <TbCircleHalfVertical className="text-2xl text-white" />
                  <span>Status</span>
                </label>
                <select id="status" {...register("status")}>
                  <option value={TaskStatus.NOT_STARTED}>Not Started</option>
                  <option value={TaskStatus.IN_PROGRESS}>In progress</option>
                  <option value={TaskStatus.BLOCKED_WAITING}>
                    Blocked/Waiting
                  </option>
                  <option value={TaskStatus.COMPLETE}>Complete</option>
                  <option
                    value={TaskStatus.COMPLETE_WAITING_ON_NEXT_RECURRENCE}>
                    Complete, will reoccur
                  </option>
                </select>
              </div> */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="priority"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaFlag className="text-2xl text-white" />
                  <span>Priority</span>
                </label>
                <select id="priority" {...register("priority")}>
                  <option value=""></option>
                  {PriorityOptions.map((priority) => (
                    <option key={priority.code} value={priority.code}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="startDate"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaCalendarDay className="text-2xl text-white" />
                  <span>Start Date</span>
                </label>
                <input type="date" {...register("startDate")} id="startDate" />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="dueDate"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaCalendarDay className="text-2xl text-white" />
                  <span>Due Date</span>
                </label>
                <div className="w-full">
                  <input type="date" {...register("dueDate")} id="dueDate" />

                  {errors.dueDate && (
                    <span className="ml-2 text-sm">
                      {errors.dueDate.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="my-2 flex items-center gap-2">
                <label className="flex items-center" />
                <FaList className="text-2xl text-white" /> Checklist
                <span className="text-white">
                  ({checklistState?.filter((item) => item.complete).length}/
                  {checklistState?.length})
                </span>
              </div>
              <CheckListView
                items={checklistItems}
                append={appendChecklistItem}
                remove={removeChecklistItem}
                register={register}
                getValues={getValues}
              />
              <div className="my-2 flex items-center gap-2">
                <label className="flex items-center" />
                <BsChatSquareTextFill className="text-2xl text-white" />
                Comments
                <span className="text-white">{commentsState?.length ?? 0}</span>
              </div>
              <CommentListView
                comments={comments}
                append={appendComment}
                remove={removeComment}
              />
              {/* <div className="my-2 flex items-center gap-2">
                <label className="flex items-center" />
                <FaPaperclip className="text-2xl text-white" /> Attachments
                <span className="text-white">
                  {attachmentState?.length ?? 0}
                </span>
              </div>
              <AttachmentListView
                attachments={attachments}
                append={appendAttachment}
                remove={removeAttachment}
              /> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
