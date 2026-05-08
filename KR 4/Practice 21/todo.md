# 🧭 🔥 ГЛОБАЛЬНАЯ ЦЕЛЬ

```text
полноценный фронтенд:
- авторизация (login/register)
- JWT (access + refresh)
- CRUD товаров
- защита маршрутов
```

---

# 🧭 ЭТАП 1 — AUTH (ты почти сделал)

## ⬜ 1. LoginPage (у тебя есть)

* [+] форма
* [+] axios POST /login
* [+] сохранить токены

---

## ⬜ 2. RegisterPage (СДЕЛАТЬ)

Создать страницу:

```text
pages/RegisterPage.jsx
```

Сделать:

* [+] поля: email, first_name, last_name, password
* [+] POST `/api/auth/register`
* [+] обработка ошибок
* [+] после успеха → можно сразу логинить или редирект

---

## ⬜ 3. tokenStorage

```text
src/utils/tokenStorage.js
```

* [+] setTokens(access, refresh)
* [+] getAccessToken()
* [+] getRefreshToken()
* [+] clearTokens()

👉 убрать localStorage из компонентов

---

# 🧭 ЭТАП 2 — API СЛОЙ (очень важно)

## ⬜ 4. apiClient

```text
src/api/apiClient.js
```

* [+] axios.create
* [+] baseURL = [http://localhost:3000](http://localhost:3000)
* [+] headers JSON

---

## ⬜ 5. Request interceptor

* [+] автоматически добавлять accessToken

```text
Authorization: Bearer ...
```

---

## ⬜ 6. Response interceptor (JWT ядро)

* [+] если 401:

  * [+] POST /auth/refresh
  * [+] обновить токены
  * [+] повторить оригинальный запрос

---

## ⬜ 7. Если refresh умер

* [+] clearTokens()
* [+] logout (state)
* [ ] редирект на login

---

# 🧭 ЭТАП 3 — АВТОРИЗАЦИЯ В UI

## ⬜ 8. Auth state

* [ ] isAuthenticated (true/false)
* [ ] при старте приложения:

  * [ ] если есть токен → true

---

## ⬜ 9. Logout

* [ ] кнопка logout
* [ ] удалить токены
* [ ] reset state

---

## ⬜ 10. Protected UI

* [ ] если не авторизован → только login/register
* [ ] если авторизован → доступ к продуктам

---

# 🧭 ЭТАП 4 — ПРОДУКТЫ (главная часть задания)

## ⬜ 11. ProductListPage

```text
pages/ProductListPage.jsx
```

* [+] GET `/api/products`
* [+] вывести список

---

## ⬜ 12. ProductDetailPage

```text
pages/ProductDetailPage.jsx
```

* [+] GET `/api/products/:id`
* [+] показать данные товара

---

## ⬜ 13. CreateProductPage

* [+] форма: title, category, description, price
* [+] POST `/api/products`
* [+] обновить список

---

## ⬜ 14. UpdateProduct

* [+] форма редактирования
* [+] PUT `/api/products/:id`

---

## ⬜ 15. DeleteProduct

* [+] кнопка удаления
* [+] DELETE `/api/products/:id`

---

# 🧭 ЭТАП 5 — ROUTER

## ⬜ 16. Подключить router

```text
react-router-dom
```

---

## ⬜ 17. Маршруты

```text
/login
/register
/products
/products/:id
```

---

## ⬜ 18. Protected routes

* [ ] если нет токена → redirect /login

---

# 🧭 ЭТАП 6 — UX (быстро)

## ⬜ 19. Loading

* [ ] при запросах

---

## ⬜ 20. Ошибки

* [ ] показывать ошибки с сервера

---

## ⬜ 21. Disable кнопки

* [ ] если поля пустые

---

# 🧭 ЭТАП 7 — ФИНАЛ

## ⬜ 22. Проверка сценариев

* [ ] регистрация
* [ ] логин
* [ ] refresh работает
* [ ] CRUD товаров
* [ ] logout

---

# 🔥 ИТОГ (что у тебя получится)

```text
Login → JWT → apiClient → auto headers → refresh → protected routes → CRUD products
```

👉 это уже почти production уровень

---

# 🎯 Как тебе двигаться СЕЙЧАС

НЕ распыляйся.

👉 следующий шаг:

```text
1. RegisterPage
2. tokenStorage
3. apiClient (без refresh сначала)
```

---

# 👉 Контрольный вопрос (очень важный)

```text
зачем вообще нужен refreshToken, если есть accessToken?
```

Если ответишь — ты понял всю систему 💪
