import { BaseService } from "./BaseService";
import type { AuthResponse, Page, User } from "../types";

interface UserPasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
}

export class UserService extends BaseService {
  registerUser(user: unknown) {
    return this.handleRequest<User>("post", "/user/register", user);
  }

  loginUser(userLogin: unknown) {
    return this.handleRequest<AuthResponse>("post", "/user/login", userLogin);
  }

  findUser() {
    return this.handleRequest<User>("get", `/user/find`);
  }

  findAllUsers(userId: string, currentPage: number, name: string) {
    return this.handleRequest<Page<User>>(
      "get",
      `/user/all/${userId}?page=${currentPage}&name=${name}`
    );
  }

  async removeUser(userId: string, isAdmin = false) {
    if (isAdmin) {
      return this.handleRequest<void>("delete", `/user/${userId}`);
    }

    const response = await this.handleRequest<void>(
      "delete",
      `/user/${userId}`
    );
    if (response.success) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return response;
  }

  updateUser(userId: string, userUpdate: Partial<User>) {
    return this.handleRequest<User>("patch", `/user/${userId}`, userUpdate);
  }

  updatePassword(userId: string, userPassword: UserPasswordRequest) {
    return this.handleRequest<void>(
      "patch",
      `/user/password/${userId}`,
      userPassword
    );
  }

  validateIfUserIsAdmin(userId: string) {
    return this.handleRequest<{ isAdmin: boolean }>(
      "get",
      `/user/admin/${userId}`
    );
  }
}
