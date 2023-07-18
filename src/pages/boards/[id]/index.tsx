import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import { boardFormSchema, type BoardFormSchemaType } from "~/utils/types";

const EditBoard = () => {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";
  const { data: board } = api.boards.readOne.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id && !isNew, refetchOnWindowFocus: false }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BoardFormSchemaType>({
    resolver: zodResolver(boardFormSchema),
  });

  useEffect(() => {
    if (board) {
      reset({
        name: board.name,
        description: board.description,
      });
    }
  }, [board, reset]);

  const utils = api.useContext();
  const { mutate: createBoard } = api.boards.create.useMutation({
    onSuccess: async () => {
      await utils.boards.invalidate();
      void router.push("/");
    },
  });
  const { mutate: updateBoard } = api.boards.update.useMutation({
    onSuccess: async () => {
      await utils.boards.invalidate();
      void router.push("/");
    },
  });

  const onSubmit: SubmitHandler<BoardFormSchemaType> = (formData) => {
    if (isNew) {
      createBoard(formData);
    } else {
      formData = { ...formData, id: board?.id };
      updateBoard(formData);
    }
  };

  return (
    <div className="view-container">
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
            <span className="text-sm text-danger">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea {...register("description")}></textarea>
          {errors.description && (
            <span className="text-sm text-danger">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-xl text-white transition-colors duration-300 hover:bg-primary/90">
            Save
          </button>
          <Link
            href="/"
            className="rounded border-2 border-primary px-4 py-2 text-xl text-primary transition-colors duration-300 hover:border-primary/90 hover:text-primary/90">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditBoard;
