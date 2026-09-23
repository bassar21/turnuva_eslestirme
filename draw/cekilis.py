"""
Turnuva Çekiliş Aracı — Özel Adem Ceylan Final Teknik Koleji

Katılımcılar huzurunda, projeksiyona yansıtılarak kullanılmak üzere
tasarlanmış tam ekran bir rastgele eşleştirme (çekiliş) aracıdır.

Kullanım:
    1. Superadmin panelinde (Katılımcılar sekmesi) "Çekiliş için kopyala"
       kutusundaki metni kopyalayın.
    2. Bu aracı çalıştırın: python draw/cekilis.py
    3. Turnuvayı ve tur numarasını seçip listeyi yapıştırın, "Listeyi Yükle"ye basın.
    4. "Çek" butonuna basarak eşleştirmeleri katılımcılar önünde tek tek açığa çıkarın.
    5. Sonuç ekranındaki metni veya JSON'u kopyalayıp superadmin panelindeki
       "Eşleştirmeler" sekmesine yapıştırın.

Yalnızca Python standart kütüphanesi kullanılır (tkinter, random, json) —
kurulum gerekmez, herhangi bir Windows/Mac/Linux bilgisayarda çalışır.
"""

from __future__ import annotations

import random
import tkinter as tk
from tkinter import font as tkfont
from tkinter import messagebox
from dataclasses import dataclass

from formats import (
    Match,
    Participant,
    format_pairings_json,
    format_pairings_text,
    parse_participants,
)

BG = "#0f172a"
FG = "#f1f5f9"
ACCENT = "#22c55e"
MUTED = "#64748b"
CARD_BG = "#1e293b"

TOURNAMENT_NAMES = {"satranc": "Satranç Turnuvası", "mangala": "Mangala Turnuvası"}


@dataclass
class DrawResult:
    tournament: str
    round_no: int
    matches: list[Match]


class CekilisApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Turnuva Çekiliş Aracı")
        self.configure(bg=BG)
        self.geometry("1000x700")
        self.minsize(800, 600)

        self.participants: list[Participant] = []
        self.pending_names: list[str] = []
        self.bye_name: str | None = None
        self.matches: list[Match] = []
        self.current_pair: list[str] = []

        self.setup_frame = SetupFrame(self, on_loaded=self.start_draw)
        self.setup_frame.pack(fill="both", expand=True)

        self.draw_frame: DrawFrame | None = None
        self.result_frame: ResultFrame | None = None

    def start_draw(self, tournament: str, round_no: int, participants: list[Participant]) -> None:
        self.participants = participants
        names = [p.name for p in participants]
        random.SystemRandom().shuffle(names)

        self.bye_name = None
        if len(names) % 2 == 1:
            self.bye_name = names.pop()

        self.pending_names = names
        self.matches = []
        self.tournament = tournament
        self.round_no = round_no

        self.setup_frame.pack_forget()
        self.draw_frame = DrawFrame(
            self,
            tournament_label=TOURNAMENT_NAMES.get(tournament, tournament),
            round_no=round_no,
            total_matches=len(names) // 2 + (1 if self.bye_name else 0),
            on_draw_one=self.draw_one,
            on_finish=self.finish_draw,
        )
        self.draw_frame.pack(fill="both", expand=True)

        if self.bye_name:
            self.matches.append(Match(self.bye_name, None))
            self.draw_frame.add_result(self.bye_name, None)

    def draw_one(self) -> bool:
        """Sıradaki iki ismi rastgele çeker. Çekilecek isim kalmadıysa False döner."""
        if len(self.pending_names) < 2:
            return False
        p1 = self.pending_names.pop()
        p2 = self.pending_names.pop()
        self.matches.append(Match(p1, p2))
        self.draw_frame.add_result(p1, p2)
        return len(self.pending_names) >= 2

    def finish_draw(self) -> None:
        assert self.draw_frame is not None
        self.draw_frame.pack_forget()
        self.result_frame = ResultFrame(
            self,
            tournament=self.tournament,
            round_no=self.round_no,
            matches=self.matches,
            on_restart=self.restart,
        )
        self.result_frame.pack(fill="both", expand=True)

    def restart(self) -> None:
        if self.draw_frame:
            self.draw_frame.pack_forget()
        if self.result_frame:
            self.result_frame.pack_forget()
        self.setup_frame.pack(fill="both", expand=True)


