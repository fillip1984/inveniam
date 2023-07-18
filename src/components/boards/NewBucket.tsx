import {
  useRef,
  useState,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from "react";
import { api } from "~/utils/api";
import { type BoardAndEverything } from "~/utils/types";

const NewBucket = ({ board }: { board: BoardAndEverything }) => {
  const [bucketName, setBucketName] = useState("");
  const bucketNameRef = useRef<HTMLInputElement | null>(null);

  const utils = api.useContext();
  const { mutate: createBucket } = api.boards.addBucket.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
      setBucketName("");
      bucketNameRef.current?.focus();
    },
  });

  const handleKeyUp = (
    e: DetailedHTMLProps<
      InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  ) => {
    if (e.key === "Escape") {
      setBucketName("");
    } else if (e.key === "Enter" && bucketName) {
      handleAddBucket();
    }
  };

  const handleAddBucket = () => {
    createBucket({
      bucketName,
      position: board.buckets.length,
      boardId: board.id,
    });
  };

  return (
    <div className="min-w-[300px]">
      <div className="flex">
        <input
          type="text"
          placeholder="New bucket name..."
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          onKeyUp={handleKeyUp}
          ref={bucketNameRef}
          className="rounded-r-none"
        />
        <button
          type="button"
          onClick={handleAddBucket}
          className="h-auto rounded-r bg-primary px-4 py-2 text-xl text-white"
          disabled={!bucketName}>
          Add
        </button>
      </div>
    </div>
  );
};

export default NewBucket;
