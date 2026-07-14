# STEP 1 — Analiz & Tasarım

> Amaç: Kod yazmadan önce sistemin *ne yapacağını* ve *nasıl kurgulanacağını* netleştirmek.
> Bu dokümandaki her şey tartışmaya açık — onayladıkça kesinleşir.

---

## 1. Ne inşa ediyoruz? (Tek cümle)

Ekiplerin **proje** açıp, o projelere **görev (task)** ekleyip; görevleri
`To Do → Doing → Done` sütunları arasında sürükle-bırak ile taşıyabildiği,
web + mobil + masaüstünde çalışan bir iş yönetim sistemi.

---

## 2. Roller

| Rol   | Yapabildikleri |
|-------|----------------|
| **Admin** | Tüm projeleri/kullanıcıları görebilir, kullanıcı rolü değiştirebilir |
| **User**  | Kendi/üyesi olduğu projeleri ve görevleri yönetir |

---

## 3. User Story'ler (kullanıcı hikayeleri)

Format: *"Bir <rol> olarak, <ne> istiyorum, çünkü <neden>."*

**Auth**
- Bir kullanıcı olarak, kayıt olmak istiyorum, çünkü sisteme girmem gerekiyor.
- Bir kullanıcı olarak, giriş yapıp oturumum açık kalsın istiyorum (JWT).

**Proje**
- Bir kullanıcı olarak, yeni proje oluşturmak istiyorum.
- Bir kullanıcı olarak, projelerimi listelemek istiyorum.
- Bir kullanıcı olarak, projeye başka kullanıcı eklemek istiyorum (ekip çalışması).

**Görev (Task)**
- Bir kullanıcı olarak, bir projeye görev eklemek istiyorum.
- Bir kullanıcı olarak, görevi `todo/doing/done` sütunları arasında taşımak istiyorum.
- Bir kullanıcı olarak, görevleri aynı sütun içinde yeniden sıralamak istiyorum.
- Bir kullanıcı olarak, görevi bir ekip üyesine atamak istiyorum.
- Bir kullanıcı olarak, görevi düzenlemek/silmek istiyorum.

**Admin**
- Bir admin olarak, tüm kullanıcıları görebilmek istiyorum.

---

## 4. Veri Modeli (ER)

**User / Project / Task** çekirdeği + ekip çalışması için **ProjectMember** +
kullanıcının kendi sütunlarını tanımlayabilmesi için **Column** tablosu.

```
User (kullanıcı)
 ├─ id            (PK)
 ├─ name
 ├─ email         (unique)
 ├─ password      (hash'lenmiş)
 ├─ role          (admin | user)   default: user
 └─ createdAt

Project (proje)
 ├─ id            (PK)
 ├─ name
 ├─ description
 ├─ ownerId       (FK → User)      projeyi kuran
 └─ createdAt

ProjectMember (proje-üyelik / many-to-many)
 ├─ id            (PK)
 ├─ projectId     (FK → Project)
 ├─ userId        (FK → User)
 └─ (projectId + userId birlikte unique)

Column (kanban sütunu — kullanıcı tanımlı)
 ├─ id            (PK)
 ├─ name          (örn. "To Do", "Doing", "Done" ya da özel)
 ├─ position      (int)                    ← sütunların soldan sağa sırası
 ├─ projectId     (FK → Project)
 └─ createdAt

Task (görev)
 ├─ id            (PK)
 ├─ title
 ├─ description
 ├─ columnId      (FK → Column)            ← hangi sütunda
 ├─ position      (int)                    ← sütun içi sıralama (drag&drop)
 ├─ projectId     (FK → Project)           ← kolay sorgu için
 ├─ assigneeId    (FK → User, nullable)    ← göreve atanan kişi
 ├─ createdAt
 └─ updatedAt
```

**İlişkiler**
- Bir `User` → çok `Project` kurabilir (owner).
- Bir `Project` ↔ çok `User` (ProjectMember üzerinden ekip).
- Bir `Project` → çok `Column` (kullanıcı sütun ekler/siler/yeniden adlandırır).
- Bir `Column` → çok `Task`.
- Bir `Task` → bir `User`'a atanabilir (assignee).

