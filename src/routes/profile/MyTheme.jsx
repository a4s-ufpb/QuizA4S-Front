import { useEffect, useState } from "react";
import Pagination from "../../components/pagination/Pagination";
import Theme from "../../components/theme/Theme";
import Loading from "../../components/loading/Loading";
import SearchComponent from "../../components/searchComponent/SearchComponent";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";
import { ThemeService } from "../../service/ThemeService";
import { UserService } from "../../service/UserService";

import "./MyTheme.css";

const MyTheme = () => {
  const themeService = new ThemeService();
  const userService = new UserService();

  const [loading, setLoading] = useState(false);

  const [themes, setThemes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [callBack, setCallBack] = useState({});

  const [themeName, setThemeName] = useState("");

  function changeName(propsThemeName) {
    setThemeName(propsThemeName);
  }

  const { uuid: userId } = JSON.parse(localStorage.getItem("user"));

  async function fetchData() {
    setLoading(true);
    const validateUser = await userService.validateIfUserIsAdmin(userId);

    if (validateUser.data.isAdmin) {
      const pageOfAllThemes = await themeService.findAllThemes(
        themeName,
        currentPage
      );
      setTotalPages(pageOfAllThemes.data.totalPages);
      setThemes(pageOfAllThemes.data.content);
      setLoading(false);
      return;
    }

    const pageOfThemesByCreator = await themeService.findThemesByCreator(
      themeName,
      currentPage
    );
    setTotalPages(pageOfThemesByCreator.totalPages);
    setThemes(pageOfThemesByCreator.content);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [currentPage, callBack]);

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

      <Theme
        themes={themes}
        setThemes={setThemes}
        setCurrentPage={setCurrentPage}
        setCallBack={setCallBack}
      />

      {!loading && themes.length == 0 && (
        <NotFoundComponent title="Tema não encontrado" />
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {loading && <Loading />}
    </div>
  );
};

export default MyTheme;
