import { useEffect, useState } from "react";
import Pagination from "../../../components/pagination/Pagination";
import Theme from "../../../components/theme/Theme";
import Loading from "../../../components/loading/Loading";
import SearchComponent from "../../../components/searchComponent/SearchComponent";
import { ThemeService } from "../../../service/ThemeService";
import { UserService } from "../../../service/UserService";

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

    try {
      const validateUser = await userService.validateIfUserIsAdmin(userId);
      const isAdmin = validateUser.data.isAdmin;

      const fetchThemes = isAdmin
        ? themeService.findAllThemes(themeName, currentPage)
        : themeService.findThemesByCreator(themeName, currentPage);

      const response = await fetchThemes;

      if (!response.success) {
        handleNoThemes();
        return;
      }

      setTotalPages(response.data.totalPages || 0);
      setThemes(response.data.content || []);
    } catch (error) {
      handleNoThemes();
    } finally {
      setLoading(false);
    }
  }

  function handleNoThemes() {
    setTotalPages(0);
    setThemes([]);
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
