// Components
import { useLayoutEffect, useState } from "react";
import Loading from "../loading/Loading";
import SearchComponent from "../searchComponent/SearchComponent";
import NotFoundComponent from "../notFound/NotFoundComponent";
import Pagination from "../pagination/Pagination";
import { DEFAULT_IMG } from "../../vite-env";

//Css
import "./ThemeTemplate.css";
import { UserService } from "../../service/UserService";
import { ThemeService } from "../../service/ThemeService";

const ThemeTemplate = ({ path, onClickFunction }) => {

  const userService = new UserService();
  const themeService = new ThemeService();

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  useLayoutEffect(() => {
    fetchData();
  }, [currentPage, path, themeName]);

  return (
    <div className="container-theme outlet">
      <SearchComponent
        title="Escolha o tema do seu Quiz"
        url={`${path}?page=${currentPage}&name=`}
        placeholder="Digite o nome de um tema"
        onSearch={changeName}
        setCurrentPage={setCurrentPage}
        setData={setThemes}
        setTotalPages={setTotalPages}
      />

      <div className="container-theme-data">
        {themes &&
          themes.map((theme) => (
            <div
              className="theme"
              key={theme.id}
              onClick={() => onClickFunction(theme)}
            >
              <img
                src={
                  theme.imageUrl == null || theme.imageUrl == ""
                    ? DEFAULT_IMG
                    : theme.imageUrl
                }
                alt="theme-image"
                loading="lazy"
              />
              <p>{theme.name}</p>
            </div>
          ))}

        {!loading && themes.length == 0 && (
          <NotFoundComponent title="Tema não encontrado!" />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}
    </div>
  );
};

export default ThemeTemplate;
