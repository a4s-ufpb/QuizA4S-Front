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
    const response = await insertThemeMutation.mutateAsync({
      name: values.name,
      imageUrl: values.imageUrl,
      description: values.description,
      materials: values.materials,
    });
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
