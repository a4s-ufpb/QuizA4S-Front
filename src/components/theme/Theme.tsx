import { useState, type Dispatch, type SetStateAction } from "react";
import { BsTrashFill, BsPencilSquare } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import ThemeFormDialog, {
  type ThemeFormValues,
} from "../themeForm/ThemeFormDialog";
import { DEFAULT_IMG } from "../../vite-env";
import { useNavigate } from "react-router-dom";
import {
  useRemoveThemeMutation,
  useUpdateThemeMutation,
} from "../../query/useThemeQueries";

import "./Theme.css";
import NotFoundComponent from "../notFound/NotFoundComponent";
import type { InformationData, Theme as ThemeModel } from "../../types";

interface ThemeProps {
  themes: ThemeModel[];
  setThemes: Dispatch<SetStateAction<ThemeModel[]>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

const Theme = ({ themes, setThemes, setCurrentPage }: ThemeProps) => {
  const removeThemeMutation = useRemoveThemeMutation();
  const updateThemeMutation = useUpdateThemeMutation();

  const navigate = useNavigate();

  const loading = removeThemeMutation.isPending || updateThemeMutation.isPending;

  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeModel | null>(null);
  const [themeId, setThemeId] = useState(0);

  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "",
    color: "",
  });

  function showConfirmBox(id: number) {
    setThemeId(id);
    setConfirmBox(true);
  }

  async function removeTheme() {
    const response = await removeThemeMutation.mutateAsync(themeId);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setThemes(themes.filter((theme) => themeId !== theme.id));
    setCurrentPage(0);
    activeInformationBox(false, "Tema removido com sucesso!");
    setConfirmBox(false);
  }

  async function updateTheme(values: ThemeFormValues) {
    if (!editingTheme) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("materials", JSON.stringify(values.materials));
    if (values.imageFile) {
      formData.append("imageFile", values.imageFile);
    } else if (values.imageUrl) {
      formData.append("imageUrl", values.imageUrl);
    }

    const response = await updateThemeMutation.mutateAsync({
      themeId: editingTheme.id,
      formData,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    // Reflete as alterações na listagem sem refetch.
    setThemes(
      themes.map((theme) =>
        theme.id === editingTheme.id ? response.data : theme
      )
    );
    activeInformationBox(false, "Tema atualizado com sucesso");
    setEditingTheme(null);
  }

  function activeInformationBox(isFail: boolean, message: string) {
    setInformationData({
      text: message,
      color: isFail ? "red" : "green",
      icon: isFail ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  function showQuestions(id: number, name: string, imageUrl: string) {
    const theme = { id, name, imageUrl };
    sessionStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/profile/theme/${id}/question`);
  }

  return (
    <div className="my-theme-list">
      {themes &&
        themes.map((theme) => (
          <div key={theme.id} className="theme-data">
            <img
              src={
                theme.imageUrl == null || theme.imageUrl == ""
                  ? DEFAULT_IMG
                  : theme.imageUrl
              }
              alt="image"
              loading="lazy"
            />
            <div className="theme-questions">
              <p>{theme.name}</p>
              <button
                type="button"
                onClick={() =>
                  showQuestions(theme.id, theme.name, theme.imageUrl)
                }
              >
                Questões
              </button>
            </div>
            <div className="theme-action">
              <BsTrashFill onClick={() => showConfirmBox(theme.id)} />
              <BsPencilSquare onClick={() => setEditingTheme(theme)} />
            </div>
          </div>
        ))}

      {!loading && themes.length == 0 && (
        <NotFoundComponent title="Nenhum tema encontrado" />
      )}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja remover este tema?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeTheme}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}

      {editingTheme && (
        <ThemeFormDialog
          title="Atualizar tema"
          submitLabel="Salvar"
          loading={updateThemeMutation.isPending}
          initial={{
            name: editingTheme.name,
            imageUrl: editingTheme.imageUrl,
            description: editingTheme.description ?? "",
            materials: editingTheme.materials ?? [],
          }}
          onClose={() => setEditingTheme(null)}
          onSubmit={updateTheme}
        />
      )}

      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {loading && <Loading />}
    </div>
  );
};

export default Theme;
