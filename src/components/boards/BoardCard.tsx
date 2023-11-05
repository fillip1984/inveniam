import Link from "next/link";
import { useRouter } from "next/router";
import { type MouseEvent } from "react";
import { FaPencilAlt, FaTrash, FaTasks } from "react-icons/fa";
import { api } from "~/utils/api";
import { type BoardSummary } from "~/utils/types";

const BoardCard = ({ board }: { board: BoardSummary }) => {
  const router = useRouter();

  const utils = api.useContext();
  const { mutate: deleteBoard } = api.boards.delete.useMutation({
    onSuccess: () => {
      void utils.boards.invalidate();
    },
  });

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    deleteBoard({ id: board.id });
  };

  const handleEditBoard = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void router.push(`/boards/${board.id}/details`);
  };

  return (
    <Link
      href={`/boards/${board.id}`}
      className="flex h-1/2 w-full flex-col rounded-lg bg-primary p-2 transition duration-300 ease-in-out hover:bg-primary/90 sm:h-[250px] sm:w-[350px]">
      <div className="flex-1">
        <h3>{board.name}</h3>
        <p>{board.description}</p>
        <span className="flex items-center gap-2">
          <FaTasks />
          {
            board.buckets
              .map((bucket) => bucket.tasks)
              .flat(1)
              .filter((task) => !task.complete).length
          }
          {/* // .reduce((taskCount, tasks) => (taskCount += tasks.length), 0)} */}
        </span>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-danger text-white">
          <FaTrash />
        </button>
        <button
          onClick={handleEditBoard}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
          <FaPencilAlt />
        </button>
      </div>
    </Link>
  );
};

export default BoardCard;
