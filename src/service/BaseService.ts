import { AxiosError } from "axios";
import { apiAxios } from "../axios/AxiosConfig";
import type { ApiResult, HttpMethod } from "../types";

/**
 * Base class for the axios-backed services. Wraps every request in the
 * `{ data, message, success }` envelope used across the application.
 */
export class BaseService {
  protected async handleRequest<T>(
    method: HttpMethod,
    url: string,
    data: unknown = null
  ): Promise<ApiResult<T>> {
    const response: ApiResult<T> = {
      data: {} as T,
      message: "",
      success: false,
    };

    try {
      const asyncResponse = await apiAxios.request<T>({ method, url, data });
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      response.message =
        axiosError.response?.data?.message || "Tente novamente mais tarde!";
    }

    return response;
  }

  protected async handleFileDownloadRequest(
    method: HttpMethod,
    url: string
  ): Promise<ApiResult<{ blob: Blob; filename: string }>> {
    const response: ApiResult<{ blob: Blob; filename: string }> = {
      data: { blob: new Blob(), filename: "" },
      message: "",
      success: false,
    };

    try {
      const asyncResponse = await apiAxios.request<Blob>({
        method,
        url,
        responseType: "blob",
      });
      const disposition = asyncResponse.headers["content-disposition"] as
        | string
        | undefined;
      const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const filename = match ? decodeURIComponent(match[1]) : "export";
      response.data = { blob: asyncResponse.data, filename };
      response.success = true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      response.message =
        axiosError.response?.data?.message || "Tente novamente mais tarde!";
    }

    return response;
  }

  protected async handleMultipartRequest<T>(
    method: "post" | "patch",
    url: string,
    formData: FormData
  ): Promise<ApiResult<T>> {
    const response: ApiResult<T> = {
      data: {} as T,
      message: "",
      success: false,
    };

    try {
      const asyncResponse = await apiAxios.request<T>({
        method,
        url,
        data: formData,
        transformRequest: (data, headers) => {
          // Remove Content-Type so browser sets it automatically with boundary
          if (headers) delete headers["Content-Type"];
          return data;
        },
      });
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      response.message =
        axiosError.response?.data?.message || "Tente novamente mais tarde!";
    }

    return response;
  }
}