class SetupFrame(tk.Frame):
    def __init__(self, master: CekilisApp, on_loaded) -> None:
        super().__init__(master, bg=BG)
        self.on_loaded = on_loaded

        title_font = tkfont.Font(size=22, weight="bold")
        label_font = tkfont.Font(size=12)

        tk.Label(
            self, text="Turnuva Çekiliş Aracı", font=title_font, bg=BG, fg=FG
        ).pack(pady=(30, 10))

        form = tk.Frame(self, bg=BG)
        form.pack(pady=10)

        tk.Label(form, text="Turnuva:", font=label_font, bg=BG, fg=FG).grid(
            row=0, column=0, sticky="w", padx=5, pady=5
        )
        self.tournament_var = tk.StringVar(value="satranc")
        for i, (value, label) in enumerate(TOURNAMENT_NAMES.items()):
            tk.Radiobutton(
                form,
                text=label,
                variable=self.tournament_var,
                value=value,
                bg=BG,
                fg=FG,
                selectcolor=CARD_BG,
                activebackground=BG,
                activeforeground=FG,
                font=label_font,
            ).grid(row=0, column=1 + i, sticky="w", padx=5)

        tk.Label(form, text="Tur numarası:", font=label_font, bg=BG, fg=FG).grid(
            row=1, column=0, sticky="w", padx=5, pady=5
        )
        self.round_var = tk.IntVar(value=1)
        tk.Spinbox(
            form, from_=1, to=99, textvariable=self.round_var, width=5, font=label_font
        ).grid(row=1, column=1, sticky="w", padx=5)

        tk.Label(
            self,
            text="Katılımcı listesini buraya yapıştırın\n(Superadmin panelindeki \"Çekiliş için kopyala\" kutusundan)",
            font=label_font,
            bg=BG,
            fg=MUTED,
            justify="center",
        ).pack(pady=(15, 5))

        self.text = tk.Text(self, width=70, height=16, font=("Consolas", 11))
        self.text.pack(pady=5)

        self.status_label = tk.Label(self, text="", font=label_font, bg=BG, fg=ACCENT)
        self.status_label.pack(pady=5)

        tk.Button(
            self,
            text="Listeyi Yükle ve Çekilişe Geç",
            font=tkfont.Font(size=13, weight="bold"),
            bg=ACCENT,
            fg="#052e16",
            activebackground="#16a34a",
            padx=20,
            pady=10,
            relief="flat",
            command=self.load,
        ).pack(pady=20)

    def load(self) -> None:
        raw = self.text.get("1.0", "end").strip()
        if not raw:
            messagebox.showerror("Hata", "Katılımcı listesi boş.")
            return

        participants = parse_participants(raw)
        if len(participants) < 2:
            messagebox.showerror("Hata", "En az 2 katılımcı gerekli.")
            return

        names = [p.name for p in participants]
        if len(names) != len(set(names)):
            if not messagebox.askyesno(
                "Uyarı", "Listede aynı isim birden fazla kez geçiyor. Yine de devam edilsin mi?"
            ):
                return

        note = ""
        if len(participants) % 2 == 1:
            note = " (1 kişi bay geçecek)"
        self.status_label.config(text=f"{len(participants)} katılımcı okundu{note}.")

        self.on_loaded(self.tournament_var.get(), self.round_var.get(), participants)


class DrawFrame(tk.Frame):
    """Projeksiyon için tam ekrana uygun, büyük tipografili çekiliş ekranı."""

    def __init__(
        self,
        master: tk.Misc,
        tournament_label: str,
        round_no: int,
        total_matches: int,
        on_draw_one,
        on_finish,
    ) -> None:
        super().__init__(master, bg=BG)
        self.on_draw_one = on_draw_one
        self.on_finish = on_finish
        self.total_matches = total_matches
        self.drawn_count = 0

        header_font = tkfont.Font(size=20, weight="bold")
        big_font = tkfont.Font(size=40, weight="bold")
        list_font = tkfont.Font(size=14)

        tk.Label(
            self,
            text=f"{tournament_label} — TUR {round_no}",
            font=header_font,
            bg=BG,
            fg=FG,
        ).pack(pady=(20, 10))

        self.stage = tk.Label(self, text="Çekilişe hazır", font=big_font, bg=BG, fg=ACCENT)
        self.stage.pack(pady=20)

        self.progress_label = tk.Label(
            self, text=f"0 / {total_matches} maç çekildi", font=list_font, bg=BG, fg=MUTED
        )
        self.progress_label.pack()

        list_frame = tk.Frame(self, bg=CARD_BG)
        list_frame.pack(fill="both", expand=True, padx=40, pady=20)

        self.results_box = tk.Listbox(
            list_frame,
            font=("Consolas", 14),
            bg=CARD_BG,
            fg=FG,
            bd=0,
            highlightthickness=0,
            selectbackground=CARD_BG,
        )
        self.results_box.pack(fill="both", expand=True, padx=10, pady=10)

        controls = tk.Frame(self, bg=BG)
        controls.pack(pady=15)

        self.draw_button = tk.Button(
            controls,
            text="Çek",
            font=tkfont.Font(size=16, weight="bold"),
            bg=ACCENT,
            fg="#052e16",
            activebackground="#16a34a",
            padx=30,
            pady=12,
            relief="flat",
            command=self.handle_draw,
        )
        self.draw_button.pack(side="left", padx=10)

        self.finish_button = tk.Button(
            controls,
            text="Çekilişi Bitir → Sonuçlar",
            font=tkfont.Font(size=13),
            bg=MUTED,
            fg=FG,
            padx=20,
            pady=12,
            relief="flat",
            state="disabled",
            command=self.on_finish,
        )
        self.finish_button.pack(side="left", padx=10)

    def add_result(self, p1: str, p2: str | None) -> None:
        self.drawn_count += 1
        if p2 is None:
            self.stage.config(text=f"{p1}\nBAY GEÇTİ", fg="#f59e0b")
            self.results_box.insert("end", f"{self.drawn_count}. {p1} — BAY GEÇTİ")
        else:
            self.stage.config(text=f"{p1}\nVS\n{p2}", fg=ACCENT)
            self.results_box.insert("end", f"{self.drawn_count}. {p1}  vs  {p2}")
        self.progress_label.config(text=f"{self.drawn_count} / {self.total_matches} maç çekildi")

    def handle_draw(self) -> None:
        has_more = self.on_draw_one()
        if not has_more:
            self.draw_button.config(state="disabled")
            self.finish_button.config(state="normal")


