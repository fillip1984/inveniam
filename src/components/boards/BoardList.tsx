import Link from "next/link";
import { api } from "~/utils/api";
import LoadingErrorAndRetry from "../shared/LoadingErrorAndRetry";
import BoardCard from "./BoardCard";

const BoardList = () => {
  const {
    data: boards,
    isLoading,
    isError,
    refetch,
  } = api.boards.readAll.useQuery();

  return (
    <div>
      {(isLoading || isError) && (
        <div className="flex justify-center pt-12">
          <LoadingErrorAndRetry
            isLoading={isLoading}
            isError={isError}
            retry={() => void refetch()}
          />
        </div>
      )}

      {!isLoading && !isError && boards && (
        <div className="flex flex-wrap gap-2 p-4">
          {boards?.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
          <Link href="/boards/new/details">
            <div className="flex h-[250px] w-[350px] items-center justify-center rounded-lg border border-primary p-2 text-primary transition duration-300 ease-in-out hover:border-primary/80 hover:text-primary/80">
              <h3>New Board</h3>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BoardList;
