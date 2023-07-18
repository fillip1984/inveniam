import { zodResolver } from "@hookform/resolvers/zod";
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
  FaBitbucket,
  FaCalendarDay,
  FaChevronLeft,
  FaEllipsisV,
  FaFlag,
  FaList,
  FaPaperclip,
  FaTag,
} from "react-icons/fa";
import { TbCircleHalfVertical } from "react-icons/tb";
import { api } from "~/utils/api";
import {
  PriorityOptions,
  StatusOptions,
  taskFormSchema,
  type TaskFormSchemaType,
} from "~/utils/types";
import AttachmentListView from "./AttachmentListView";
import CheckListView from "./CheckListView";
import CommentListView from "./CommentListView";
import TagSelector from "./TagSelector";
import clsx from "clsx";

const TaskModal = ({
  isOpen,
  close,
  taskId,
}: {
  isOpen: boolean;
  close: () => void;
  taskId: string;
}) => {
  const { data: task } = api.tasks.readOne.useQuery(
    { taskId },
    {
      refetchOnWindowFocus: false,
    }
  );

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

  useEffect(() => {
    if (task) {
      reset({
        id: task.id,
        text: task.text,
        description: task.description,
        status: task.status,
        priority: task.priority,
        // TODO: figure out optimal way to do this, at first, I ended up using defaultValue for now on the field. But kept having issues with validation...would have to use coerce, ended up parsing/formatting depending on where we are
        startDate: task.startDate ? format(task.startDate, "yyyy-MM-dd") : "",
        dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "",
        bucketId: task.bucket.id,
        bucketName: task.bucket.name,
        checklistItems: task.checkListItems,
        taskTag: task.tags,
        comments: task.comments,
        attachments: task.attachments,
      });
      // TODO: this also didn't work
      // setValue("startDate", task.startDate?.toISOString().substring(0, 10));
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-8 text-center">
                  <input type="checkbox" />
                </span>
                <input type="text" {...register("text")} />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="description"
                  className="flex w-8 justify-center">
                  <CiMemoPad className="text-2xl text-white" />
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={8}></textarea>
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
              <div className="flex items-center gap-2">
                <label
                  htmlFor="bucket"
                  className="flex w-36 items-center gap-2 pl-2">
                  <FaBitbucket className="text-2xl text-white" />
                  <span>Bucket</span>
                </label>
                <select id="bucket" {...register("bucketId")}>
                  <option value={task?.bucket.id}>{task?.bucket.name}</option>
                  {/* {StatusOptions.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.label}
                    </option>
                  ))} */}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="status"
                  className="flex w-36 items-center gap-2 pl-2">
                  <TbCircleHalfVertical className="text-2xl text-white" />
                  <span>Status</span>
                </label>
                <select id="status" {...register("status")}>
                  {StatusOptions.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
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
                <input
                  type="date"
                  {...register("startDate", {
                    // valueAsDate: true,
                  })}
                  // defaultValue={
                  //   task?.startDate?.toISOString().substring(0, 10) ?? ""
                  // }
                  id="startDate"
                />
              </div>
              <div
                className={`flex flex-col  ${
                  errors.dueDate ? "text-danger" : "text-white"
                }`}>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="dueDate"
                    className="pl-2text-white flex w-36 items-center gap-2">
                    <FaCalendarDay className="text-2xl" />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    {...register("dueDate", {
                      // valueAsDate: true,
                    })}
                    // defaultValue={
                    //   task?.dueDate?.toISOString().substring(0, 10) ?? ""
                    // }
                    id="dueDate"
                  />
                </div>
                {errors.dueDate && (
                  <span className="ml-2 text-sm">{errors.dueDate.message}</span>
                )}
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
