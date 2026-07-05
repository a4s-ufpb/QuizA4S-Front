// Gera uma imagem (PNG) resumindo o resultado da partida, pra compartilhar/baixar.

interface ShareImageData {
  themeName: string;
  playerName: string;
  rank?: number;
  score: number;
  total: number;
}

export function generateResultImage(data: ShareImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 800, 450);
  gradient.addColorStop(0, "#78b9f2");
  gradient.addColorStop(1, "#0055cc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 450);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = "bold 34px 'Poppins', sans-serif";
  ctx.fillText("Quiz A4S", 400, 70);

  ctx.font = "bold 26px 'Poppins', sans-serif";
  ctx.fillText(data.themeName, 400, 115);

  const rankLabel =
    data.rank === undefined
      ? "Resultado"
      : data.rank === 0
        ? "🥇 1º lugar"
        : data.rank === 1
          ? "🥈 2º lugar"
          : data.rank === 2
            ? "🥉 3º lugar"
            : `${data.rank + 1}º lugar`;

  ctx.font = "bold 54px 'Poppins', sans-serif";
  ctx.fillText(rankLabel, 400, 220);

  ctx.font = "28px 'Poppins', sans-serif";
  ctx.fillText(data.playerName, 400, 275);

  ctx.font = "bold 40px 'Poppins', sans-serif";
  ctx.fillText(`${data.score} pontos`, 400, 340);

  ctx.font = "18px 'Poppins', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(`${data.total} questões respondidas`, 400, 375);

  return canvas.toDataURL("image/png");
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
