import { useState } from "react";
import InformationBox from "../informationBox/InformationBox";
import { useNavigate } from "react-router-dom";
import { useInsertThemeMutation } from "../../query/useThemeQueries";
import ThemeFormDialog, {
  type ThemeFormValues,
} from "../themeForm/ThemeFormDialog";
import type { InformationData, Theme } from "../../types";

interface ThemeMenuProps {
  setThemeMenu: (value: boolean) => void;
}

const ThemeMenu = ({ setThemeMenu }: ThemeMenuProps) => {
  const insertThemeMutation = useInsertThemeMutation();
  const navigate = useNavigate();

  const [informationBox, setInformationBox] = useState(false);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    color: "",
    icon: "",
  });

  function activeInformationBox(isError: boolean, message: string) {
    setInformationData({
      text: message,
      color: isError ? "red" : "green",
      icon: isError ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  function navigateCreateQuestion(theme: Theme) {
    sessionStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/create/quiz/${theme.id}/question`);
  }

  async function handleSubmit(values: ThemeFormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("materials", JSON.stringify(values.materials));
    if (values.imageFile) {
      formData.append("imageFile", values.imageFile);
    } else if (values.imageUrl) {
      formData.append("imageUrl", values.imageUrl);
    }

    const response = await insertThemeMutation.mutateAsync(formData);
    if (response.success) {
      activeInformationBox(false, "Tema criado com sucesso");
      navigateCreateQuestion(response.data);
    } else {
      activeInformationBox(true, response.message);
    }
  }

  return (
    <>
      <ThemeFormDialog
        title="Criar tema"
        submitLabel="Criar"
        loading={insertThemeMutation.isPending}
        onClose={() => setThemeMenu(false)}
        onSubmit={handleSubmit}
      />

      {informationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}
    </>
  );
};

export default ThemeMenu;
