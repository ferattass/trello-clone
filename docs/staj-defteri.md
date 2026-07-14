# Staj Defteri — Akıllı Görev & Proje Yönetim Sistemi (Trello Clone)

Bu proje; ekiplerin proje açıp görev oluşturduğu, görevleri "To Do / Doing / Done"
sütunları arasında sürükle-bırak ile taşıyabildiği, web tabanlı bir iş yönetim
sistemidir. Full-stack mimari (Node.js + Express backend, PostgreSQL veritabanı,
React frontend) kullanılmıştır.

---

## 13 Temmuz 2026 (Pazartesi) — Analiz, Tasarım ve Backend Temeli

### Yapılan İşler
- Referans uygulamalar (Trello, Jira) incelenerek görev bazlı proje yönetiminin
  nasıl çalıştığı analiz edildi.
- Kullanıcı ihtiyaçları **user story** yöntemiyle çıkarıldı
  (ör. "Bir kullanıcı olarak görevi todo/doing/done arasında taşımak istiyorum").
- Veritabanı için **ER diyagramı** çıkarıldı; `User`, `Project`, `ProjectMember`,
  `Column`, `Task` tabloları ve aralarındaki ilişkiler belirlendi.
- REST API için endpoint listesi tasarlandı (auth, projects, columns, tasks).
- Node.js + Express ile sunucu kuruldu, proje MVC (katmanlı) mimariyle düzenlendi.
- **Docker** ile PostgreSQL 16 veritabanı ayağa kaldırıldı.
- **Prisma ORM** ile şema tanımlandı ve `migrate` ile tablolar oluşturuldu.
- **JWT tabanlı kimlik doğrulama** yazıldı: kayıt (register), giriş (login) ve
  korumalı `/me` endpoint'i. Şifreler **bcrypt** ile hash'lenerek saklandı.
- Girdi doğrulaması için **Zod** kullanıldı.

### Kullanılan Teknolojiler ve Güncel Yaklaşımlar
| Teknoloji | Amaç |
|-----------|------|
| Node.js + Express | REST API sunucusu |
| PostgreSQL (Docker) | İlişkisel veritabanı |
| Prisma ORM | Tip güvenli veritabanı erişimi ve migration |
| JWT + bcrypt | Kimlik doğrulama ve güvenli şifre saklama |
| Zod | Girdi (request body) doğrulama |

> Güncel yaklaşım notu: Şifreler asla düz metin saklanmaz; tek yönlü **hash**
> fonksiyonu (bcrypt) endüstri standardıdır. Oturum yönetiminde sunucu tarafında
> durum tutmayan (stateless) **JWT** modern web mimarilerinde yaygındır.

### Kod Örneği — Kayıt (register) fonksiyonu
```js
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Bu e-posta zaten kayitli" });
  }

  const hashed = await bcrypt.hash(password, 10);       // sifreyi hash'le
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = signToken({ id: user.id, role: user.role });   // JWT uret
  res.status(201).json({ user: publicUser(user), token });
});
```

