
# חנוכת הבית — חלוקת קטעים בזמן אמת (Next.js + Firebase)

## מה זה עושה?
- מציג רשימת חלקים (חלק 1, חלק 2...) בחלוקה אוטומטית לפי מספר תווים.
- בזמן אמת: פנוי (לבן), בקריאה (כתום + שם), נקרא (ירוק + שם).
- רק חלקים "פנויים" ניתנים לבחירה.
- לכל משתתף שם (נשמר ב-localStorage).
- איפוס עם סיסמה כדי למנוע לחיצה בטעות: **260126**
- מותאם מובייל (RTL, כפתורים גדולים, גלילה נוחה).

## התקנה מקומית
```bash
npm i
npm run dev
```

## פריסה ל-Vercel
1) העלה את הפרויקט ל-GitHub
2) ב-Vercel: Import Project
3) הוסף משתני סביבה (ראה `.env.local.example`)

## Firebase Firestore
- צור Project ב-Firebase
- Firestore Database (Production או Test)
- Rules פשוטים לאירוע (לא מאובטח בכוונה — רק לאירוע):

דוגמה (Firestore Rules) — מאפשר קריאה/כתיבה לכולם:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> אם תרצה: אפשר אחרי האירוע להחזיר לרולס סגורים.

## הכנסת הטקסט המלא
הטקסט נמצא ב- `lib/parts.ts` בתוך `RAW_TEXT`.
אם תרצה 1:1 ללא שום שינוי, הכי טוב להדביק את הטקסט המלא שם (בין ה-backticks).

בהצלחה וחנוכת בית שמחה! 🎉
