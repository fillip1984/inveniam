import { FaCircleNotch, FaExclamationTriangle } from "react-icons/fa";

const LoadingErrorAndRetry = ({
  isLoading,
  isError,
  retry,
}: {
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}) => {
  return (
    <div className="flex items-center justify-center">
      {isLoading && <FaCircleNotch className="animate-spin text-8xl" />}

      {isError && (
        <div>
          <h2 className="flex items-center justify-center gap-2 uppercase">
            <FaExclamationTriangle /> error
          </h2>
          <div className="my-8">
            <p>An occurred has occurred, would you like to try?</p>
            <button
              type="button"
              onClick={retry}
              className="mt-1 w-full rounded bg-slate-400 px-4 py-2 text-3xl">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingErrorAndRetry;
