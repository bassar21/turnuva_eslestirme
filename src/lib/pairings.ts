// Site ile Python çekiliş aracı (draw/formats.py) arasındaki TEK entegrasyon
// noktası. Bu dosyadaki dilbilgisi draw/formats.py'de birebir tekrarlanır —
// biri değişirse diğeri de değişmelidir.
//
// Bu modül yalnızca EŞLEŞTİRME SONUCUNU (Python -> site) ayrıştırır.
// Katılımcı ve kazanan listeleri (site -> Python) yalnızca ÜRETİLİR, çünkü
// onları tüketen taraf Python aracıdır.

export type ParsedMatch = { p1: string; p2: string | null };

export type ParsedPairings = {
  tournamentHint: string | null;
  roundHint: number | null;
  matches: ParsedMatch[];
};

export class PairingsParseError extends Error {
  line?: number;
  constructor(message: string, line?: number) {
    super(message);
    this.line = line;
  }
}

const VS_SEPARATOR = /\s+(?:vs|VS|Vs)\s+|\s+–\s+/;
const BYE_PATTERN = /^(.+?)\s*[-–]\s*BAY(?:\s+GE[ÇC]T[İI])?$/i;
const LEADING_NUMBER = /^\s*\d+[.)]\s*/;
const HEADER_PATTERN = /^#.*?TUR\s*(\d+)/i;

export type Participant = {
  fullName: string;
  sinif: string;
  bolum: string;
  sube: string;
};

/** Girdi metninin JSON mu düz metin mi olduğunu otomatik algılar ve ayrıştırır. */
export function parsePairings(input: string): ParsedPairings {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new PairingsParseError("Yapıştırılan metin boş.");
  }
  if (trimmed.startsWith("{")) {
    return parsePairingsJSON(trimmed);
  }
  return parsePairingsText(trimmed);
}

function parsePairingsJSON(text: string): ParsedPairings {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new PairingsParseError(
      `JSON ayrıştırılamadı: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (typeof data !== "object" || data === null || !("matches" in data)) {
    throw new PairingsParseError('JSON içinde "matches" alanı bulunamadı.');
  }
  const obj = data as {
    tournament?: unknown;
    round?: unknown;
    matches?: unknown;
  };
  if (!Array.isArray(obj.matches)) {
    throw new PairingsParseError('"matches" bir dizi olmalı.');
  }

  const matches: ParsedMatch[] = obj.matches.map((raw, idx) => {
    if (typeof raw !== "object" || raw === null) {
      throw new PairingsParseError(`${idx + 1}. maç geçersiz.`);
    }
    const m = raw as { p1?: unknown; p2?: unknown };
    if (typeof m.p1 !== "string" || !m.p1.trim()) {
      throw new PairingsParseError(`${idx + 1}. maçta "p1" ismi eksik.`);
    }
    const p2 = m.p2 === null || m.p2 === undefined ? null : m.p2;
    if (p2 !== null && (typeof p2 !== "string" || !p2.trim())) {
      throw new PairingsParseError(`${idx + 1}. maçta "p2" geçersiz.`);
    }
    return { p1: m.p1.trim(), p2: p2 === null ? null : (p2 as string).trim() };
  });

  return {
    tournamentHint: typeof obj.tournament === "string" ? obj.tournament : null,
    roundHint: typeof obj.round === "number" ? obj.round : null,
    matches,
  };
}

function parsePairingsText(text: string): ParsedPairings {
  const lines = text.split(/\r?\n/);
  let tournamentHint: string | null = null;
  let roundHint: number | null = null;
  const matches: ParsedMatch[] = [];

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith("#")) {
      const headerMatch = line.match(HEADER_PATTERN);
      if (headerMatch) {
        roundHint = Number(headerMatch[1]);
      }
      const tournamentMatch = line.match(/^#\s*([A-ZÇĞİÖŞÜa-zçğıöşü]+)/);
      if (tournamentMatch) {
        tournamentHint = tournamentMatch[1];
      }
      return; // başlık/yorum satırı, maç değil
    }

    const withoutNumber = line.replace(LEADING_NUMBER, "");

    const byeMatch = withoutNumber.match(BYE_PATTERN);
    if (byeMatch) {
      const name = byeMatch[1].trim();
      if (!name) {
        throw new PairingsParseError(`Satır ${lineNo}: bay geçen isim boş.`, lineNo);
      }
      matches.push({ p1: name, p2: null });
      return;
    }

    const parts = withoutNumber.split(VS_SEPARATOR);
    if (parts.length !== 2) {
      throw new PairingsParseError(
        `Satır ${lineNo}: "${line}" anlaşılamadı. Beklenen biçim: "İsim1 vs İsim2" veya "İsim - BAY GEÇTİ".`,
        lineNo
      );
    }
    const [p1, p2] = parts.map((s) => s.trim());
    if (!p1 || !p2) {
      throw new PairingsParseError(`Satır ${lineNo}: isimlerden biri boş.`, lineNo);
    }
    matches.push({ p1, p2 });
  });

  if (matches.length === 0) {
    throw new PairingsParseError("Metin içinde ayrıştırılabilir hiçbir maç bulunamadı.");
  }

  return { tournamentHint, roundHint, matches };
}

// ---------------------------------------------------------------------------
// Üretim (site -> Python): katılımcı listesi ve kazanan listesi
// ---------------------------------------------------------------------------

export function formatParticipantsText(participants: Participant[]): string {
  return participants
    .map((p) => `${p.fullName} (${p.sinif} / ${p.bolum} / ${p.sube})`)
    .join("\n");
}

export function formatParticipantsJSON(participants: Participant[]): string {
  return JSON.stringify(
    participants.map((p) => ({
      name: p.fullName,
      sinif: p.sinif,
      bolum: p.bolum,
      sube: p.sube,
    })),
    null,
    2
  );
}

/** Bir sonraki tura geçecek isimler: kazananlar + bay geçenler. */
export function formatWinnersText(names: string[]): string {
  return names.join("\n");
}

export function formatWinnersJSON(names: string[]): string {
  return JSON.stringify(names, null, 2);
}

export function formatPairingsText(
  tournamentName: string,
  roundNo: number,
  matches: ParsedMatch[]
): string {
  const header = `# ${tournamentName.toUpperCase()} - TUR ${roundNo}`;
  const body = matches
    .map((m, idx) =>
      m.p2 === null
        ? `${idx + 1}. ${m.p1} - BAY GEÇTİ`
        : `${idx + 1}. ${m.p1} vs ${m.p2}`
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function formatPairingsJSON(
  tournament: string,
  roundNo: number,
  matches: ParsedMatch[]
): string {
  return JSON.stringify({ tournament, round: roundNo, matches }, null, 2);
}
