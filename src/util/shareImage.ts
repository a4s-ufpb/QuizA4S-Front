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

// ---------- imagem do chaveamento de torneio ----------

interface TournamentMatchImg {
  player1: string | null;
  player2: string | null;
  winnerId: string | null;
  player1Id: string | null;
  player2Id: string | null;
}

interface TournamentImageData {
  name: string;
  /** rounds[r] = confrontos daquela rodada (nomes já resolvidos). */
  rounds: TournamentMatchImg[][];
  roundLabels: string[];
  championName: string | null;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}

/** Desenha o chaveamento completo do torneio numa imagem PNG para compartilhar. */
export function generateTournamentImage(data: TournamentImageData): string {
  const colW = 210;
  const boxW = 180;
  const boxH = 58;
  const rowGap = 26;
  const topPad = 130;
  const bottomPad = 40;
  const roundsCount = data.rounds.length;
  const firstRoundCount = roundsCount > 0 ? data.rounds[0].length : 1;

  const slot = boxH + rowGap;
  const bodyH = firstRoundCount * slot;
  const width = (roundsCount + 1) * colW + 60;
  const height = topPad + bodyH + bottomPad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#2b1055");
  gradient.addColorStop(1, "#2575fc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Cabeçalho: nome do torneio.
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Poppins', sans-serif";
  ctx.fillText("Quiz A4S · Torneio", width / 2, 48);
  ctx.font = "bold 34px 'Poppins', sans-serif";
  ctx.fillText(truncate(ctx, data.name, width - 80), width / 2, 90);

  // Centro vertical de cada confronto (alinhamento de chaveamento).
  const centers: number[][] = [];
  for (let r = 0; r < roundsCount; r++) {
    const round = data.rounds[r];
    const arr: number[] = [];
    for (let i = 0; i < round.length; i++) {
      if (r === 0) {
        arr.push(topPad + i * slot + boxH / 2);
      } else {
        const prev = centers[r - 1];
        arr.push((prev[2 * i] + prev[2 * i + 1]) / 2);
      }
    }
    centers.push(arr);
  }

  const marginX = 30;
  ctx.textAlign = "left";

  for (let r = 0; r < roundsCount; r++) {
    const x = marginX + r * colW;
    const round = data.rounds[r];

    // Rótulo da rodada.
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 15px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.roundLabels[r] ?? `Rodada ${r + 1}`, x + boxW / 2, topPad - 26);
    ctx.textAlign = "left";

    for (let i = 0; i < round.length; i++) {
      const match = round[i];
      const cy = centers[r][i];
      const y = cy - boxH / 2;

      // Caixa do confronto.
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      roundRect(ctx, x, y, boxW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, boxW, boxH, 10);
      ctx.stroke();

      drawSlot(ctx, match.player1, match.winnerId != null && match.winnerId === match.player1Id, x + 12, y + 22);
      drawSlot(ctx, match.player2, match.winnerId != null && match.winnerId === match.player2Id, x + 12, y + 44);

      // Conector para a próxima coluna.
      const nextX = marginX + (r + 1) * colW;
      const midX = (x + boxW + nextX) / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + boxW, cy);
      ctx.lineTo(midX, cy);
      if (r < roundsCount - 1 && i % 2 === 0 && centers[r][i + 1] != null) {
        const cy2 = centers[r][i + 1];
        ctx.moveTo(midX, cy);
        ctx.lineTo(midX, cy2);
        ctx.moveTo(midX, (cy + cy2) / 2);
        ctx.lineTo(nextX, (cy + cy2) / 2);
      } else if (r === roundsCount - 1) {
        ctx.lineTo(nextX, cy);
      }
      ctx.stroke();
    }
  }

  // Campeão (coluna final).
  const champX = marginX + roundsCount * colW;
  const champY = centers.length > 0 && centers[roundsCount - 1].length > 0 ? centers[roundsCount - 1][0] : height / 2;
  ctx.textAlign = "center";
  ctx.font = "40px serif";
  ctx.fillText("🏆", champX + boxW / 2, champY - 4);
  ctx.fillStyle = "#ffd54a";
  ctx.font = "bold 20px 'Poppins', sans-serif";
  ctx.fillText("Campeão", champX + boxW / 2, champY + 30);
  if (data.championName) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Poppins', sans-serif";
    ctx.fillText(truncate(ctx, data.championName, boxW), champX + boxW / 2, champY + 58);
  }

  return canvas.toDataURL("image/png");
}

function drawSlot(ctx: CanvasRenderingContext2D, name: string | null, isWinner: boolean, x: number, y: number) {
  ctx.fillStyle = isWinner ? "#7CFFB2" : "#e6e9f5";
  ctx.font = isWinner ? "bold 15px 'Poppins', sans-serif" : "14px 'Poppins', sans-serif";
  ctx.fillText(truncate(ctx, name ?? "—", 150) + (isWinner ? "  ✓" : ""), x, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
