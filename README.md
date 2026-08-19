# סומלס (SomLess)

כלי משפחתי לבדיקה מהירה: **האם המוצר הזה מכיל שומשום?**
נבנה עבור תינוק עם רגישות לשומשום — הורה עומד בסופר, מקליד שם מוצר, ומקבל
תשובה חד-משמעית תוך שנייה.

ארבעה מצבי תשובה:

| מצב | צבע | משמעות |
| --- | --- | --- |
| מכיל שומשום | אדום `#EF4444` | לא לתת |
| עלול להכיל | ענבר `#F59E0B` | ייצור משותף / רכיב לא ברור |
| נבדק ובטוח | ירוק `#22C55E` | ההורים בדקו מול התווית |
| לא במאגר | אפור | בדקו את התווית + כפתור הוספה מהירה |

> **כלי עזר בלבד — תמיד לבדוק את רשימת הרכיבים על האריזה. מתכונים משתנים.**

---

## סטאק

- **Frontend:** Vite + React, עברית, RTL מלא
- **Backend:** Firebase Firestore בלבד (ללא Cloud Functions)
- **Auth:** Firebase Auth — Google Sign-In, מוגבל ל-whitelist ב-Security Rules
- **Hosting:** Firebase Hosting
- **PWA:** manifest מלא, service worker לקאשינג ה-shell, ו-Firestore offline
  persistence (ללא localStorage — כל הנתונים ב-Firestore/IndexedDB)

---

## 1. יצירת פרויקט Firebase

