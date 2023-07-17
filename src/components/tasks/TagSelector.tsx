import { type Tag } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
} from "react-hook-form";
import { api } from "~/utils/api";
import { type TaskFormSchemaType } from "~/utils/types";

const TagSelector = ({
  append,
  remove,
  taskTags,
}: {
  append: UseFieldArrayAppend<TaskFormSchemaType, "taskTag">;
  remove: UseFieldArrayRemove;
  taskTags: FieldArrayWithId<TaskFormSchemaType, "taskTag", "id">[];
}) => {
  const tagSearchRef = useRef<HTMLInputElement | null>(null);

  const [tagSearchBackdropVisible, setTagSearchBackdropVisible] =
    useState(false);

  const { mutate: createTag } = api.tags.create.useMutation({
    onSuccess: (newTag) => {
      append({ tag: newTag });
      setTagSearch("");
      setTagSearchBackdropVisible(false);
    },
  });

  const [tagSearch, setTagSearch] = useState("");

  const { data: availableTags } = api.tags.readAll.useQuery();

  const [availableTagsGivenSearch, setAvailableTagsGivenSearch] = useState<
    Tag[]
  >([]);

  useEffect(() => {
    if (availableTags) {
      setAvailableTagsGivenSearch(
        availableTags
          .filter((available) =>
            available.name.toLowerCase().includes(tagSearch.toLowerCase())
          )
          .filter(
            (available) =>
              !taskTags.find((taskTag) => taskTag.tag.name === available.name)
          )
      );
    }
  }, [availableTags, tagSearch, taskTags]);

  const handleCreateTag = () => {
    createTag({ name: tagSearch });
  };

  const handleAddTag = (availableTagId: string) => {
    const availableTag = availableTags?.find(
      (tag) => tag.id === availableTagId
    );
    if (availableTag) {
      append({ tag: availableTag });
      setTagSearch("");
    }
    setTagSearchBackdropVisible(false);
  };

  const handleRemoveTag = (id: number) => {
    remove(id);
  };

  const showTagSearchBackdrop = () => {
    setTagSearchBackdropVisible(true);
  };

  const hideTagSearchBackdrop = () => {
    setTagSearchBackdropVisible(false);
  };

  return (
    <div className="relative w-full">
      <div className="z-[999] flex flex-wrap gap-1 border-2 bg-white p-2">
        {/* list of associated tags */}
        {taskTags.map((tag, index) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1">
            {tag.tag.name}
            <button
              onClick={() => handleRemoveTag(index)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-2 text-white">
              X
            </button>
          </span>
        ))}

        <input
          type="text"
          ref={tagSearchRef}
          value={tagSearch}
          onClick={showTagSearchBackdrop}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="Add tags..."
          className=" w-auto flex-1 rounded-none border-0 focus:ring-0"
        />
      </div>

      {/* available tags, show selection of options */}
      {tagSearchBackdropVisible && availableTagsGivenSearch.length > 0 && (
        <div className="absolute left-0 right-0 z-[999] rounded  bg-white p-2 shadow">
          <div className="flex flex-col gap-1">
            {availableTagsGivenSearch.map((available) => (
              <span
                key={available.id}
                className="cursor-pointer select-none p-1 hover:bg-slate-300"
                onClick={() => handleAddTag(available.id)}>
                {available.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* no available tags, offer to create one */}
      {tagSearch.trim().length > 1 && availableTagsGivenSearch.length === 0 && (
        <div className="absolute left-0 right-0 z-[999] w-full rounded border bg-white p-2 shadow">
          <div className="z-[999] flex flex-col items-center gap-1">
            No available tags... create new tag?
            <div className="flex gap-1">
              <button
                onClick={handleCreateTag}
                className="rounded bg-slate-400 px-4 py-2">
                Create
              </button>
              <button
                onClick={() => setTagSearch("")}
                className="rounded border border-slate-400 px-4 py-2 text-slate-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* have to do this so the tag search drop down if visible once you select it */}
      {tagSearchBackdropVisible && (
        <div
          id="tag-select-backdrop"
          className="fixed inset-0 z-[998]"
          onClick={hideTagSearchBackdrop}></div>
      )}
    </div>
  );
};

export default TagSelector;
