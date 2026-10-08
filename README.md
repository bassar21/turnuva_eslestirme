# Turnuva Eşleştirme Sistemi

Özel Adem Ceylan Final Teknik Koleji'nin **satranç** ve **mangala**
turnuvaları için kayıt, çekiliş sonucu aktarımı ve maç sonucu takip
sistemi.

## Nasıl çalışır?

1. **Superadmin** kaydı açar, öğrenciler `/satranc` veya `/mangala`
   sayfasından kaydolur.
2. Superadmin kaydı kapatır.
3. Superadmin panelinde "Eşleştirmeler" sekmesinden "Çekilişi Başlat"a
   basar; katılımcılar huzurunda, tam ekran bir sayfada rastgele
   eşleştirme yapılır ve doğrudan kaydedilir.
4. Superadmin turu yayınlar — herkes eşleştirmeleri site üzerinden görür.
5. Admin hesapları (satranç/mangala ayrı ayrı) maç sonuçlarını (set
   sayısı + skor) girer.
6. Superadmin, tamamlanan turun kazananlarını (+ bay geçenler) tek
   tıkla kopyalayıp bir sonraki çekiliş için 3. adıma döner.

## Roller

| Rol | Giriş | Yetki |
|---|---|---|
| Ziyaretçi | — | Kayıt olur, yayınlanmış eşleştirmeleri görür |
| Admin | `/admin/login` | Yalnızca kendi turnuvasının maç sonuçlarını girer |
| Superadmin | `/superadmin/login` | Her şeyi yönetir (kayıt aç/kapa, eşleştirme, admin hesapları, listeler) |

Superadmin şifresi yalnızca sunucudaki `.env` dosyasında (hash olarak)
tutulur, arayüzden değiştirilemez. Admin hesaplarını superadmin panelden
oluşturur/askıya alır.

## Geliştirme ortamı

Gerekli: Node.js 20+, PostgreSQL.

```bash
npm install
cp .env.example .env        # DATABASE_URL, SESSION_SECRET, SUPERADMIN_* doldurun
npm run db:init              # şemayı ve başlangıç verisini uygular
npm run dev                  # http://localhost:3000
```

Superadmin şifre hash'i üretmek için:

```bash
node scripts/hash-password.mjs "sifreniz"
```

## Testler

```bash
npm run test     # lib/pairings.ts birim testleri (vitest)
npm run lint      # ESLint
npx tsc --noEmit  # Tip kontrolü
```

## Proje yapısı

```
src/app/            Next.js sayfaları (/, /[tournament], /admin, /superadmin)
src/app/actions/     Server action'lar (kayıt, giriş, superadmin işlemleri)
src/lib/             DB erişimi, kimlik doğrulama, eşleştirme format katmanı
src/lib/queries/     Veritabanı sorguları (tournaments, participants, rounds, matches, admins, options)
src/components/      UI bileşenleri (çekiliş aracı dahil)
draw/                Python çekiliş aracı (Tkinter) — yedek/çevrimdışı alternatif
db/                  SQL şema ve başlangıç verisi
DEPLOY.md            VDS'e kurulum adımları
```

## VDS'e yayınlama

Bkz. [`DEPLOY.md`](./DEPLOY.md) — Node, PostgreSQL, systemd, Nginx ve
Certbot ile adım adım kurulum.
