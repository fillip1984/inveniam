import Link from "next/link";
import { api } from "~/utils/api";
import BoardCard from "./BoardCard";

const BoardList = () => {
  const { data: boards } = api.boards.readAll.useQuery();

  return (
    <>
      <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boards?.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
        <Link href="/boards/new/details">
          <div className="flex min-h-[300px] min-w-[300px] items-center justify-center rounded-lg border border-primary p-2 text-primary transition duration-300 ease-in-out hover:border-primary/80 hover:text-primary/80">
            <h3>New Board</h3>
          </div>
        </Link>
      </div>
    </>
  );
};

export default BoardList;
