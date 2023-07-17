/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
} from "react-hook-form";
import { yyyyMMddSpaceHH_MM_aka24hr } from "~/utils/dateUtils";
import { type TaskFormSchemaType } from "~/utils/types";

const AttachmentListView = ({
  attachments,
  append,
  remove,
}: {
  attachments: FieldArrayWithId<TaskFormSchemaType, "attachments", "id">[];
  append: UseFieldArrayAppend<TaskFormSchemaType, "attachments">;
  remove: UseFieldArrayRemove;
}) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  // const [base64, setBase64] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }
    setFile(e.target.value);
    const uploadFile = e.target.files[0];
    const fr = new FileReader();
    fr.onload = convertFileToBase64;
    // fr.readAsBinaryString(uploadFile);
    fr.readAsDataURL(uploadFile);
  };

  const convertFileToBase64 = (e: ProgressEvent<FileReader>) => {
    // See: https://dev.to/guscarpim/upload-image-base64-react-4p7j
    const binaryString = e.target?.result;
    if (binaryString) {
      // setBase64(btoa(binaryString as string));
      setImagePreview(binaryString as string);
      // setValue(`attachments.0.imageData_Base64Encoded`, binaryString as string);
    }
  };

  const handleAttachment = () => {
    append({
      text,
      added: new Date(),
      imageData_Base64Encoded: imagePreview,
    });
    setText("");
    setFile("");
  };

  return (
    <div className="px-2">
      <div className="flex flex-col gap-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.id}
            className="relative rounded border border-slate-400 px-2">
            <span className="text-xs text-slate-400">
              Attached: {format(attachment.added, yyyyMMddSpaceHH_MM_aka24hr)}
            </span>
            {!attachment.location && (
              <img
                src={imagePreview}
                alt="Image preview"
                className="h-26 m-2 w-48"
              />
            )}

            {attachment.location && (
              <Image
                height={150}
                width={150}
                src={attachment.location}
                alt="Image"
                className=""
              />
            )}
            <p>{attachment.text}</p>
            <button
              onClick={() => remove(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
              X
            </button>
          </div>
        ))}
      </div>

      <div className="my-2 flex flex-col gap-2">
        <input type="file" value={file} onChange={handleFileChange} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the attachment..."
        />
      </div>
      <button
        type="button"
        onClick={handleAttachment}
        className="rounded bg-slate-400 px-4 py-2">
        Attach
      </button>
    </div>
  );
};

export default AttachmentListView;
