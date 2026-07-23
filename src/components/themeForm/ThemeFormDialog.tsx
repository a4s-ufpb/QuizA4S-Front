import { useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  BsCloudUpload,
  BsXLg,
  BsTrashFill,
  BsPlusLg,
  BsCameraVideoFill,
  BsFileEarmarkTextFill,
  BsGlobe2,
} from "react-icons/bs";
import Loading from "../loading/Loading";
import SearchImage from "../searchImageComponent/SearchImage";
import type { Material, MaterialType } from "../../types";

export interface ThemeFormValues {
  name: string;
  imageUrl: string;
  imageFile?: File;
  description: string;
  materials: Material[];
}

interface ThemeFormDialogProps {
  title: string;
  submitLabel: string;
  initial?: Partial<ThemeFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ThemeFormValues) => void;
}

const MAX_THEME_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: "VIDEO", label: "Vídeo" },
  { value: "FILE", label: "Arquivo" },
  { value: "SITE", label: "Site" },
];

export function materialTypeIcon(type: MaterialType) {
  if (type === "VIDEO") return <BsCameraVideoFill />;
  if (type === "FILE") return <BsFileEarmarkTextFill />;
  return <BsGlobe2 />;
}

/**
 * Modal reutilizável para criar/editar um tema: nome, imagem (URL, upload ou
 * pesquisa), texto de conteúdos e lista de materiais de apoio.
 */
const ThemeFormDialog = ({
  title,
  submitLabel,
  initial,
  loading,
  onClose,
  onSubmit,
}: ThemeFormDialogProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [materials, setMaterials] = useState<Material[]>(
    initial?.materials ?? []
  );
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchImage, setSearchImage] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleModeChange(_: unknown, next: "url" | "upload" | null) {
    if (!next) return;
    setImageMode(next);
    setImageUrl("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedFile(null);
    setUploadedFileName(null);
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_THEME_IMAGE_SIZE_BYTES) {
      setFileError("A imagem deve ter no máximo 1MB");
      return;
    }
    setFileError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setUploadedFile(file);
    setUploadedFileName(file.name);
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedFile(null);
    setUploadedFileName(null);
    setImageUrl("");
  }

  function addMaterial() {
    setMaterials((prev) => [...prev, { name: "", link: "", type: "VIDEO" }]);
  }

  function updateMaterial(index: number, patch: Partial<Material>) {
    setMaterials((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
    );
  }

  function removeMaterial(index: number) {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (name.trim().length < 3) {
      setNameError("Mínimo de 3 caracteres");
      return;
    }
    setNameError(null);
    // Só envia materiais preenchidos (nome + link).
    const cleanMaterials = materials
      .map((m) => ({ ...m, name: m.name.trim(), link: m.link.trim() }))
      .filter((m) => m.name !== "" && m.link !== "");

    onSubmit({
      name: name.trim(),
      imageUrl: imageMode === "url" ? imageUrl : "",
      imageFile: imageMode === "upload" ? (uploadedFile ?? undefined) : undefined,
      description: description.trim(),
      materials: cleanMaterials,
    });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            placeholder="Digite o nome do seu tema"
            slotProps={{ htmlInput: { maxLength: 70 } }}
            error={!!nameError}
            helperText={nameError}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Conteúdos abordados"
            placeholder="Descreva os conteúdos que este tema aborda"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Imagem do tema
            </Typography>
            <ToggleButtonGroup
              value={imageMode}
              exclusive
              size="small"
              onChange={handleModeChange}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="url">Por URL</ToggleButton>
              <ToggleButton value="upload">Upload</ToggleButton>
            </ToggleButtonGroup>

            {imageMode === "url" && (
              <TextField
                label="Imagem"
                placeholder="Digite ou pesquise a URL da imagem"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ whiteSpace: "nowrap" }}
                        onClick={() => setSearchImage(true)}
                      >
                        Pesquisar
                      </Button>
                    ),
                  },
                }}
              />
            )}

            {imageMode === "upload" && (
              <Button
                component="label"
                variant="outlined"
                startIcon={<BsCloudUpload />}
                fullWidth
              >
                {uploadedFileName ?? "Selecionar imagem (máx. 1MB)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            )}

            {fileError && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                {fileError}
              </Typography>
            )}

            {(imageMode === "url" ? imageUrl : previewUrl) && (
              <Box sx={{ position: "relative", mt: 2, width: "fit-content" }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Preview
                </Typography>
                <Box
                  component="img"
                  src={imageMode === "url" ? imageUrl : previewUrl!}
                  alt="preview do tema"
                  sx={{
                    width: 160,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={removeImage}
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: -10,
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <BsXLg size={12} />
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2">Materiais de apoio</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<BsPlusLg />}
                onClick={addMaterial}
              >
                Adicionar material
              </Button>
            </Box>

            {materials.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Nenhum material adicionado.
              </Typography>
            )}

            <Stack spacing={1.5}>
              {materials.map((material, index) => (
                <Stack
                  key={index}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ alignItems: { sm: "center" } }}
                >
                  <TextField
                    label="Nome"
                    size="small"
                    value={material.name}
                    onChange={(e) => updateMaterial(index, { name: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Link"
                    size="small"
                    value={material.link}
                    onChange={(e) => updateMaterial(index, { link: e.target.value })}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    select
                    label="Tipo"
                    size="small"
                    value={material.type}
                    onChange={(e) =>
                      updateMaterial(index, { type: e.target.value as MaterialType })
                    }
                    sx={{ minWidth: 130 }}
                  >
                    {MATERIAL_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    color="error"
                    onClick={() => removeMaterial(index)}
                    aria-label="Remover material"
                  >
                    <BsTrashFill />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button variant="contained" color="error" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      {loading && <Loading />}

      {searchImage && (
        <SearchImage
          setSearchImage={setSearchImage}
          getUrlOfImage={(url) => {
            setImageUrl(url);
            setSearchImage(false);
          }}
        />
      )}
    </Dialog>
  );
};

export default ThemeFormDialog;
