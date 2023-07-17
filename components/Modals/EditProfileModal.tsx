import Cookies from "js-cookie";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";

import { ModalContext } from "@/lib/context";
import { clientSupabase } from "@/lib/supabase";
import { api } from "@/lib/utils";

type Form = {
  name: string;
};

type UploadData = {
  token: string;
  path: string;
  file?: File;
};

export default function EditProfileModal() {
  const [form, setForm] = useState<Form>({
    name: "",
  });

  const [isDisabled, setIsDisabled] = useState(false);

  const [uploadData, setUploadData] = useState<UploadData>({
    file: undefined,
    token: "",
    path: "",
  });

  const { closeModal } = useContext(ModalContext);

  const email = Cookies.get("glo-email");

  useEffect(() => {
    const init = async () => {
      const res = await api().get<{ path: string; token: string }>(
        "/upload-img",
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { token, path } = res.data;

      setUploadData({ token, path });
    };
    init();
  }, []);

  const save = async () => {
    setIsDisabled(true);

    const { token, path, file } = uploadData;

    if (file) {
      await clientSupabase.storage
        .from("public")
        .uploadToSignedUrl(path, token, uploadData.file!);
    }

    await api().post("/profile", {
      ...form,
      avatarPath: uploadData.path,
    });

    // Add popup

    closeModal();
  };

  return (
    <div className="py-6 px-10">
      <div className="flex flex-row justify-between">
        <div></div>
        <button className="" onClick={() => closeModal()}>
          <Image alt="x" src="/x.svg" height={16} width={16} />
        </button>
      </div>
      <section className="flex flex-col items-center">
        <div className="form-group">
          <label>Name</label>
          <input
            className="form-input"
            type="text"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            value={form.name}
            placeholder="Name"
            pattern=".{3,}"
          />
        </div>
        <input
          type="file"
          required
          onChange={(event) => {
            // handle the file input change event
            const files = event.target.files;
            setUploadData({ ...uploadData, file: files![0] });
          }}
        />
        {uploadData.file && (
          <Image
            alt="preview"
            objectFit="cover"
            src={URL.createObjectURL(uploadData.file)}
            width={64}
            height={64}
            layout="fixed"
          />
        )}
        {/* {form.url && (
          <Image
            alt="uploaded"
            objectFit="cover"
            src={generateAvatarUrl(form.url)}
            width={64}
            height={64}
            layout="fixed"
          />
        )} */}
        <button
          disabled={isDisabled}
          onClick={save}
          className="mt-4 primary-button"
        >
          Save
        </button>
      </section>
    </div>
  );
}
