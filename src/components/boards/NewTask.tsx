import MsgReader from "@kenjiuno/msgreader";
import clsx from "clsx";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DetailedHTMLProps,
  type DragEvent,
  type InputHTMLAttributes,
} from "react";
import { api } from "~/utils/api";
import { type BucketAndEverything } from "~/utils/types";

const NewTask = ({ bucket }: { bucket: BucketAndEverything }) => {
  const [task, setTask] = useState("");
  const taskRef = useRef<HTMLInputElement | null>(null);

  const utils = api.useContext();
  const { mutate: createTask } = api.tasks.create.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
      setTask("");
      taskRef.current?.focus();
    },
  });

  const handleKeyUp = (
    e: DetailedHTMLProps<
      InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  ) => {
    if (e.key === "Escape") {
      setTask("");
    } else if (e.key === "Enter" && task) {
      handleAddTask();
    }
  };

  const handleAddTask = () => {
    createTask({
      text: task,
      position: bucket.tasks.length,
      bucketId: bucket.id,
    });
  };

  // const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: DragEvent<unknown>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      // setDragActive(true);
    } else if (e.type === "dragleave") {
      // setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<unknown>) => {
    e.preventDefault();
    e.stopPropagation();
    // setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processMsgFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processMsgFile(e.target.files[0]);
    }
  };

  const processMsgFile = async (msgFile: File) => {
    const msgFileBuffer = await msgFile.arrayBuffer();
    const msgReader = new MsgReader(msgFileBuffer);
    const msgInfo = msgReader.getFileData();
    const { subject, body } = msgInfo;

    createTask({
      text: subject ?? "No subject",
      description: body ?? "",
      position: bucket.tasks.length,
      bucketId: bucket.id,
    });
  };

  return (
    <div className="new-task mb-3">
      <div className="flex">
        <input
          type="text"
          className="rounded-r-none"
          placeholder="New task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyUp={handleKeyUp}
          ref={taskRef}
        />
        <button
          type="button"
          onClick={handleAddTask}
          className="h-auto rounded-r bg-accent px-4 text-xl text-white"
          disabled={!task}>
          +
        </button>
      </div>

      <div
        onDragEnter={handleDrag}
        className="relative my-1 flex w-full items-center justify-center">
        <label
          htmlFor="dropzone-file"
          className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary">
          <div className="flex flex-col items-center justify-center py-1">
            <p className="text-sm text-primary">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-primary">MSG</p>
          </div>
          {/* Trick to getting file drag and drop to function (by function I 
              mean the browser doesn't try to load or ask if you want to 
              download it) is to drop the file into the <input type="file"/> 
              element. To style things, you cannot make the input hidden but 
              can make it's opacity 0. One last note, the input below overlays 
              everything above so css styles like setting the cursor to a 
              pointer will not apply unless you put it on this element. Same 
              with on hover effects... messing with z index doesn't fix this.
            */}
          <input
            id="dropzone-file"
            type="file"
            accept=".msg"
            multiple={false}
            className="absolute inset-0 cursor-pointer opacity-0"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={handleChange}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onDrop={handleDrop}
          />
        </label>
      </div>
    </div>
  );
};

export default NewTask;
