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
    <div className="w-full">
      {(isLoading || isError) && (
        <div className="flex w-full justify-center pt-12">
          <LoadingErrorAndRetry
            isLoading={isLoading}
            isError={isError}
            retry={() => void refetch()}
          />
        </div>
      )}

      {!isLoading && !isError && boards && (
        <div className="flex h-full w-full flex-wrap justify-center gap-2 p-4">
          {boards?.map((board) => <BoardCard key={board.id} board={board} />)}
          <Link
            href="/boards/new/details"
            className="flex h-1/2 w-full items-center justify-center rounded-lg border border-primary p-2 text-primary transition duration-300 ease-in-out hover:border-primary/80 hover:text-primary/80 sm:h-[250px] sm:w-[350px]">
            <h3>New Board</h3>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BoardList;
