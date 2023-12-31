import { type Tag } from "@prisma/client";
import { format } from "date-fns";
import { useState, type ChangeEvent } from "react";
import { BsPencil } from "react-icons/bs";
import { api } from "~/utils/api";

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-3/4 flex-col gap-4 pt-2">
      <h3>Admin</h3>

      <ExportSection />

      <ImportSection />

      <TagSection />
    </div>
  );
}

const ExportSection = () => {
  const [isPrettyPrint, setIsPrettyPrint] = useState(true);

  const { mutate: exportData } = api.admin.export.useMutation({
    onSuccess: (data) => {
      let url = null;
      if (isPrettyPrint) {
        url = window.URL.createObjectURL(
          new Blob([JSON.stringify(data, null, 2)]),
        );
      } else {
        url = window.URL.createObjectURL(new Blob([JSON.stringify(data)]));
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${format(new Date(), "yyyy-MM-dd'T'HH_mm_ss")} inveniam_export.json`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    },
  });

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <h4>Export</h4>
      <p>Export boards and a portion of the tasks (excludes attachments)</p>
      <button
        type="button"
        onClick={handleExport}
        className="rounded bg-primary px-4 py-2">
        Export
      </button>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={isPrettyPrint}
          onChange={() => setIsPrettyPrint((prev) => !prev)}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-primary/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent2 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4"></div>
        <span className="ml-3">Pretty Print JSON</span>
      </label>
    </div>
  );
};

const ImportSection = () => {
  const [importFile, setImportFile] = useState<File | undefined>(undefined);
  const { mutate: importData } = api.admin.import.useMutation();

  const handleImport = () => {
    if (!importFile) {
      throw new Error("unable to import file");
    }
    const fileReader = new FileReader();
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const dataAsText = e.target?.result;
      if (!dataAsText) {
        throw new Error("Unable to import");
      }
      importData({ data: dataAsText as string });
    };
    fileReader.readAsText(importFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.target.files) {
      throw new Error("Unable to set file");
    }
    setImportFile(e.target.files[0]);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <h4>Import</h4>
      <p>Import boards and a portion of the tasks (excludes attachments)</p>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleImport}
        className="rounded bg-primary px-4 py-2">
        Import
      </button>
    </div>
  );
};

const TagSection = () => {
  const { data: tags } = api.tags.readAll.useQuery();

  const handleEditTag = (tag: Tag) => {
    console.log(`editing tag ${tag.name}`);
  };

  return (
    <div>
      <h4>Tags</h4>
      <div className="flex flex-col items-start gap-1">
        {tags?.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2">
            <div className={`rounded bg-accent2 p-1`}>{tag.name}</div>
            <button type="button" onClick={() => handleEditTag(tag)}>
              <BsPencil />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
