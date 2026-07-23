import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Modal,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BsChevronDown,
  BsChevronUp,
  BsCloudUpload,
  BsEye,
  BsTrash,
  BsXLg,
} from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import SearchImage from "../../components/searchImageComponent/SearchImage";
import {
  useUpdateQuestionMutation,
} from "../../query/useQuestionQueries";
import {
  useInsertAlternativeMutation,
  useRemoveAlternativeMutation,
  useUpdateAlternativeMutation,
} from "../../query/useAlternativeQueries";
import {
  ALL_IMAGE_SLOTS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TOTAL_IMAGES_SIZE_BYTES,
  MAX_UPLOAD_IMAGES,
  type ImageSlotKey,
} from "../../util/questionImages";
import type { Alternative, InformationData, Question } from "../../types";

const MIN_ALTERNATIVES = 4;
const MAX_ALTERNATIVES = 6;
const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E", "F"];

const IMAGE_SLOT_LABELS: Record<ImageSlotKey, string> = {
  URL: "Imagem por link",
  IMAGE_1: "Upload 1",
  IMAGE_2: "Upload 2",
};

function isValidImageUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface QuestionEditDialogProps {
  question: Question;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function QuestionEditDialog({
  question: initialQuestion,
  open,
  onClose,
  onSaved,
}: QuestionEditDialogProps) {
  const updateQuestionMutation = useUpdateQuestionMutation();
  const insertAlternativeMutation = useInsertAlternativeMutation();
  const updateAlternativeMutation = useUpdateAlternativeMutation();
  const removeAlternativeMutation = useRemoveAlternativeMutation();

  const [loading, setLoading] = useState(false);
  const [infoBox, setInfoBox] = useState(false);
  const [infoData, setInfoData] = useState<InformationData>({ text: "", color: "red", icon: "exclamation" });
  const [showSearch, setShowSearch] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageOneUrl, setImageOneUrl] = useState("");
  const [imageTwoUrl, setImageTwoUrl] = useState("");
  const [imagesOrder, setImagesOrder] = useState<ImageSlotKey[]>([...ALL_IMAGE_SLOTS]);

  const [uploadFileObjects, setUploadFileObjects] = useState<{ IMAGE_1?: File; IMAGE_2?: File }>({});
  const [blobUrls, setBlobUrls] = useState<{ IMAGE_1?: string; IMAGE_2?: string }>({});
  const [uploadedFileNames, setUploadedFileNames] = useState<{ IMAGE_1?: string; IMAGE_2?: string }>({});

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [originalAltIds, setOriginalAltIds] = useState<number[]>([]);

  // Populate form when dialog opens / question changes
  useEffect(() => {
    if (!open) return;
    setTitle(initialQuestion.title ?? "");
    setImageUrl(initialQuestion.imageUrl ?? "");
    setImageOneUrl(initialQuestion.imageOneUrl ?? "");
    setImageTwoUrl(initialQuestion.imageTwoUrl ?? "");

    const orderFromField = (initialQuestion.imagesOrder ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is ImageSlotKey => ALL_IMAGE_SLOTS.includes(s as ImageSlotKey));
    const missing = ALL_IMAGE_SLOTS.filter((s) => !orderFromField.includes(s));
    setImagesOrder([...orderFromField, ...missing]);

    // Clear uploads
    setBlobUrls({});
    setUploadFileObjects({});
    setUploadedFileNames({});

    const alts = initialQuestion.alternatives ?? [];
    setAlternatives(
      alts.length > 0
        ? alts
        : Array.from({ length: 4 }, () => ({ text: "", correct: false }))
    );
    setOriginalAltIds(alts.map((a) => a.id).filter((id): id is number => id != null));
  }, [open, initialQuestion]);

  function getDisplay(slot: ImageSlotKey): string | undefined {
    if (slot === "URL") return imageUrl || undefined;
    if (slot === "IMAGE_1") return blobUrls.IMAGE_1 || imageOneUrl || undefined;
    return blobUrls.IMAGE_2 || imageTwoUrl || undefined;
  }

  const presentSlots = imagesOrder.filter((s) => Boolean(getDisplay(s)));

  function showInfo(fail: boolean, msg: string) {
    setInfoData({ text: msg, color: fail ? "red" : "green", icon: fail ? "exclamation" : "check" });
    setInfoBox(true);
  }

  function processFiles(files: File[]) {
    const emptySlots: Array<"IMAGE_1" | "IMAGE_2"> = [];
    if (!blobUrls.IMAGE_1 && !imageOneUrl) emptySlots.push("IMAGE_1");
    if (!blobUrls.IMAGE_2 && !imageTwoUrl) emptySlots.push("IMAGE_2");

    if (emptySlots.length === 0) {
      showInfo(true, "Máximo de 2 imagens de upload atingido. Remova uma para adicionar outra.");
      return;
    }

    const toAssign = files.slice(0, Math.min(emptySlots.length, MAX_UPLOAD_IMAGES));
    if (toAssign.find((f) => f.size > MAX_IMAGE_SIZE_BYTES)) {
      showInfo(true, "Cada imagem deve ter no máximo 2MB");
      return;
    }
    if (toAssign.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_IMAGES_SIZE_BYTES) {
      showInfo(true, "O total das imagens enviadas deve ser de no máximo 4MB");
      return;
    }

    const newBlobs = { ...blobUrls };
    const newFiles = { ...uploadFileObjects };
    const newNames = { ...uploadedFileNames };

    toAssign.forEach((file, i) => {
      const slot = emptySlots[i];
      if (newBlobs[slot]) URL.revokeObjectURL(newBlobs[slot]!);
      newBlobs[slot] = URL.createObjectURL(file);
      newFiles[slot] = file;
      newNames[slot] = file.name;
    });

    setBlobUrls(newBlobs);
    setUploadFileObjects(newFiles);
    setUploadedFileNames(newNames);
  }

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    processFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  }

  function removeSlot(slot: ImageSlotKey) {
    if (slot === "URL") { setImageUrl(""); return; }
    const key = slot as "IMAGE_1" | "IMAGE_2";
    if (blobUrls[key]) URL.revokeObjectURL(blobUrls[key]!);
    setBlobUrls((p) => ({ ...p, [key]: undefined }));
    setUploadFileObjects((p) => ({ ...p, [key]: undefined }));
    setUploadedFileNames((p) => ({ ...p, [key]: undefined }));
    if (slot === "IMAGE_1") setImageOneUrl("");
    else setImageTwoUrl("");
  }

  function moveSlot(slot: ImageSlotKey, dir: -1 | 1) {
    setImagesOrder((prev) => {
      const present = prev.filter((s) => Boolean(getDisplay(s)));
      const ci = present.indexOf(slot);
      const ni = ci + dir;
      if (ci === -1 || ni < 0 || ni >= present.length) return prev;
      const reordered = [...present];
      [reordered[ci], reordered[ni]] = [reordered[ni], reordered[ci]];
      const hidden = prev.filter((s) => !present.includes(s));
      return [...reordered, ...hidden];
    });
  }

  function setCorrect(index: number) {
    setAlternatives((prev) => prev.map((a, i) => ({ ...a, correct: i === index })));
  }

  function addAlt() {
    setAlternatives((prev) => {
      if (prev.length >= MAX_ALTERNATIVES) return prev;
      return [...prev, { text: "", correct: false }];
    });
  }

  function removeAlt(index: number) {
    if (index < MIN_ALTERNATIVES) return;
    setAlternatives((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!title.trim()) { showInfo(true, "Título é obrigatório"); return; }
    if (!isValidImageUrl(imageUrl)) { showInfo(true, "URL de imagem inválida"); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    if (imageUrl) fd.append("imageUrl", imageUrl);
    else fd.append("imageUrl", "");

    if (uploadFileObjects.IMAGE_1) fd.append("imageFile1", uploadFileObjects.IMAGE_1);
    else fd.append("imageOneUrl", imageOneUrl || "");

    if (uploadFileObjects.IMAGE_2) fd.append("imageFile2", uploadFileObjects.IMAGE_2);
    else fd.append("imageTwoUrl", imageTwoUrl || "");

    fd.append("imagesOrder", presentSlots.join(","));

    const qRes = await updateQuestionMutation.mutateAsync({
      questionId: initialQuestion.id,
      formData: fd,
    });

    if (!qRes.success) {
      showInfo(true, qRes.message);
      setLoading(false);
      return;
    }

    const removedIds = originalAltIds.filter((id) => !alternatives.some((a) => a.id === id));

    await Promise.all([
      ...alternatives.map((alt) =>
        alt.id
          ? updateAlternativeMutation.mutateAsync({
              alternativeId: alt.id,
              alternativeUpdate: { text: alt.text, correct: alt.correct },
            })
          : insertAlternativeMutation.mutateAsync({
              idQuestion: initialQuestion.id,
              alternative: alt,
            })
      ),
      ...removedIds.map((id) => removeAlternativeMutation.mutateAsync(id)),
    ]);

    setLoading(false);
    showInfo(false, "Questão atualizada com sucesso!");
    setTimeout(() => {
      onSaved();
      onClose();
    }, 800);
  }

  function handleClose() {
    Object.values(blobUrls).forEach((u) => { if (u) URL.revokeObjectURL(u); });
    onClose();
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Editar Questão</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mt: 1,
            }}
          >
            {/* Left column: title + images */}
            <Stack spacing={2}>
              <TextField
                label="Título da questão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                multiline
                minRows={2}
                maxRows={8}
                fullWidth
                required
                slotProps={{ htmlInput: { maxLength: 1500 } }}
              />

              <TextField
                label="URL da imagem"
                placeholder="Insira ou pesquise a URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                fullWidth
                error={!isValidImageUrl(imageUrl)}
                helperText={
                  isValidImageUrl(imageUrl)
                    ? " "
                    : "URL inválida (ex: https://exemplo.com/img.png)"
                }
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />

              <Button variant="outlined" onClick={() => setShowSearch(true)}>
                Pesquisar imagem na web
              </Button>

              <Box
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                sx={{
                  border: "2px dashed",
                  borderColor: isDragging ? "primary.main" : "divider",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  bgcolor: isDragging ? "action.hover" : "transparent",
                  transition: "background-color 0.15s, border-color 0.15s",
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Arraste imagens aqui ou faça upload
                </Typography>
                <Button variant="outlined" component="label" startIcon={<BsCloudUpload />}>
                  Upload de imagens (até 2)
                  <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
                </Button>
              </Box>

              {presentSlots.length > 0 && (
                <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Ordem das imagens
                  </Typography>
                  <Stack spacing={1}>
                    {presentSlots.map((slot, index) => {
                      const src = getDisplay(slot);
                      const label =
                        slot === "URL"
                          ? IMAGE_SLOT_LABELS[slot]
                          : uploadedFileNames[slot as "IMAGE_1" | "IMAGE_2"] ??
                            IMAGE_SLOT_LABELS[slot];
                      return (
                        <Stack key={slot} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Avatar src={src} variant="rounded" sx={{ width: 48, height: 48 }} />
                          <Typography
                            variant="body2"
                            sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={label}
                          >
                            {index + 1}º - {label}
                          </Typography>
                          <IconButton size="small" disabled={index === 0} onClick={() => moveSlot(slot, -1)}>
                            <BsChevronUp />
                          </IconButton>
                          <IconButton size="small" disabled={index === presentSlots.length - 1} onClick={() => moveSlot(slot, 1)}>
                            <BsChevronDown />
                          </IconButton>
                          <IconButton size="small" onClick={() => src && setPreviewImage(src)}>
                            <BsEye />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeSlot(slot)}>
                            <BsXLg />
                          </IconButton>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Stack>

            {/* Right column: alternatives */}
            <Box sx={{ display: { xs: "block", md: "flex" }, justifyContent: "center" }}>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mr: 3 }} />
              <Stack spacing={1.5} sx={{ width: "100%" }}>
                <Typography variant="subtitle1">Alternativas</Typography>
                {alternatives.map((alt, index) => (
                  <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                    <Avatar sx={{ width: 32, height: 32, mt: 1, color: "#fff", bgcolor: "primary.main" }}>
                      {ALTERNATIVE_LABELS[index]}
                    </Avatar>
                    <TextField
                      placeholder="Texto da alternativa"
                      value={alt.text}
                      onChange={(e) =>
                        setAlternatives((prev) =>
                          prev.map((a, i) => (i === index ? { ...a, text: e.target.value } : a))
                        )
                      }
                      multiline
                      minRows={1}
                      maxRows={6}
                      fullWidth
                      required
                      slotProps={{ htmlInput: { maxLength: 500 } }}
                    />
                    <Radio
                      checked={alt.correct}
                      onChange={() => setCorrect(index)}
                      name="edit-alternative"
                      title="Marcar como correta"
                      sx={{ mt: 0.5 }}
                    />
                    {index >= MIN_ALTERNATIVES && (
                      <IconButton size="small" color="error" onClick={() => removeAlt(index)} sx={{ mt: 0.5 }}>
                        <BsTrash />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                {alternatives.length < MAX_ALTERNATIVES && (
                  <Button variant="outlined" onClick={addAlt}>
                    Adicionar Alternativa
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogActions>

        {loading && <Loading />}
        {infoBox && (
          <InformationBox
            text={infoData.text}
            color={infoData.color}
            icon={infoData.icon}
            closeBox={() => setInfoBox(false)}
          />
        )}
      </Dialog>

      {showSearch && (
        <SearchImage
          setSearchImage={setShowSearch}
          getUrlOfImage={(url) => { setImageUrl(url); setShowSearch(false); }}
        />
      )}

      <Modal open={Boolean(previewImage)} onClose={() => setPreviewImage(null)}>
        <Box
          onClick={() => setPreviewImage(null)}
          sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Pré-visualização"
              onClick={(e) => e.stopPropagation()}
              sx={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 2 }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
}
