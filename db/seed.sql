-- Başlangıç verisi: iki turnuva kaydı. options tablosu bilinçli olarak boş
-- bırakılıyor — sınıf/bölüm/şube listeleri superadmin panelinden girilir.

INSERT INTO tournaments (slug, name, registration_open) VALUES
  ('satranc', 'Satranç Turnuvası', false),
  ('mangala', 'Mangala Turnuvası', false)
ON CONFLICT (slug) DO NOTHING;
