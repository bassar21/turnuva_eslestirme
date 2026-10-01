import { describe, expect, it } from "vitest";
import {
  PairingsParseError,
  formatPairingsJSON,
  formatPairingsText,
  formatParticipantsText,
  formatWinnersJSON,
  formatWinnersText,
  parsePairings,
} from "./pairings";

describe("parsePairings — düz metin", () => {
  it("başlıktan tur numarasını okur ve maçları ayrıştırır", () => {
    const input = `# SATRANÇ - TUR 1
1. Ahmet Yılmaz vs Mehmet Demir
2. Ayşe Kaya vs Zeynep Çelik
3. Can Öztürk - BAY GEÇTİ`;

    const result = parsePairings(input);

    expect(result.roundHint).toBe(1);
    expect(result.matches).toEqual([
      { p1: "Ahmet Yılmaz", p2: "Mehmet Demir" },
      { p1: "Ayşe Kaya", p2: "Zeynep Çelik" },
      { p1: "Can Öztürk", p2: null },
    ]);
  });

  it("numarasız satırları ve VS varyantlarını kabul eder", () => {
    const input = `Ahmet Yılmaz vs Mehmet Demir
Ayşe Kaya VS Zeynep Çelik
Can Öztürk – Deniz Ak`;

    const result = parsePairings(input);
    expect(result.matches).toHaveLength(3);
    expect(result.matches[2]).toEqual({ p1: "Can Öztürk", p2: "Deniz Ak" });
  });

  it("en-dash ile yazılmış bay satırını da kabul eder", () => {
    const result = parsePairings("Can Öztürk – BAY GEÇTİ");
    expect(result.matches).toEqual([{ p1: "Can Öztürk", p2: null }]);
  });

  it("parantezli numara biçimini kabul eder", () => {
    const result = parsePairings("1) Ahmet Yılmaz vs Mehmet Demir");
    expect(result.matches).toEqual([{ p1: "Ahmet Yılmaz", p2: "Mehmet Demir" }]);
  });

  it("boş girdide hata fırlatır", () => {
    expect(() => parsePairings("   ")).toThrow(PairingsParseError);
  });

  it("anlaşılamayan satırda satır numarasıyla hata fırlatır", () => {
    try {
      parsePairings("# TUR 1\nAhmet Yılmaz Mehmet Demir");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(PairingsParseError);
      expect((err as PairingsParseError).line).toBe(2);
      expect((err as PairingsParseError).message).toContain("Satır 2");
    }
  });

  it("hiç maç bulunamazsa hata fırlatır", () => {
    expect(() => parsePairings("# SATRANÇ - TUR 1")).toThrow(PairingsParseError);
  });
});

describe("parsePairings — JSON", () => {
  it("geçerli JSON'u ayrıştırır", () => {
    const input = JSON.stringify({
      tournament: "satranc",
      round: 1,
      matches: [
        { p1: "Ahmet Yılmaz", p2: "Mehmet Demir" },
        { p1: "Can Öztürk", p2: null },
      ],
    });

    const result = parsePairings(input);
    expect(result.roundHint).toBe(1);
    expect(result.tournamentHint).toBe("satranc");
    expect(result.matches).toEqual([
      { p1: "Ahmet Yılmaz", p2: "Mehmet Demir" },
      { p1: "Can Öztürk", p2: null },
    ]);
  });

  it("matches alanı eksikse hata verir", () => {
    expect(() => parsePairings("{}")).toThrow(PairingsParseError);
  });

  it("bozuk JSON'da hata verir", () => {
    expect(() => parsePairings("{ matches: [ }")).toThrow(PairingsParseError);
  });

  it("p1 eksikse hata verir", () => {
    expect(() => parsePairings(JSON.stringify({ matches: [{ p2: "x" }] }))).toThrow(
      PairingsParseError
    );
  });
});

describe("üretim fonksiyonları", () => {
  const matches = [
    { p1: "Ahmet Yılmaz", p2: "Mehmet Demir" },
    { p1: "Can Öztürk", p2: null },
  ];

  it("formatPairingsText çıktısı tekrar ayrıştırılabilir (round-trip)", () => {
    const text = formatPairingsText("Satranç Turnuvası", 1, matches);
    const reparsed = parsePairings(text);
    expect(reparsed.roundHint).toBe(1);
    expect(reparsed.matches).toEqual(matches);
  });

  it("formatPairingsJSON çıktısı tekrar ayrıştırılabilir (round-trip)", () => {
    const json = formatPairingsJSON("satranc", 2, matches);
    const reparsed = parsePairings(json);
    expect(reparsed.roundHint).toBe(2);
    expect(reparsed.matches).toEqual(matches);
  });

  it("formatParticipantsText sınıf/bölüm/şube bilgisini ekler", () => {
    const text = formatParticipantsText([
      { fullName: "Ahmet Yılmaz", sinif: "10", bolum: "Bilişim Teknolojileri", sube: "A" },
    ]);
    expect(text).toBe("Ahmet Yılmaz (10 / Bilişim Teknolojileri / A)");
  });

  it("formatWinnersText sınıf bilgisi varsa ekler, yoksa sade isim yazar", () => {
    const text = formatWinnersText([
      { fullName: "Ahmet Yılmaz", sinif: "10", bolum: "Bilişim Teknolojileri", sube: "A" },
      { fullName: "Can Öztürk", sinif: null, bolum: null, sube: null },
    ]);
    expect(text).toBe(
      "Ahmet Yılmaz (10 / Bilişim Teknolojileri / A)\nCan Öztürk"
    );
  });

  it("formatWinnersJSON name/sinif/bolum/sube alanlarını üretir", () => {
    const json = formatWinnersJSON([
      { fullName: "Ahmet Yılmaz", sinif: "10", bolum: "Bilişim Teknolojileri", sube: "A" },
    ]);
    expect(JSON.parse(json)).toEqual([
      { name: "Ahmet Yılmaz", sinif: "10", bolum: "Bilişim Teknolojileri", sube: "A" },
    ]);
  });
});
