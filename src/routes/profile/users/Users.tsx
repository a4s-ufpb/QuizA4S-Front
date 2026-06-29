import { useEffect, useState } from "react";
import { UserService } from "../../../service/UserService";
import Loading from "../../../components/loading/Loading";
import Pagination from "../../../components/pagination/Pagination";
import SearchComponent from "../../../components/searchComponent/SearchComponent";

import "./Users.css";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import UserTemplate from "../../../components/userTemplate/UserTemplate";
import { getStoredUser } from "../../../util/storage";
import type { User } from "../../../types";

function Users() {
  const userService = new UserService();
  const [users, setUsers] = useState<User[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [callBack, setCallBack] = useState<object>({});

  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("");

  const { uuid: userId } = getStoredUser();

  async function fetchData() {
    try {
      setLoading(true);
      const response = await userService.findAllUsers(
        userId,
        currentPage,
        userName
      );

      if (!response.success) {
        setUsers([]);
        setTotalPages(0);
        return;
      }

      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function changeName(propsChangeName: string) {
    setUserName(propsChangeName);
  }

  useEffect(() => {
    fetchData();
  }, [currentPage, callBack]);

  return (
    <div className="container-external-users">
      <SearchComponent
        title=""
        placeholder="Digite o nome de um usuário"
        setCurrentPage={setCurrentPage}
        setTotalPages={setTotalPages}
        setData={setUsers}
        onSearch={changeName}
        url={`/user/all/${userId}?page=${currentPage}&name=`}
      />

      <UserTemplate
        users={users}
        setUsers={setUsers}
        setCurrentPage={setCurrentPage}
        setCallBack={setCallBack}
      />

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}

      {!loading && users.length == 0 && (
        <NotFoundComponent title="Nenhum usuário cadastrado" />
      )}
    </div>
  );
}

export default Users;
