import { api } from "@/lib/utils";

export const getCurrentSelectedCharity = async () => {
  let apiInstance = api();
  if (!apiInstance) {
    // HACK: some race condition with the api instance
    await new Promise((res) => setTimeout(res, 1000));
    apiInstance = api();
  }
  return apiInstance.get(`/charity`).then((res) => res.data);
};