> Not: Yeni proje oluşturulduğunda varsayılan olarak **To Do / Doing / Done**
> sütunları otomatik açılır; kullanıcı bunları düzenleyebilir veya yenilerini ekleyebilir.

---

## 5. REST API Endpoint Listesi

Taban yol: `/api`
🔒 = JWT token gerektirir

### Auth
| Method | Endpoint             | Açıklama            |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Kayıt ol            |
| POST   | `/api/auth/login`    | Giriş yap → JWT     |
| GET    | `/api/auth/me` 🔒     | Mevcut kullanıcı    |

### Projects
| Method | Endpoint                       | Açıklama                     |
|--------|--------------------------------|------------------------------|
| GET    | `/api/projects` 🔒              | Üyesi olduğun projeler       |
| POST   | `/api/projects` 🔒              | Proje oluştur                |
| GET    | `/api/projects/:id` 🔒          | Proje detay + görevleri      |
| PUT    | `/api/projects/:id` 🔒          | Proje güncelle               |
| DELETE | `/api/projects/:id` 🔒          | Proje sil                    |
| POST   | `/api/projects/:id/members` 🔒  | Projeye üye ekle             |

### Columns (sütunlar)
| Method | Endpoint                        | Açıklama                       |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/projects/:id/columns` 🔒   | Projenin sütunları             |
| POST   | `/api/projects/:id/columns` 🔒   | Yeni sütun ekle                |
| PUT    | `/api/columns/:id` 🔒            | Sütun adını değiştir           |
| PATCH  | `/api/columns/:id/move` 🔒       | Sütun sırasını değiştir        |
| DELETE | `/api/columns/:id` 🔒            | Sütun sil                      |

### Tasks
| Method | Endpoint                      | Açıklama                          |
|--------|-------------------------------|-----------------------------------|
| GET    | `/api/projects/:id/tasks` 🔒   | Projenin görevleri                |
| POST   | `/api/columns/:id/tasks` 🔒    | Sütuna görev ekle                 |
| PUT    | `/api/tasks/:id` 🔒            | Görev güncelle (başlık, atama...) |
| PATCH  | `/api/tasks/:id/move` 🔒       | Sütun/pozisyon değiştir (drag)    |
| DELETE | `/api/tasks/:id` 🔒            | Görev sil                         |

### Admin
| Method | Endpoint          | Açıklama                     |
|--------|-------------------|------------------------------|
| GET    | `/api/users` 🔒👑  | Tüm kullanıcılar (admin)     |

---

## 6. Teknoloji Seçimleri (öneri)

| Katman        | Seçim                          | Neden |
|---------------|--------------------------------|-------|
| Backend       | Node.js + Express              | PDF'te belirtilmiş |
| ORM           | **Prisma**                     | Modern, tip güvenli, migration kolay |
| Veritabanı    | PostgreSQL                     | PDF'te belirtilmiş |
| Auth          | JWT + bcrypt                   | Standart, güvenli |
| Validasyon    | Zod                            | Girdi doğrulama (PDF'te yok, eklendi) |
| Fake API      | JSON Server                    | Backend'den önce frontend geliştirme |
| Web           | React + Vite                   | Kanban UI |
| Sürükle-bırak | @dnd-kit veya react-beautiful-dnd | Kanban etkileşimi |
| Mobil         | React Native (Expo)            | Aynı API'yi tüketir |
| Desktop       | Electron                       | Web build'ini sarmalar |

---

## 7. Klasör Yapısı (planlanan)

```
trelloclone/
├─ docs/            ← tasarım dokümanları (bu klasör)
├─ backend/         ← Express + Prisma API  (Step 2)
├─ web/             ← React kanban arayüzü  (Step 3)
├─ mobile/          ← React Native app      (Step 3)
└─ desktop/         ← Electron sarmalayıcı  (Step 4)
```

---

## Kararlaştırılanlar
1. ✅ **ProjectMember** var — projeler ekiple paylaşılabilir, görevler üyelere atanır.
2. ✅ **ORM: Prisma** + PostgreSQL.
3. ✅ **Özelleştirilebilir sütunlar** — `Column` tablosu; yeni projede varsayılan To Do/Doing/Done açılır.
4. ✅ **İlerleme: adım adım**, her parçada onay alarak.
