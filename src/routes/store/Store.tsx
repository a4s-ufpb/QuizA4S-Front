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
} from "@mui/material";
import { BsCoin, BsCheckCircleFill, BsPersonCircle } from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import { useWalletQuery } from "../../query/useWalletQueries";
import {
  useStoreCatalogQuery,
  usePurchaseItemMutation,
  useEquipItemMutation,
  useUnequipItemMutation,
} from "../../query/useStoreQueries";
import { useFindUserQuery } from "../../query/useUserQueries";
import { TitleBadge, FramedAvatar, bannerClassName } from "../../components/cosmetics/Cosmetic";
import type { StoreItemResponse } from "../../types";

const CATEGORY_LABELS: Record<string, string> = {
  TITLE: "Título",
  AVATAR_FRAME: "Moldura de avatar",
  BANNER: "Banner",
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

const Store = () => {
  const walletQuery = useWalletQuery();
  const catalogQuery = useStoreCatalogQuery();
  const userQuery = useFindUserQuery();
  const purchaseMutation = usePurchaseItemMutation();
  const equipMutation = useEquipItemMutation();
  const unequipMutation = useUnequipItemMutation();

  const coins = walletQuery.data?.success ? walletQuery.data.data.coins : 0;
  const items = catalogQuery.data?.success ? catalogQuery.data.data : [];
  const user = userQuery.data?.success ? userQuery.data.data : null;

  const equippedByCategory: Record<string, string | null | undefined> = {
    TITLE: user?.equippedTitle,
    AVATAR_FRAME: user?.equippedFrame,
    BANNER: user?.equippedBanner,
  };

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Loja</Typography>
        <Chip
          icon={<BsCoin />}
          label={`${coins} moedas`}
          color="warning"
          sx={{ fontWeight: "bold", fontSize: "1em", py: 2.5 }}
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ganhe moedas jogando (5 por acerto, +30 se acertar tudo). Itens são só cosméticos —
        não afetam a pontuação. Equipe títulos, molduras e banners para aparecerem no seu
        perfil e nas salas multiplayer.
      </Alert>

      {catalogQuery.isLoading ? (
        <Loading />
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.code} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip size="small" label={CATEGORY_LABELS[item.category]} sx={{ mb: 1 }} />
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
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
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => equipMutation.mutate(item.code)}
                      >
                        Equipar
                      </Button>
                    )
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
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Store;
