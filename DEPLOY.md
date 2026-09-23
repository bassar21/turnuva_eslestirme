# VDS'e Kurulum

Bu doküman, uygulamayı kendi domaininizle bir VDS'de (Ubuntu 22.04/24.04
varsayılarak) yayına almak için adım adım komutlar içerir. Komutları SSH ile
sunucuya bağlandıktan sonra sırayla çalıştırın.

## 0) Ön koşullar

- Domain adınızın DNS A kaydı VDS'in IP adresine yönlendirilmiş olmalı.
- SSH ile `root` veya `sudo` yetkili bir kullanıcıyla bağlanabiliyor olmalısınız.

## 1) Sistem paketlerini güncelle

```bash
sudo apt update && sudo apt upgrade -y
```

## 2) Node.js LTS kurulumu

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v20+ olmalı
```

## 3) PostgreSQL kurulumu

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Veritabanı ve kullanıcı oluştur (güçlü bir şifre seçin):

```bash
sudo -u postgres psql -c "CREATE USER turnuva WITH PASSWORD 'GUCLU_BIR_SIFRE';"
sudo -u postgres psql -c "CREATE DATABASE turnuva OWNER turnuva;"
```

## 4) Uygulama kodunu sunucuya getir

```bash
sudo mkdir -p /opt/turnuva
sudo chown $USER:$USER /opt/turnuva
git clone <repo-adresiniz> /opt/turnuva
cd /opt/turnuva
```

(Git yoksa `scp -r` ile proje klasörünü de kopyalayabilirsiniz.)

## 5) Ortam değişkenleri

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```bash
DATABASE_URL=postgres://turnuva:GUCLU_BIR_SIFRE@localhost:5432/turnuva
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
SUPERADMIN_USERNAME=superadmin
```

Superadmin şifrenizin hash'ini üretin ve `.env`'e ekleyin:

```bash
node scripts/hash-password.mjs "SUPERADMIN_SIFRENIZ"
# çıktıyı .env'de SUPERADMIN_PASSWORD_HASH= satırına yapıştırın
```

> `.env` dosyası asla git'e eklenmez (`.gitignore`'da) ve superadmin şifresi
> yalnızca bu dosyada, hash olarak durur. Değiştirmek için yukarıdaki komutu
> tekrar çalıştırıp `.env`'i güncelleyip uygulamayı yeniden başlatmanız yeterli.

## 6) Bağımlılıklar, veritabanı şeması, derleme

```bash
npm ci
npm run db:init
npm run build
```

## 7) systemd servisi (otomatik başlatma / yeniden başlatma)

```bash
sudo tee /etc/systemd/system/turnuva.service > /dev/null <<'EOF'
[Unit]
Description=Turnuva Yonetim Sistemi
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/opt/turnuva
EnvironmentFile=/opt/turnuva/.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R www-data:www-data /opt/turnuva
sudo systemctl daemon-reload
sudo systemctl enable --now turnuva
sudo systemctl status turnuva   # "active (running)" görmelisiniz
```

Uygulama artık `127.0.0.1:3000`'de çalışıyor.

## 8) Nginx reverse proxy

> Domaininizi **Cloudflare Tunnel** ile bağlayacaksanız (VDS'de hiçbir port
> dışarı açılmaz, Certbot gerekmez), adım 8 ve 9'u atlayıp doğrudan
> [Alternatif: Cloudflare Tunnel ile Yayın](#alternatif-cloudflare-tunnel-ile-yayın)
> bölümüne geçebilirsiniz — o bölüm de kendi Nginx adımını içerir.

```bash
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/turnuva > /dev/null <<'EOF'
server {
    listen 80;
    server_name DOMAIN_ADINIZ.com www.DOMAIN_ADINIZ.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/turnuva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

`DOMAIN_ADINIZ.com` yerine gerçek domaininizi yazmayı unutmayın.

## 9) HTTPS (Certbot / Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d DOMAIN_ADINIZ.com -d www.DOMAIN_ADINIZ.com
```

Certbot, Nginx yapılandırmasını otomatik günceller ve sertifikayı 90 günde
bir kendiliğinden yeniler (systemd timer ile).

Kurulum tamamlandığında `https://DOMAIN_ADINIZ.com` adresinden anasayfayı
görebilmelisiniz.

## Alternatif: Cloudflare Tunnel ile Yayın

Domaininizi Cloudflare'e bağlıyorsanız, VDS'de **hiçbir gelen port açmadan**
(80/443'ü tamamen kapatabilirsiniz) siteyi yayınlayabilirsiniz. `cloudflared`
sunucudan Cloudflare'e **dışa doğru** bir bağlantı kurar; TLS sertifikası
Cloudflare tarafında yönetilir, bu yüzden **Certbot'a (adım 9) gerek kalmaz**.
Nginx yine de tavsiye edilir (yerel reverse proxy, gerçek ziyaretçi IP'si vb.
için) ama `127.0.0.1`'e kapalı çalışır, dışarıdan erişilemez.

Bu bölüm adım 7'den (systemd servisi) sonra, adım 8-9 **yerine** uygulanır.

### a) cloudflared kurulumu

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

### b) Cloudflare hesabına giriş ve tünel oluşturma

```bash
cloudflared tunnel login
```

Bu komut bir URL verir; tarayıcınızda açıp Cloudflare hesabınızla ve
domaininizle yetkilendirin (SSH ile bağlıysanız URL'yi kopyalayıp kendi
bilgisayarınızın tarayıcısında açabilirsiniz). Onay sonrası
`~/.cloudflared/cert.pem` oluşur.

```bash
cloudflared tunnel create turnuva
```

Çıktıda bir **Tunnel ID** (UUID) verir ve kimlik bilgilerini
`~/.cloudflared/<TUNNEL_ID>.json` dosyasına yazar. Bu ID'yi bir sonraki
adımda kullanacaksınız.

### c) Yapılandırma dosyası: `/etc/cloudflared/config.yml`

```bash
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/<TUNNEL_ID>.json /etc/cloudflared/
```

```bash
sudo tee /etc/cloudflared/config.yml > /dev/null <<'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: DOMAIN_ADINIZ.com
    service: http://127.0.0.1:80
  - hostname: www.DOMAIN_ADINIZ.com
    service: http://127.0.0.1:80
  - service: http_status:404
EOF
```

`<TUNNEL_ID>` ve `DOMAIN_ADINIZ.com` yerine kendi değerlerinizi yazın
(dosyada iki yerde `<TUNNEL_ID>` geçiyor: `tunnel:` satırı ve
`credentials-file` yolu). Nginx kullanmayıp doğrudan uygulamaya bağlanmak
isterseniz `service: http://127.0.0.1:80` yerine `http://127.0.0.1:3000`
yazıp adım (e)'deki Nginx kurulumunu tamamen atlayabilirsiniz.

### d) DNS yönlendirmesi

```bash
cloudflared tunnel route dns turnuva DOMAIN_ADINIZ.com
cloudflared tunnel route dns turnuva www.DOMAIN_ADINIZ.com
```

Bu komut Cloudflare DNS'inizde otomatik olarak proxied (turuncu bulut)
CNAME kaydı oluşturur — domaininizin DNS A kaydını VDS IP'sine yönlendirmeye
**gerek yoktur** (adım 0'daki DNS notu bu senaryoda geçersizdir).

### e) Yerel Nginx (isteğe bağlı ama tavsiye edilir)

Konum: `/etc/nginx/sites-available/turnuva`

```bash
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/turnuva > /dev/null <<'EOF'
server {
    listen 127.0.0.1:80;
    server_name DOMAIN_ADINIZ.com www.DOMAIN_ADINIZ.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/turnuva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

`listen 127.0.0.1:80` ile Nginx yalnızca sunucunun kendisinden (yani
cloudflared'dan) gelen bağlantıları kabul eder, dışarıdan erişilemez.
Gerçek ziyaretçi IP'si Cloudflare'in eklediği `CF-Connecting-IP`
başlığından okunur (`$http_cf_connecting_ip`), çünkü `$remote_addr` burada
her zaman `127.0.0.1` olur.

### f) cloudflared'ı systemd servisi olarak kur

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared   # "active (running)" görmelisiniz
```

Bu komut `/etc/systemd/system/cloudflared.service` dosyasını oluşturur ve
otomatik olarak `/etc/cloudflared/config.yml`'i kullanır.

### g) Gelen portları kapatın (isteğe bağlı, tavsiye edilir)

cloudflared yalnızca dışa doğru bağlantı kurduğu için 80/443'ü dışarıya
tamamen kapatabilirsiniz — origin sunucunuzun gerçek IP'si böylece
Cloudflare arkasında gizli kalır:

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw deny 80/tcp
sudo ufw deny 443/tcp
sudo ufw enable
sudo ufw status
```

Kurulum tamamlandığında `https://DOMAIN_ADINIZ.com` adresi Cloudflare
üzerinden (kendi SSL sertifikanız olmadan) çalışır.

### Güncelleme / sorun giderme (Cloudflare Tunnel)

- Config dosyasını değiştirdikten sonra: `sudo systemctl restart cloudflared`
- Tünel loglarını görmek için: `sudo journalctl -u cloudflared -n 50 --no-pager`
- Tünel durumunu kontrol etmek için: `cloudflared tunnel info turnuva`
- 502/523 hatası alırsanız Nginx veya uygulama servisinin çalıştığından
  emin olun (`systemctl status nginx turnuva`).

## 10) Yedekleme

Veritabanını periyodik olarak yedeklemek için:

```bash
sudo -u postgres pg_dump turnuva > yedek_$(date +%Y%m%d).sql
```

Bunu bir cron görevine bağlayabilirsiniz:

```bash
crontab -e
# Her gece 03:00'te yedek al:
0 3 * * * sudo -u postgres pg_dump turnuva > /opt/turnuva/backups/yedek_$(date +\%Y\%m\%d).sql
```

(`/opt/turnuva/backups` klasörünü önceden oluşturun: `mkdir -p /opt/turnuva/backups`)

## Güncelleme yaparken

```bash
cd /opt/turnuva
git pull
npm ci
npm run build
sudo systemctl restart turnuva
```

`db:init` betiği idempotenttir (mevcut tabloları bozmadan yeni şema
değişikliklerini uygular), her güncellemede tekrar çalıştırmak güvenlidir:

```bash
npm run db:init
```

## Sorun giderme

- **Servis başlamıyor:** `sudo journalctl -u turnuva -n 50 --no-pager` ile
  son logları görün.
- **502 Bad Gateway:** Uygulama servisi çalışmıyor olabilir
  (`systemctl status turnuva`) veya `DATABASE_URL` hatalı olabilir.
- **Superadmin girişi çalışmıyor:** `.env`'deki `SUPERADMIN_USERNAME` ve
  `SUPERADMIN_PASSWORD_HASH` doğru mu kontrol edin; değiştirdikten sonra
  `sudo systemctl restart turnuva` çalıştırmayı unutmayın.
