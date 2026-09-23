# Turnuva Çekiliş Aracı

Katılımcılar önünde, projeksiyona yansıtılarak kullanılan rastgele eşleştirme
(çekiliş) uygulaması. Siteden bağımsız çalışır — internet gerektirmez,
yalnızca Python standart kütüphanesini kullanır.

## Gereksinimler

- Python 3.9+ (Windows'ta genelde hazır gelir; `python --version` ile kontrol edin)
- `tkinter` — çoğu Python kurulumunda hazır gelir. Eksikse:
  - Windows: python.org'dan indirilen kurulumda varsayılan olarak gelir.
  - Linux (Debian/Ubuntu): `sudo apt install python3-tk`

Başka hiçbir paket kurulumu gerekmez.

## Kullanım

1. Superadmin panelinde (`/superadmin`, **Katılımcılar** sekmesi) ilgili
   turnuvayı seçin, "Çekiliş için kopyala" kutusundaki **okunabilir metni**
   kopyalayın.
2. Bu aracı çalıştırın:

   ```bash
   cd draw
   python cekilis.py
   ```

3. Açılan pencerede turnuvayı ve tur numarasını seçin, kopyaladığınız listeyi
   metin kutusuna yapıştırın, **"Listeyi Yükle ve Çekilişe Geç"** butonuna basın.
4. Çekiliş ekranı tam ekran kullanılmak üzere tasarlanmıştır (projeksiyona
   yansıtın). Her **"Çek"** tıklamasında iki isim rastgele seçilip ekrana
   gelir. Katılımcı sayısı tekse son kalan kişi otomatik **BAY GEÇTİ**
   olarak işaretlenir.
5. Tüm eşleştirmeler çekildikten sonra **"Çekilişi Bitir → Sonuçlar"**a
   basın.
6. Sonuç ekranında "Okunabilir metin" veya "JSON" sekmesini seçip
   **"Panoya Kopyala"**ya basın (ya da "Dosyaya Kaydet" ile bir dosyaya yazın).
7. Bu metni superadmin panelindeki **Eşleştirmeler** sekmesine yapıştırıp
   **"İçe Aktar"**a basın, önizlemeyi kontrol edip **"Yayınla"**yın.

## Rastgelelik ve BAY kuralı

Eşleştirme `random.SystemRandom().shuffle()` ile yapılır (işletim
sisteminin kriptografik rastgele sayı kaynağını kullanır). Katılımcı sayısı
tekse, karıştırılmış listenin son kişisi o tur için **bay** geçer ve bir
sonraki tura doğrudan ilerler.

## Format uyumluluğu

`formats.py`, sitenin `src/lib/pairings.ts` dosyasıyla birebir aynı metin/JSON
kurallarını uygular. Uyumu doğrulamak için:

```bash
python formats.py --self-test
```

Bu komut örnek verilerle hem metin hem JSON çıktısını üretip site
tarafındaki beklenen çıktıyla karşılaştırır ve round-trip (üretilen metnin
tekrar doğru ayrıştırıldığını) test eder.

## Sorun giderme

- **"tkinter bulunamadı" hatası:** Python kurulumunuzda Tk desteği yok.
  Windows'ta python.org'dan "Windows installer" ile kurulum yapın (Tcl/tk
  seçeneği varsayılan olarak işaretlidir).
- **Panoya kopyalama çalışmıyor:** Bazı Linux masaüstü ortamlarında panoya
  erişim için `xclip` veya `xsel` gerekebilir. "Dosyaya Kaydet" alternatif
  olarak her zaman çalışır.
