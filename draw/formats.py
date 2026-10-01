"""
Site (src/lib/pairings.ts) ile bu Python çekiliş aracı arasındaki ortak
dilbilgisini uygular. Bu dosya TypeScript ikizinin birebir karşılığıdır —
biri değişirse diğeri de değişmelidir.

Yalnızca standart kütüphane kullanılır (dışa bağımlılık yok).

Kendi kendini test etmek için:
    python draw/formats.py --self-test
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from typing import Optional


# ---------------------------------------------------------------------------
# Katılımcı listesini ayrıştırma (site -> Python)
# ---------------------------------------------------------------------------

@dataclass
class Participant:
    name: str
    sinif: Optional[str] = None
    bolum: Optional[str] = None
    sube: Optional[str] = None


_PARTICIPANT_LINE = re.compile(
    r"^(?P<name>.+?)\s*\(\s*(?P<sinif>[^/]+?)\s*/\s*(?P<bolum>[^/]+?)\s*/\s*(?P<sube>[^/]+?)\s*\)\s*$"
)


def parse_participants(text: str) -> list[Participant]:
    """'Ahmet Yılmaz (10 / Bilişim Teknolojileri / A)' veya sade 'Ahmet Yılmaz'
    satırlarını ayrıştırır. Boş satırlar ve '#' ile başlayan satırlar atlanır.
    Girdi '[' ile başlıyorsa formatParticipantsJSON çıktısı olarak (JSON dizi)
    ayrıştırılır — Katılımcılar sekmesindeki "Çekiliş için kopyala" JSON
    seçeneği doğrudan buraya yapıştırıldığında satırların isim sanılmasını
    önler."""
    stripped = text.strip()
    if stripped.startswith("["):
        try:
            data = json.loads(stripped)
        except json.JSONDecodeError as exc:
            raise ValueError(f"JSON ayrıştırılamadı: {exc}") from exc
        if not isinstance(data, list):
            raise ValueError("JSON bir katılımcı dizisi olmalı.")
        participants: list[Participant] = []
        for idx, raw in enumerate(data, start=1):
            if not isinstance(raw, dict) or "name" not in raw:
                raise ValueError(f"{idx}. katılımcıda \"name\" alanı eksik.")
            participants.append(
                Participant(
                    name=str(raw["name"]).strip(),
                    sinif=str(raw["sinif"]).strip() if raw.get("sinif") else None,
                    bolum=str(raw["bolum"]).strip() if raw.get("bolum") else None,
                    sube=str(raw["sube"]).strip() if raw.get("sube") else None,
                )
            )
        return participants

    participants = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = _PARTICIPANT_LINE.match(line)
        if match:
            participants.append(
                Participant(
                    name=match.group("name").strip(),
                    sinif=match.group("sinif").strip(),
                    bolum=match.group("bolum").strip(),
                    sube=match.group("sube").strip(),
                )
            )
        else:
            participants.append(Participant(name=line))
    return participants


# ---------------------------------------------------------------------------
# Eşleştirme sonucunu üretme (Python -> site) — src/lib/pairings.ts'deki
# formatPairingsText / formatPairingsJSON ile birebir aynı çıktıyı üretir.
# ---------------------------------------------------------------------------

@dataclass
class Match:
    p1: str
    p2: Optional[str]  # None => BAY


def format_pairings_text(tournament_name: str, round_no: int, matches: list[Match]) -> str:
    header = f"# {tournament_name.upper()} - TUR {round_no}"
    lines = []
    for idx, m in enumerate(matches, start=1):
        if m.p2 is None:
            lines.append(f"{idx}. {m.p1} - BAY GEÇTİ")
        else:
            lines.append(f"{idx}. {m.p1} vs {m.p2}")
    return header + "\n" + "\n".join(lines)


def format_pairings_json(tournament: str, round_no: int, matches: list[Match]) -> str:
    payload = {
        "tournament": tournament,
        "round": round_no,
        "matches": [{"p1": m.p1, "p2": m.p2} for m in matches],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# Eşleştirme sonucunu geri ayrıştırma — site tarafındaki parsePairings ile
# aynı dilbilgisi. Yalnızca kendi kendini test etmek (round-trip) için var;
# çekiliş aracı normalde bu yönde ayrıştırma yapmaz.
# ---------------------------------------------------------------------------

_VS_SEPARATOR = re.compile(r"\s+(?:vs|VS|Vs)\s+|\s+–\s+")
_BYE_PATTERN = re.compile(r"^(.+?)\s*[-–]\s*BAY(?:\s+GE[ÇC]T[İI])?$", re.IGNORECASE)
_LEADING_NUMBER = re.compile(r"^\s*\d+[.)]\s*")


def parse_pairings_text(text: str) -> list[Match]:
    matches: list[Match] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        without_number = _LEADING_NUMBER.sub("", line)

        bye = _BYE_PATTERN.match(without_number)
        if bye:
            matches.append(Match(p1=bye.group(1).strip(), p2=None))
            continue

        parts = _VS_SEPARATOR.split(without_number)
        if len(parts) != 2:
            raise ValueError(f'Satır anlaşılamadı: "{line}"')
        matches.append(Match(p1=parts[0].strip(), p2=parts[1].strip()))
    return matches


# ---------------------------------------------------------------------------
# Kendi kendini test
# ---------------------------------------------------------------------------

def _self_test() -> None:
    matches = [Match("Ahmet Yılmaz", "Mehmet Demir"), Match("Can Öztürk", None)]

    text = format_pairings_text("Satranç Turnuvası", 1, matches)
    expected_text = (
        "# SATRANÇ TURNUVASI - TUR 1\n"
        "1. Ahmet Yılmaz vs Mehmet Demir\n"
        "2. Can Öztürk - BAY GEÇTİ"
    )
    assert text == expected_text, f"Metin çıktısı beklenenden farklı:\n{text!r}\n!=\n{expected_text!r}"

    # Round-trip: üretilen metin tekrar ayrıştırılınca aynı maçlar çıkmalı.
    reparsed = parse_pairings_text(text)
    assert reparsed == matches, f"Round-trip başarısız: {reparsed} != {matches}"

    json_out = format_pairings_json("satranc", 1, matches)
    decoded = json.loads(json_out)
    assert decoded == {
        "tournament": "satranc",
        "round": 1,
        "matches": [
            {"p1": "Ahmet Yılmaz", "p2": "Mehmet Demir"},
            {"p1": "Can Öztürk", "p2": None},
        ],
    }, f"JSON çıktısı beklenenden farklı: {decoded}"

    participants = parse_participants(
        "Ahmet Yılmaz (10 / Bilişim Teknolojileri / A)\nMehmet Demir"
    )
    assert participants[0] == Participant("Ahmet Yılmaz", "10", "Bilişim Teknolojileri", "A")
    assert participants[1] == Participant("Mehmet Demir")

    # JSON katılımcı listesi (Katılımcılar sekmesindeki JSON dışa aktarımı)
    json_participants = parse_participants(
        '[{"name": "Ahmet Yılmaz", "sinif": "10", "bolum": "Bilişim Teknolojileri", "sube": "A"}]'
    )
    assert json_participants == [
        Participant("Ahmet Yılmaz", "10", "Bilişim Teknolojileri", "A")
    ], f"JSON katılımcı ayrıştırma başarısız: {json_participants}"

    # vs varyantları ve en-dash
    varyant = parse_pairings_text("Ayşe Kaya VS Zeynep Çelik\nCan Öztürk – Deniz Ak")
    assert varyant == [Match("Ayşe Kaya", "Zeynep Çelik"), Match("Can Öztürk", "Deniz Ak")]

    print("Tüm self-test kontrolleri geçti. (src/lib/pairings.ts ile format uyumlu)")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        _self_test()
    else:
        print(__doc__)
