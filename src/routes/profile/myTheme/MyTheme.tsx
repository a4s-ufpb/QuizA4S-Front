import { useEffect, useState } from "react";
import Pagination from "../../../components/pagination/Pagination";
import Theme from "../../../components/theme/Theme";
import Loading from "../../../components/loading/Loading";
import SearchComponent from "../../../components/searchComponent/SearchComponent";
import { useIsAdminQuery } from "../../../query/useUserQueries";
import {
  useAllThemesQuery,
  useThemesByCreatorQuery,
} from "../../../query/useThemeQueries";
import { getStoredUser } from "../../../util/storage";
import type { Theme as ThemeModel } from "../../../types";

import "./MyTheme.css";

const MyTheme = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [themeName, setThemeName] = useState("");
  const [themes, setThemes] = useState<ThemeModel[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  function changeName(propsThemeName: string) {
    setThemeName(propsThemeName);
  }

  const { uuid: userId } = getStoredUser();

  const isAdminQuery = useIsAdminQuery(userId);
  const isAdmin = isAdminQuery.data?.data.isAdmin ?? false;
  const isAdminKnown = isAdminQuery.isSuccess;

  const allThemesQuery = useAllThemesQuery(
    themeName,
    currentPage,
    isAdminKnown && isAdmin
  );
  const creatorThemesQuery = useThemesByCreatorQuery(
    themeName,
    currentPage,
    isAdminKnown && !isAdmin
  );

  const activeQuery = isAdmin ? allThemesQuery : creatorThemesQuery;
  const loading = isAdminQuery.isLoading || activeQuery.isLoading;

  // A busca em texto (SearchComponent) já traz o resultado pronto da API e
  // sobrescreve `themes` diretamente; fora isso, `themes` reflete a query.
  useEffect(() => {
    if (activeQuery.data?.success) {
      setThemes(activeQuery.data.data.content || []);
      setTotalPages(activeQuery.data.data.totalPages || 0);
    } else if (activeQuery.data && !activeQuery.data.success) {
      setThemes([]);
      setTotalPages(0);
    }
  }, [activeQuery.data]);

  return (
    <div className="container-my-theme">
      <SearchComponent
        placeholder="Digite o nome de um tema"
        setData={setThemes}
        url={`/theme/creator?page=${currentPage}&name=`}
        setCurrentPage={setCurrentPage}
        setTotalPages={setTotalPages}
        onSearch={changeName}
      />

      <Theme themes={themes} setThemes={setThemes} setCurrentPage={setCurrentPage} />

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        color={"dark"}
      />

      {loading && <Loading />}
    </div>
  );
};

export default MyTheme;
