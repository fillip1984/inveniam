import {
  TaskStatus,
  type Attachment,
  type Board,
  type Bucket,
  type CheckListItem,
  type Comment,
  type Tag,
  type Task,
  type TaskTags,
} from "@prisma/client";
import { parse } from "date-fns";
import { z } from "zod";
import { yyyyMMddHyphenated } from "./dateUtils";

// short hand type stuff
export type BoardSummary = {
  id: string;
  name: string;
  description: string;
  buckets: {
    name: string;
    tasks: {
      text: string;
      description: string | null;
      complete: boolean;
    }[];
  }[];
};
export type BoardAndEverything = Board & {
  buckets: BucketAndEverything[];
};
export type BucketAndEverything = Bucket & {
  tasks: TaskAndEverything[];
};
export type TaskAndEverything = Task & {
  checkListItems: CheckListItem[];
  tags: (TaskTags & {
    tag: Tag;
  })[];
  comments: Comment[];
  attachments: Attachment[];
};

export type BoardFormSchemaType = z.infer<typeof boardFormSchema>;

// DND Stuff
export type DraggableData = {
  type: "Bucket" | "Task";
  id: string;
};

// zod stuff
export const boardFormSchema = z.object({
  id: z.string().nullish(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export const taskPositionUpdate = z.object({
  id: z.string(),
  position: z.number(),
  bucketId: z.string(),
});

export type TaskPositionUpdateType = z.infer<typeof taskPositionUpdate>;

export const bucketPositionUpdate = z.object({
  id: z.string(),
  position: z.number(),
});

export type BucketPositionUpdateType = z.infer<typeof bucketPositionUpdate>;

export const taskFormSchema = z
  .object({
    id: z.string(),
    text: z.string().min(1),
    description: z.string().nullish(),
    complete: z.boolean(),
    status: z.nativeEnum(TaskStatus),
    priority: z.string().nullish(),
    startDate: z.date().or(z.string()).nullish(),
    dueDate: z.date().or(z.string()).nullish(),
    bucketId: z.string(),
    comments: z.array(
      z.object({
        id: z.string().nullish(),
        text: z.string().min(1),
        posted: z.date(),
      })
    ),
    checklistItems: z.array(
      z.object({
        id: z.string().nullish(),
        text: z.string().min(1),
        complete: z.boolean(),
      })
    ),
    taskTag: z.array(
      z.object({
        taskId: z.string().nullish(),
        tagId: z.string().nullish(),
        tag: z.object({
          id: z.string().nullish(),
          name: z.string(),
        }),
      })
    ),
    attachments: z.array(
      z.object({
        id: z.string().nullish(),
        text: z.string(),
        added: z.date(),
        imageData_Base64Encoded: z.string().nullish(),
        location: z.string().nullish(),
      })
    ),
  })
  .refine(
    (data) => {
      // may be able to refine further with a coerce to date
      let startDate = null;
      let dueDate = null;
      if (data.startDate) {
        startDate = parse(
          data.startDate as string,
          yyyyMMddHyphenated,
          new Date()
        );
      }

      if (data.dueDate) {
        dueDate = parse(data.dueDate as string, yyyyMMddHyphenated, new Date());
      }

      if (!dueDate || !startDate) {
        //valid since there isn't both a start and a due date
        return true;
      } else if (startDate && dueDate >= startDate) {
        //valid
        return true;
      } else {
        //invalid
        return false;
      }
    },
    {
      message: "Due date must be after Start date",
      path: ["dueDate"],
    }
  );

export type TaskFormSchemaType = z.infer<typeof taskFormSchema>;

export const taskSummary = z.object({
  id: z.string(),
  text: z.string(),
  description: z.string().nullish(),
});

export type TaskSummaryType = z.infer<typeof taskSummary>;

export const tagFormSchema = z.object({
  id: z.string().nullish(),
  name: z.string(),
  description: z.string().nullish(),
});

export type TagFormSchemaType = z.infer<typeof tagFormSchema>;

// misc
// export type StatusOption = {
//   label: string;
//   code: string;
// };
// export const StatusOptions: StatusOption[] = [
//   {
//     label: "Not Started",
//     code: "not_started",
//   },
//   {
//     label: "In progress",
//     code: "in_progress",
//   },
//   {
//     label: "Done",
//     code: "done",
//   },
//   {
//     label: "Overdue",
//     code: "overdue",
//   },
// ];
// {/* </span> */}
//                 {/* <div className="flex items-center gap-4">
//                 <span className="flex items-center gap-1">
//                   <TbCircle /> Not started
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <TbCircleHalf2 className="rotate-90" /> In progress
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <TbCircleFilled /> Done
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <TbExclamationCircle /> Overdue
//                 </span>

export type PriorityOption = {
  label: string;
  code: string;
};
export const PriorityOptions: PriorityOption[] = [
  {
    label: "Low",
    code: "low",
  },
  {
    label: "Medium",
    code: "medium",
  },
  {
    label: "High",
    code: "high",
  },
  {
    label: "Urgent",
    code: "urgent",
  },
];

export const statusReport = z.object({
  date: z.date(),
  overdue: z.array(taskSummary),
  dueToday: z.array(taskSummary),
  dueThisWeek: z.array(taskSummary),
  completedThisWeek: z.array(taskSummary),
});

export type StatusReportType = z.infer<typeof statusReport>;