class ResultFrame(tk.Frame):
    def __init__(
        self,
        master: tk.Misc,
        tournament: str,
        round_no: int,
        matches: list[Match],
        on_restart,
    ) -> None:
        super().__init__(master, bg=BG)

        title_font = tkfont.Font(size=20, weight="bold")
        tk.Label(
            self, text="Çekiliş Tamamlandı", font=title_font, bg=BG, fg=ACCENT
        ).pack(pady=(20, 10))
        tk.Label(
            self,
            text="Aşağıdaki metni superadmin panelindeki \"Eşleştirmeler\" sekmesine yapıştırın.",
            bg=BG,
            fg=MUTED,
        ).pack(pady=(0, 15))

        tournament_label = TOURNAMENT_NAMES.get(tournament, tournament)
        text_output = format_pairings_text(tournament_label, round_no, matches)
        json_output = format_pairings_json(tournament, round_no, matches)

        notebook_frame = tk.Frame(self, bg=BG)
        notebook_frame.pack(fill="both", expand=True, padx=40, pady=10)

        self.mode = tk.StringVar(value="text")
        toggle_frame = tk.Frame(notebook_frame, bg=BG)
        toggle_frame.pack(anchor="w", pady=(0, 5))
        tk.Radiobutton(
            toggle_frame, text="Okunabilir metin", variable=self.mode, value="text",
            bg=BG, fg=FG, selectcolor=CARD_BG, command=lambda: self.render(),
        ).pack(side="left", padx=5)
        tk.Radiobutton(
            toggle_frame, text="JSON", variable=self.mode, value="json",
            bg=BG, fg=FG, selectcolor=CARD_BG, command=lambda: self.render(),
        ).pack(side="left", padx=5)

        self.text_widget = tk.Text(notebook_frame, font=("Consolas", 12), bg=CARD_BG, fg=FG)
        self.text_widget.pack(fill="both", expand=True)

        self._text_output = text_output
        self._json_output = json_output
        self.render()

        buttons = tk.Frame(self, bg=BG)
        buttons.pack(pady=15)

        tk.Button(
            buttons,
            text="Panoya Kopyala",
            font=tkfont.Font(size=13, weight="bold"),
            bg=ACCENT,
            fg="#052e16",
            padx=20,
            pady=10,
            relief="flat",
            command=self.copy_to_clipboard,
        ).pack(side="left", padx=10)

        tk.Button(
            buttons,
            text="Dosyaya Kaydet",
            font=tkfont.Font(size=13),
            bg=CARD_BG,
            fg=FG,
            padx=20,
            pady=10,
            relief="flat",
            command=self.save_to_file,
        ).pack(side="left", padx=10)

        tk.Button(
            buttons,
            text="Yeni Çekiliş",
            font=tkfont.Font(size=13),
            bg=MUTED,
            fg=FG,
            padx=20,
            pady=10,
            relief="flat",
            command=on_restart,
        ).pack(side="left", padx=10)

    def render(self) -> None:
        content = self._text_output if self.mode.get() == "text" else self._json_output
        self.text_widget.delete("1.0", "end")
        self.text_widget.insert("1.0", content)

    def copy_to_clipboard(self) -> None:
        content = self._text_output if self.mode.get() == "text" else self._json_output
        self.clipboard_clear()
        self.clipboard_append(content)
        messagebox.showinfo("Kopyalandı", "Sonuç panoya kopyalandı.")

    def save_to_file(self) -> None:
        from tkinter import filedialog

        ext = ".json" if self.mode.get() == "json" else ".txt"
        content = self._text_output if self.mode.get() == "text" else self._json_output
        path = filedialog.asksaveasfilename(defaultextension=ext, initialfile=f"eslestirme{ext}")
        if path:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            messagebox.showinfo("Kaydedildi", f"Dosyaya kaydedildi:\n{path}")


def main() -> None:
    app = CekilisApp()
    app.mainloop()


if __name__ == "__main__":
    main()
