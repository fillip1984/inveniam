import { type PriorityOption, type Task } from "@prisma/client";

export const sortByPriority = (task1: Task, task2: Task) => {
  // neither have priority
  if (!task1.priority && !task2.priority) {
    return 0;
  }

  // task1 has priority but task2 doesn't
  if (task1.priority && !task2.priority) {
    return -1;
  }

  // task 1 doesn't have priority but task2 does
  if (!task1.priority && task2.priority) {
    return 1;
  }

  // both have priority and are equal
  if (task1.priority === task2.priority) {
    return 0;
  }

  // both have priority

  return task1.priority &&
    task2.priority &&
    convertPriorityToNumber(task1.priority) >
      convertPriorityToNumber(task2.priority)
    ? -1
    : 1 ?? 0;
};

const convertPriorityToNumber = (priority: PriorityOption) => {
  switch (priority) {
    case "HIGHEST":
      return 5;
    case "HIGH":
      return 4;
    case "MEDIUM":
      return 3;
    case "LOW":
      return 2;
    case "LOWEST":
      return 1;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      throw new Error("Unmapped priority: " + priority);
  }
};
