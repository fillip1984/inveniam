import { toast } from "react-hot-toast";
import { BsFillSendFill } from "react-icons/bs";
import { api } from "~/utils/api";

export default function StatusReport() {
  const { data: status } = api.tasks.status.useQuery();

  const { mutate: sendEmail } = api.tasks.sendReportEmail.useMutation({
    onSuccess: () => {
      toast.success("Status report email sent");
    },
  });

  const handleSendEmail = () => {
    console.log("testing email");
    sendEmail();
  };

  return (
    <div className="mx-auto w-3/4 pt-2">
      {/* <h2>{format(new Date(), "EEEE (M/dd)")}</h2> */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSendEmail}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-xl">
          <BsFillSendFill /> Send status email
        </button>
      </div>

      {status && (
        <>
          <div className="mb-6">
            <h3 className="mb-2 font-bold">Totals</h3>
            <div className="flex w-full flex-wrap justify-center gap-2">
              <div className="flex h-[160px] w-[150px] flex-col items-center justify-center rounded-lg bg-danger text-white">
                <h4>Overdue</h4>
                <p className="text-6xl font-bold">{status.overdue.length}</p>
              </div>
              <div className="flex h-[160px] w-[150px] flex-col items-center justify-center rounded-lg bg-accent text-black">
                <h4>Today</h4>
                <p className="text-6xl font-bold">{status.dueToday.length}</p>
              </div>
              <div className="flex h-[160px] w-[150px] flex-col items-center justify-center rounded-lg bg-accent2 text-black">
                <h4 className="upp">This Week</h4>
                <p className="text-6xl font-bold">
                  {status.dueThisWeek.length}
                </p>
              </div>
              <div className="relative flex h-[160px] w-[150px] flex-col items-center justify-center rounded-lg bg-warning text-black">
                <h4>Completed</h4>
                <p className="text-6xl font-bold">
                  {status.completedThisWeek.length}
                </p>
                <span className="absolute bottom-2 text-xs">this week</span>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4">
            <div className="rounded-xl bg-danger/50 px-4 py-2">
              <h3 className="mb-2 font-bold text-danger">Overdue</h3>
              {status.overdue.length === 0 && (
                <p className="text-xs">Nothing overdue</p>
              )}

              {status.overdue.map((task) => (
                <div key={task.id}>
                  <label>
                    <input type="checkbox" className="mx-2 rounded-full" />
                    {task.text}
                  </label>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-accent/50 px-4 py-2">
              <h3 className="mb-2 font-bold text-accent">Today</h3>
              {status.dueToday.length === 0 && (
                <p className="text-xs">Nothing due</p>
              )}
              {status.dueToday.map((task) => (
                <div key={task.id}>
                  <label>
                    <input type="checkbox" className="mx-2 rounded-full" />
                    {task.text}
                  </label>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-accent2/50 px-4 py-2">
              <h3 className="mb-2 font-bold text-accent2">This Week</h3>
              {status.dueThisWeek.length === 0 && (
                <p className="text-xs">Nothing due</p>
              )}
              {status.dueThisWeek.map((task) => (
                <div key={task.id}>
                  <label>
                    <input type="checkbox" className="mx-2 rounded-full" />
                    {task.text}
                  </label>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-warning/50 px-4 py-2">
              <h3 className="mb-2 font-bold text-warning">Completed</h3>
              {status.completedThisWeek.length === 0 && (
                <p className="text-xs">No tasks have been completed...yet!</p>
              )}
              {status.completedThisWeek.map((task) => (
                <div key={task.id}>
                  <label>
                    <input type="checkbox" className="mx-2 rounded-full" />
                    {task.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
