import Link from "next/link";
import { useRouter } from "next/router";
import { type MouseEvent } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
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
    void router.push(`/boards/${board.id}/edit`);
  };

  return (
    <Link
      href={`/boards/${board.id}`}
      className="flex min-h-[300px] min-w-[300px] flex-col rounded-lg bg-slate-300 p-2 transition duration-300 ease-in-out hover:bg-slate-300/90">
      <div className="flex-1">
        <h3>{board.name}</h3>
        <p>{board.description}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400 text-white">
          <FaTrash />
        </button>
        <button
          onClick={handleEditBoard}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-white">
          <FaPencilAlt />
        </button>
      </div>
    </Link>
  );
};

export default BoardCard;
