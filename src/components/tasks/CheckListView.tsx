import clsx from "clsx";
import { useRef, useState } from "react";
import {
  type UseFieldArrayAppend,
  type FieldArrayWithId,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormGetValues,
} from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa";
import { type TaskFormSchemaType } from "~/utils/types";

const CheckListView = ({
  items,
  append,
  remove,
  register,
  getValues,
}: {
  items: FieldArrayWithId<TaskFormSchemaType, "checklistItems", "id">[];
  append: UseFieldArrayAppend<TaskFormSchemaType, "checklistItems">;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<TaskFormSchemaType>;
  getValues: UseFormGetValues<TaskFormSchemaType>;
}) => {
  const [newItem, setNewItem] = useState("");
  const newItemRef = useRef<HTMLInputElement | null>(null);

  const handleAddNewItem = () => {
    append({ text: newItem, complete: false });
    setNewItem("");
    newItemRef.current?.focus();
  };

  return (
    <div className="mx-8">
      <div className="mb-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4">
            <input
              type="checkbox"
              {...register(`checklistItems.${index}.complete` as const)}
              className="rounded"
            />
            <input
              type="text"
              {...register(`checklistItems.${index}.text` as const)}
              className={clsx("", {
                "line-through": getValues("checklistItems")[index]?.complete,
              })}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-full bg-danger p-2 text-white">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          ref={newItemRef}
          type="text"
          className="rounded-r-none"
          placeholder="Enter a subtask..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          // TODO: doesn't work because of modal, escape dismisses modal and enter attempts to submit the form and dismiss modal
          // onKeyUp={(e) => {
          //   console.log(e.key);

          //   // prevent modal from closing
          //   e.preventDefault();
          //   e.stopPropagation();

          //   if (e.key === "Esc") {
          //     setNewItem("");
          //   }

          //   if (e.key === "Enter") {
          //     handleAddNewItem();
          //   }
          // }}
        />
        <button
          type="button"
          onClick={handleAddNewItem}
          className="rounded-r bg-accent px-6">
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default CheckListView;
