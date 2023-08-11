/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import { useState, type ChangeEvent } from "react";
import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
} from "react-hook-form";
import { api } from "~/utils/api";
import { yyyyMMddSpaceHH_MM_aka24hr } from "~/utils/dateUtils";
import {
  type S3StoredObjectType,
  type TaskFormSchemaType,
} from "~/utils/types";

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
  const [file, setFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState("");
  // const [base64, setBase64] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }
    setFile(e.target.files[0]);
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

  const handleAttachment = async () => {
    const link = await uploadAttachment();
    append({
      text,
      added: new Date(),
      imageData_Base64Encoded: imagePreview,
      link,
    });
    setText("");
    setFile(undefined);
  };

  const { data: presignedS3Url } = api.tasks.generateS3PresignedUrl.useQuery();

  const uploadAttachment = async () => {
    console.log("uploading attachment");
    if (!file) {
      throw new Error("Unable to upload photo, file is undefined");
    }

    if (!presignedS3Url) {
      throw new Error(
        "Unable to upload attachment, unable to get presignedS3Url"
      );
    }
    const image = await fetch(presignedS3Url.url, {
      body: file,
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
    return {
      url: image.url.split("?")[0],
      bucketName: presignedS3Url.bucketName,
      key: presignedS3Url.key,
    } as S3StoredObjectType;
  };

  return (
    <div className="px-2">
      <div className="flex flex-col gap-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.id}
            className="relative rounded border border-primary px-2">
            <span className="text-xs text-primary">
              Attached: {format(attachment.added, yyyyMMddSpaceHH_MM_aka24hr)}
            </span>
            {!attachment.link && (
              <img
                src={imagePreview}
                alt="Image preview"
                className="h-26 m-2 w-48"
              />
            )}

            {attachment.link && (
              <img
                height={150}
                width={150}
                src={attachment.link.url}
                alt="Image"
                className=""
              />
            )}
            <p>{attachment.text}</p>
            <button
              onClick={() => remove(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white">
              X
            </button>
          </div>
        ))}
      </div>

      <div className="my-2 flex flex-col gap-2">
        <input type="file" onChange={handleFileChange} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the attachment..."
        />
      </div>
      <button
        type="button"
        onClick={() => void handleAttachment()}
        className="rounded bg-accent px-4 py-2">
        Attach
      </button>
    </div>
  );
};

export default AttachmentListView;
