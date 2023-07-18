import { format } from "date-fns";
import { useState } from "react";
import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
} from "react-hook-form";
import { yyyyMMddSpaceHH_MM_aka24hr } from "~/utils/dateUtils";
import { type TaskFormSchemaType } from "~/utils/types";

const CommentListView = ({
  comments,
  append,
  remove,
}: {
  comments: FieldArrayWithId<TaskFormSchemaType, "comments", "id">[];
  append: UseFieldArrayAppend<TaskFormSchemaType, "comments">;
  remove: UseFieldArrayRemove;
}) => {
  const [comment, setComment] = useState("");

  const handlePost = () => {
    append({ text: comment, posted: new Date() });
    setComment("");
  };

  return (
    <div className="px-2">
      <div className="flex flex-col gap-2">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className="relative rounded border border-primary px-2">
            <span className="text-xs text-white">
              Posted: {format(comment.posted, yyyyMMddSpaceHH_MM_aka24hr)}
            </span>
            <p>{comment.text}</p>
            <button
              onClick={() => remove(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white">
              X
            </button>
          </div>
        ))}
      </div>

      <div className="my-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}></textarea>
        <button
          type="button"
          onClick={handlePost}
          className="rounded bg-accent px-4 py-2">
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentListView;
