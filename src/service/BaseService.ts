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
}
