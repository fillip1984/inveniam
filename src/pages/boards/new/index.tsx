import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { boardFormSchema, type BoardFormSchemaType } from "~/utils/types";
import { api } from "~/utils/api";

const NewBoard = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BoardFormSchemaType>({
    resolver: zodResolver(boardFormSchema),
  });

  const utils = api.useContext();
  const createBoard = api.boards.create.useMutation({
    onSuccess: async () => {
      await utils.boards.invalidate();
      void router.push("/");
    },
  });

  const onSubmit: SubmitHandler<BoardFormSchemaType> = (formData) => {
    createBoard.mutate({ ...formData });
  };

  return (
    <form
      noValidate
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 p-2">
      <p>{errors.root?.message}</p>
      <div>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" {...register("name")} />
        {errors.name && (
          <span className="text-sm text-red-600">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea {...register("description")}></textarea>
        {errors.description && (
          <span className="text-sm text-red-600">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="hover: rounded bg-slate-700 px-4 py-2 text-xl text-white hover:bg-slate-700/80">
          Save
        </button>
        <Link
          href="/"
          className="rounded border-2 border-slate-700 px-4 py-2 text-xl text-slate-700 hover:border-slate-700/80 hover:text-slate-700/80">
          Cancel
        </Link>
      </div>
    </form>
  );
};

export default NewBoard;
