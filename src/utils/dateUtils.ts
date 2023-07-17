import { format, parse } from "date-fns";

export const yyyyMMddHyphenated = "yyyy-MM-dd";
export const HH_mm_aka24hr = "HH:mm";
export const yyyyMMddSpaceHH_MM_aka24hr =
  yyyyMMddHyphenated + " " + HH_mm_aka24hr;

/**
 * Given input string, in format of yyyy-MM-dd, is converted (parsed) to a Date.
 * If given dateString is empty, null, or undefined a null is returned.
 * @param dateString
 * @returns
 */
export const parseHtmlDateInputToDate = (
  dateString: string | null | undefined
) => {
  if (!dateString) {
    return null;
  }

  const parsedDate = parse(dateString, yyyyMMddHyphenated, new Date());
  return parsedDate;
};

/**
 * Inverse of parseHtmlDateInput, given a Date, a string in format yyyy-MM-dd is returned.
 * If given date is null or undefined then null is returned.
 * @param date
 * @returns
 */
export const formatDateToHtmlDateInput = (date: Date | null | undefined) => {
  if (!date) {
    return null;
  }

  const formattedDate = format(date, yyyyMMddHyphenated);
  return formattedDate;
};