### Kod Örneği — Prisma veri modeli (özet)
```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  position    Int                     // surukle-birak sirasi
  columnId    Int                     // hangi sutunda
  projectId   Int
  assigneeId  Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Ekran Görüntüleri
- `docs/ekran-goruntuleri/01-giris-ekrani.png` — giriş ekranı (JWT ile giriş)

### Öğrenilenler / Karşılaşılan Zorluklar
- İstemci–sunucu mimarisi ve REST prensipleri pekiştirildi.
- Docker sayesinde veritabanı kurulumu tek komuta indi; ortam bağımlılığı azaldı.
- Prisma migration ile şema değişikliklerinin sürüm kontrollü ilerlediği görüldü.

---

## 14 Temmuz 2026 (Salı) — CRUD, React Arayüzü ve Kanban Panosu

### Yapılan İşler
- Backend'de **CRUD** işlemleri tamamlandı: Proje, Sütun (Column) ve Görev (Task)
  için oluşturma / listeleme / güncelleme / silme.
- Yeni proje oluşturulduğunda otomatik olarak **To Do / Doing / Done** sütunları açıldı.
- **Yetkilendirme** eklendi: kullanıcı yalnızca üyesi olduğu projelere erişebiliyor
  (aksi halde HTTP 403).
- Sürükle-bırak sonrası sıralamayı kalıcı kaydeden `reorder` endpoint'i, veri
  tutarlılığı için **transaction** içinde yazıldı.
- **React + Vite** ile frontend projesi kuruldu.
- Giriş / kayıt arayüzü yapıldı; oturum bilgisi **Context** ile yönetildi, JWT
  token tarayıcıda `localStorage`'da saklandı ve her isteğe otomatik eklendi.
- **Kanban panosu** geliştirildi: projeler listesi, sütunlar, kartlar, kart ve
  sütun ekleme.
- **@dnd-kit** kütüphanesiyle **sürükle-bırak** eklendi; kart taşınınca değişiklik
  hem ekranda anında (optimistic update) hem de veritabanında güncellendi.
- Kullanıcı için **profil** sayfası eklendi: ad güncelleme ve **şifre değiştirme**.

### Kullanılan Teknolojiler ve Güncel Yaklaşımlar
| Teknoloji | Amaç |
|-----------|------|
| React + Vite | Bileşen tabanlı hızlı frontend |
| React Router | Sayfa yönlendirme (SPA) |
| Axios | API istekleri (interceptor ile token ekleme) |
| @dnd-kit | Erişilebilir sürükle-bırak |
| Prisma `$transaction` | Atomik (ya hep ya hiç) sıralama güncelleme |

> Güncel yaklaşım notu: Modern frontend'ler **bileşen (component)** tabanlıdır ve
> tek sayfa uygulaması (SPA) olarak çalışır. Kullanıcı deneyimini iyileştirmek için
> **iyimser güncelleme (optimistic UI)** yaygın kullanılır: işlem sunucuya
> gönderilmeden önce arayüz güncellenir.

### Kod Örneği — Sürükle-bırak sonrası (Board.jsx)
```jsx
const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  const sourceCol = columnOfTask(active.id);
  const destCol = columnFromOverId(over.id);
  // ... yeni sira hesaplanir (arrayMove) ve ekran aninda guncellenir ...

  // Backend'e kalici kaydet
  await api.put(`/columns/${destCol.id}/reorder`, {
    taskIds: destCol.tasks.map((t) => t.id),
  });
};
```

### Kod Örneği — Sıralamayı transaction ile kaydetme (backend)
```js
await prisma.$transaction(
  taskIds.map((taskId, index) =>
    prisma.task.update({
      where: { id: taskId },
      data: { columnId, position: index },
    })
  )
);
```

### Ekran Görüntüleri
- `docs/ekran-goruntuleri/02-projeler-listesi.png` — projeler sayfası
- `docs/ekran-goruntuleri/03-kanban-pano.png` — kanban panosu (sütunlar + kartlar)
- `docs/ekran-goruntuleri/04-surukle-birak.png` — kart taşındıktan sonraki pano
- `docs/ekran-goruntuleri/05-profil-sifre.png` — profil ve şifre değiştirme

### Öğrenilenler / Karşılaşılan Zorluklar
- React'te `useState` ve `Context` ile durum (state) yönetimi kavrandı.
- Sürükle-bırakta sütunlar arası taşımada indeks hesaplaması ve verinin backend'de
  tutarlı kalması (transaction) üzerinde çalışıldı.
- Frontend ile backend'in CORS ve JWT üzerinden nasıl entegre olduğu görüldü.

---

## Genel Durum
- Backend REST API tamamlandı (auth + proje + sütun + görev + profil).
- Web arayüzü ve kanban panosu (sürükle-bırak dahil) çalışır durumda.
- Yapılacaklar: React Native mobil uygulama, güvenlik sertleştirme (rate limit),
  Electron masaüstü sürümü ve deploy (Vercel + Render).