1. היכנסו ל-[Firebase Console](https://console.firebase.google.com) → **Add project**.
   קראו לו למשל `somless`. אפשר לכבות Google Analytics.
2. בתוך הפרויקט: **Build → Authentication → Get started → Sign-in method →
   Google → Enable**. שמרו.
   בלשונית **Settings → Authorized domains** ודאו שמופיעים
   `localhost` ו-`<project-id>.web.app`.
3. **Build → Firestore Database → Create database** → בחרו אזור
   (`eur3` / `me-west1`) → **Start in production mode** (החוקים יידרסו בהמשך
   על ידי `firestore.rules`).
4. **Project settings → General → Your apps → Web (`</>`)** → רשמו אפליקציה,
   והעתיקו את אובייקט ה-`firebaseConfig`.

## 2. הגדרת הפרויקט המקומי

```bash
npm install
cp .env.example .env
```

מלאו את `.env` מתוך ה-`firebaseConfig` שהעתקתם, וכן:

```
VITE_FAMILY_ID=family-main
```

`VITE_FAMILY_ID` חייב להיות זהה ל-`FAMILY_ID` של סקריפט ה-seed.

עדכנו גם את מזהה הפרויקט ב-`.firebaserc` (`"default": "<project-id>"`).

## 3. הרצת ה-seed (פעם אחת)

ה-seed מזין את מאגר הפתיחה **ואת רשימת המיילים המורשים** (ה-whitelist).
הוא רץ עם `firebase-admin` — לא צריך להתחבר, ולא נחסם על ידי ה-Security Rules.

1. **Project settings → Service accounts → Generate new private key** — הורידו
   את קובץ ה-JSON ושמרו אותו בשורש הפרויקט בשם `serviceAccountKey.json`
   (הקובץ כבר ב-`.gitignore` — **לא לעלות ל-git**).
2. הריצו:

```bash
FAMILY_ID=family-main \
MEMBER_EMAILS="aba@gmail.com,ima@gmail.com" \
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
npm run seed
```

מה נוצר:

- מסמך `families/family-main` עם `members` = רשימת המיילים המורשים
- 21 מוצרים בסטטוס **מכיל** ו-5 בסטטוס **עלול להכיל**, ברמת קטגוריה בלבד
  (ללא מותגים), כל אחד עם `note: "רשומת פתיחה — יש לאמת מול התווית"` ו-`source: "seed"`
- **הרשימה הלבנה (safe) נשארת ריקה בכוונה** — רק ההורים מוסיפים אליה מוצרים
  שבדקו בעצמם מול התווית

הסקריפט אידמפוטנטי: הרצה חוזרת לא תיצור כפילויות, ורק תעדכן את רשימת ה-members.
כדי להוסיף הורה נוסף בהמשך — הריצו שוב עם `MEMBER_EMAILS` מעודכן.

## 4. פיתוח מקומי

```bash
npm run dev      # http://localhost:5173
npm run build    # בנייה לפרודקשן → dist/
npm run preview  # תצוגה מקומית של הבנייה
npm run icons    # יצירה מחדש של אייקוני ה-PWA
```

ה-service worker נרשם רק בבנייה לפרודקשן (`npm run build` + `preview`),
כדי לא להפריע ל-hot reload בפיתוח.

## 5. פריסה

```bash
npm install -g firebase-tools
firebase login
firebase use <project-id>

npm run build
firebase deploy --only firestore:rules,hosting
```

האפליקציה תהיה זמינה ב-`https://<project-id>.web.app`.
בטלפון: פתחו את הכתובת ב-Chrome/Safari → **הוספה למסך הבית** → האפליקציה
נפתחת במסך מלא ועובדת גם ללא רשת.

---

## מודל הנתונים

```
families/{familyId}
  name: string
  members: string[]          // ה-whitelist — מיילים באותיות קטנות
  allergens: string[]        // ["sesame"] — מוכן לריבוי אלרגנים
  createdAt: timestamp

families/{familyId}/products/{productId}
  name: string
  nameNormalized: string     // לחיפוש — ללא ניקוד/גרשיים, אותיות סופיות מומרות
  brand: string
  allergens: { sesame: "contains" | "may_contain" | "safe" }
  note: string
  source: "seed" | "seed-edited" | "user"
  createdAt / createdBy
  updatedAt / updatedBy      // מתעדכנים אוטומטית בכל שמירה

families/{familyId}/users/{uid}
  email, displayName
  disclaimerAcceptedAt: timestamp   // אישור הדיסקליימר, פר-משתמש
```

המודל מוכן לריבוי אלרגנים (מפת `allergens`) ולריבוי משפחות (הכל תחת
`families/{familyId}`), למרות שה-MVP מציג אלרגן אחד ומשפחה אחת. `FAMILY_ID`
ו-`ACTIVE_ALLERGEN` מוגדרים ב-`src/config.js` וכל הקוד עובר דרכם.

## אבטחה

`firestore.rules` מאפשר קריאה/כתיבה רק למשתמש מאומת שהמייל שלו נמצא במערך
`members` של מסמך המשפחה. אף משתמש לא יכול לכתוב למסמך המשפחה עצמו, ולכן אי
אפשר להוסיף את עצמו ל-whitelist מהאפליקציה — רק דרך סקריפט ה-seed.

## מבנה הפרויקט

```
src/
  config.js              קונפיג מרכזי: familyId, אלרגן פעיל, צבעי סטטוס, דיסקליימר
  firebase.js            אתחול Firebase + offline persistence
  hooks/                 useAuth, useFamily (whitelist), useProducts, useUserPrefs
  lib/normalize.js       נרמול עברית לחיפוש
  lib/search.js          חיפוש מקומי + Levenshtein (מימוש עצמי)
  lib/products.js        יצירה/עדכון/מחיקה של מוצרים
  components/            מסכים וקומפוננטות (כל האייקונים inline SVG)
scripts/
  seed.js                סקריפט ה-seed (firebase-admin)
  seed-data.js           רשימת מוצרי הפתיחה
  generate-icons.mjs     יצירת אייקוני PWA ללא תלויות
public/
  manifest.webmanifest   manifest ה-PWA
  sw.js                  service worker
```

## חיפוש

- רץ מקומית על כל הקשה (המאגר קטן — אין קריאות רשת)
- נרמול עברית: הסרת ניקוד, המרת אותיות סופיות (ם→מ, ן→נ, ץ→צ, ף→פ, ך→כ),
  הסרת גרשיים ומקפים, lowercase לאנגלית
- סלחנות לשגיאות כתיב: התאמה חלקית + Levenshtein עד 2 על מילים באורך 4+
- מיון: התאמה מדויקת → מתחיל ב- → מכיל → fuzzy

## מחוץ לסקופ (MVP)

ללא סריקת ברקוד, ללא OCR, ללא AI, ללא ריבוי אלרגנים ב-UI, ללא דיווחים
קהילתיים, ללא התראות push, ללא מסך ניהול משפחות.
