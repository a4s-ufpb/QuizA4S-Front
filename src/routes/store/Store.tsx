import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  BsCoin,
  BsCheckCircleFill,
  BsPersonCircle,
  BsLockFill,
  BsStars,
} from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import { useWalletQuery } from "../../query/useWalletQueries";
import {
  useStoreCatalogQuery,
  usePurchaseItemMutation,
  useEquipItemMutation,
  useUnequipItemMutation,
} from "../../query/useStoreQueries";
import { useFindUserQuery } from "../../query/useUserQueries";
import { TitleBadge, FramedAvatar, bannerClassName, PlayerName } from "../../components/cosmetics/Cosmetic";
import type { StoreItemResponse } from "../../types";

type Category = "TITLE" | "AVATAR_FRAME" | "BANNER" | "FONT" | "NAME_STYLE" | "NAME_EFFECT";

const CATEGORIES: Category[] = ["TITLE", "AVATAR_FRAME", "BANNER", "FONT", "NAME_STYLE", "NAME_EFFECT"];

const CATEGORY_LABELS: Record<Category, string> = {
  TITLE: "Títulos",
  AVATAR_FRAME: "Molduras",
  BANNER: "Banners",
  FONT: "Fontes",
  NAME_STYLE: "Estilo do nome",
  NAME_EFFECT: "Efeito do nome",
};

// Descrição exibida uma vez no topo (não mais em cada card).
const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  TITLE: "Títulos aparecem ao lado do seu nome no perfil e nas salas multiplayer.",
  AVATAR_FRAME: "Molduras decoram o seu avatar no perfil, no lobby e nas partidas.",
  BANNER: "Banners são a faixa de fundo do seu nome nas listas, placares e chaveamentos.",
  FONT: "Fontes mudam o tipo de letra do seu nome no perfil.",
  NAME_STYLE: "Estilos deixam o seu nome em negrito, itálico, sublinhado, etc.",
  NAME_EFFECT: "Efeitos dão cor, gradiente e animação ao seu nome.",
};

/** Prévia visual do item, pra o jogador ver antes de comprar/equipar. */
function CosmeticPreview({ item }: { item: StoreItemResponse }) {
  if (item.category === "TITLE") {
    return (
      <Box sx={{ my: 1 }}>
        <span style={{ fontWeight: "bold" }}>Jogador</span>
        <TitleBadge code={item.code} />
      </Box>
    );
  }
  if (item.category === "AVATAR_FRAME") {
    return (
      <Box sx={{ my: 1 }}>
        <FramedAvatar code={item.code} size={44}>
          <BsPersonCircle color="#3f7fd6" />
        </FramedAvatar>
      </Box>
    );
  }
  if (item.category === "FONT" || item.category === "NAME_STYLE" || item.category === "NAME_EFFECT") {
    return (
      <Box sx={{ my: 1, fontSize: "1.15rem" }}>
        <PlayerName
          name="Jogador"
          font={item.category === "FONT" ? item.code : undefined}
          style={item.category === "NAME_STYLE" ? item.code : undefined}
          effect={item.category === "NAME_EFFECT" ? item.code : undefined}
        />
      </Box>
    );
  }
  return (
    <Box
      className={bannerClassName(item.code)}
      sx={{ my: 1, height: 36, borderRadius: 1, display: "flex", alignItems: "center", px: 1 }}
    >
      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
        Prévia do banner
      </Typography>
    </Box>
  );
}

/** Cartão mostrando a aparência atual do usuário (reflete equipar/desequipar). */
function EquippedPreview({
  name,
  title,
  frame,
  banner,
  font,
  nameStyle,
  nameEffect,
}: {
  name: string;
  title?: string | null;
  frame?: string | null;
  banner?: string | null;
  font?: string | null;
  nameStyle?: string | null;
  nameEffect?: string | null;
}) {
  return (
    <Card elevation={3} sx={{ mb: 3, overflow: "hidden" }}>
      <Box
        className={bannerClassName(banner)}
        sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}
      >
        <FramedAvatar code={frame} size={64}>
          <BsPersonCircle size={40} color="#3f7fd6" />
        </FramedAvatar>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <BsStars /> Sua aparência atual
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: "1.25rem" }}>
            <PlayerName name={name} font={font} style={nameStyle} effect={nameEffect} sx={{ fontWeight: "bold" }} />
            <TitleBadge code={title} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {[
              title ? "título" : null,
              frame ? "moldura" : null,
              banner ? "banner" : null,
              font ? "fonte" : null,
              nameStyle ? "estilo" : null,
              nameEffect ? "efeito" : null,
            ].filter(Boolean).join(" · ") || "nenhum cosmético equipado"}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

