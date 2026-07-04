import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useAllUsersQuery } from "../../../query/useUserQueries";
import Loading from "../../../components/loading/Loading";
import Pagination from "../../../components/pagination/Pagination";
import SearchComponent from "../../../components/searchComponent/SearchComponent";

import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import UserTemplate from "../../../components/userTemplate/UserTemplate";
import { getStoredUser } from "../../../util/storage";
import type { User } from "../../../types";

function Users() {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState<User[]>([]);

  const [userName, setUserName] = useState("");

  const { uuid: userId } = getStoredUser();

  const usersQuery = useAllUsersQuery(userId, currentPage, userName);
  const loading = usersQuery.isLoading;

  useEffect(() => {
    if (!usersQuery.data) return;

    if (!usersQuery.data.success) {
      setUsers([]);
      setTotalPages(0);
      return;
    }

    setUsers(usersQuery.data.data.content);
    setTotalPages(usersQuery.data.data.totalPages);
  }, [usersQuery.data]);

  function changeName(propsChangeName: string) {
    setUserName(propsChangeName);
  }

  return (
    <Box sx={{ py: 4 }}>
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
    </Box>
  );
}

export default Users;