const Store = () => {
  const walletQuery = useWalletQuery();
  const catalogQuery = useStoreCatalogQuery();
  const userQuery = useFindUserQuery();
  const purchaseMutation = usePurchaseItemMutation();
  const equipMutation = useEquipItemMutation();
  const unequipMutation = useUnequipItemMutation();

  const [category, setCategory] = useState<Category>("TITLE");

  const coins = walletQuery.data?.success ? walletQuery.data.data.coins : 0;
  const items = catalogQuery.data?.success ? catalogQuery.data.data : [];
  const user = userQuery.data?.success ? userQuery.data.data : null;
  const level = user?.level ?? 1;

  const equippedByCategory: Record<string, string | null | undefined> = {
    TITLE: user?.equippedTitle,
    AVATAR_FRAME: user?.equippedFrame,
    BANNER: user?.equippedBanner,
    FONT: user?.equippedFont,
    NAME_STYLE: user?.equippedNameStyle,
    NAME_EFFECT: user?.equippedNameEffect,
  };

  const visibleItems = items
    .filter((i) => i.category === category)
    .sort((a, b) => a.requiredLevel - b.requiredLevel || a.price - b.price);

  async function handlePurchase(itemCode: string) {
    const response = await purchaseMutation.mutateAsync(itemCode);
    if (!response.success) {
      window.alert(response.message || "Não foi possível comprar o item.");
    }
  }

  function isEquipped(item: StoreItemResponse) {
    return equippedByCategory[item.category] === item.code;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4">Loja</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip icon={<BsStars />} label={`Nível ${level}`} color="info" sx={{ fontWeight: "bold", py: 2.5 }} />
          <Tooltip
            arrow
            title="Ganhe moedas jogando (5 por acerto, +30 se acertar tudo). Alguns itens só desbloqueiam a partir de um nível."
          >
            <Chip
              icon={<BsCoin />}
              label={`${coins} moedas`}
              color="warning"
              sx={{ fontWeight: "bold", fontSize: "1em", py: 2.5, cursor: "help" }}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Reflete os cosméticos equipados ao vivo (item 2). */}
      {user && (
        <EquippedPreview
          name={user.name}
          title={user.equippedTitle}
          frame={user.equippedFrame}
          banner={user.equippedBanner}
          font={user.equippedFont}
          nameStyle={user.equippedNameStyle}
          nameEffect={user.equippedNameEffect}
        />
      )}

      {/* Filtro por tipo de cosmético (item 2). */}
      <ToggleButtonGroup
        exclusive
        value={category}
        onChange={(_e, next) => next && setCategory(next as Category)}
        sx={{ mb: 2, flexWrap: "wrap", width: "100%", gap: "4px" }}
      >
        {CATEGORIES.map((c) => (
          <ToggleButton
            key={c}
            value={c}
            sx={{
              flex: "1 1 auto",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              border: "2px solid #3f7fd6 !important",
              color: "#3f7fd6",
              borderRadius: "8px !important",
              "&.Mui-selected": {
                bgcolor: "#3f7fd6",
                color: "#fff",
                "&:hover": { bgcolor: "#2c63b5" },
              },
              "&:hover": { bgcolor: "rgba(63,127,214,0.1)" },
            }}
          >
            {CATEGORY_LABELS[c]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Alert severity="info" sx={{ mb: 3 }}>
        {CATEGORY_DESCRIPTIONS[category]}
      </Alert>

      {catalogQuery.isLoading ? (
        <Loading />
      ) : (
        <Grid container spacing={2}>
          {visibleItems.map((item) => {
            const locked = !item.owned && level < item.requiredLevel;
            return (
              <Grid key={item.code} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  elevation={2}
                  sx={{ height: "100%", display: "flex", flexDirection: "column", opacity: locked ? 0.75 : 1 }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6">{item.name}</Typography>
                      <Chip
                        size="small"
                        color={locked ? "default" : "success"}
                        icon={locked ? <BsLockFill /> : undefined}
                        label={`Nível ${item.requiredLevel}`}
                      />
                    </Box>
                    <CosmeticPreview item={item} />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", gap: 1, alignItems: "stretch" }}>
                    {item.owned ? (
                      isEquipped(item) ? (
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<BsCheckCircleFill />}
                          onClick={() => unequipMutation.mutate(item.category)}
                        >
                          Equipado (remover)
                        </Button>
                      ) : (
                        <Button fullWidth variant="outlined" onClick={() => equipMutation.mutate(item.code)}>
                          Equipar
                        </Button>
                      )
                    ) : locked ? (
                      <Button fullWidth variant="outlined" color="inherit" disabled startIcon={<BsLockFill />}>
                        Requer nível {item.requiredLevel}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={coins < item.price}
                        onClick={() => handlePurchase(item.code)}
                      >
                        Comprar por {item.price} <BsCoin style={{ marginLeft: 6 }} />
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Store;
