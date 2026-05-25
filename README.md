# BluePi TodoMVC Automation

โปรเจกต์ทดสอบอัตโนมัติสำหรับแอปพลิเคชัน TodoMVC React โดยใช้ Playwright และ TypeScript ตามรูปแบบ Page Object Model (POM)

---

## โครงสร้างโปรเจกต์

```
BluePi-TodoMVC-Automation/
├── pages/
│   └── TodoPage.ts          # Page Object: locators และ actions ทั้งหมด
├── tests/
│   └── todo.spec.ts         # Test suite: ครอบคลุมทุก feature
├── playwright.config.ts     # Playwright configuration (3 browsers, reporters)
├── tsconfig.json            # TypeScript configuration (strict mode)
├── package.json             # Dependencies และ npm scripts
├── package-lock.json        # Lock file สำหรับ dependency versions
└── README.md                # เอกสารนี้
```

> **หมายเหตุ:** โฟลเดอร์ `node_modules/`, `playwright-report/` และ `test-results/`
> จะถูกสร้างขึ้นอัตโนมัติหลังจากรัน `npm install` และ `npm test`
> จึงไม่ได้รวมอยู่ใน repository

### Page Object Model (POM)

```
tests/todo.spec.ts
    └── import TodoPage
            └── pages/TodoPage.ts
                    ├── Locators (private readonly)
                    ├── Actions: addTodo, completeTodo, deleteTodo, filterBy, clearCompleted
                    └── Queries: getTodoTitles, getTodoCount
```

---

## ความต้องการเบื้องต้น

- **Node.js** v18 หรือสูงกว่า ([nodejs.org](https://nodejs.org))
- **npm** v9 หรือสูงกว่า (มาพร้อมกับ Node.js)
- การเชื่อมต่ออินเทอร์เน็ต (สำหรับดาวน์โหลด browsers และเข้าถึง URL เป้าหมาย)

ตรวจสอบเวอร์ชัน:
```bash
node --version
npm --version
```

---

## การติดตั้ง

### Windows

```powershell
# 1. Clone หรือดาวน์โหลดโปรเจกต์
cd C:\Users\YourName\Desktop\BluePi-TodoMVC-Automation

# 2. ติดตั้ง dependencies
npm install

# 3. ติดตั้ง Playwright browsers
npx playwright install chromium firefox webkit
```

### macOS

```bash
# 1. เปิด Terminal แล้วไปยังโฟลเดอร์โปรเจกต์
cd ~/Desktop/BluePi-TodoMVC-Automation

# 2. ติดตั้ง dependencies
npm install

# 3. ติดตั้ง Playwright browsers
npx playwright install chromium firefox webkit
```

### Linux (Ubuntu/Debian)

```bash
# 1. ไปยังโฟลเดอร์โปรเจกต์
cd ~/BluePi-TodoMVC-Automation

# 2. ติดตั้ง dependencies
npm install

# 3. ติดตั้ง Playwright browsers พร้อม system dependencies
npx playwright install --with-deps chromium firefox webkit
```

---

## คำสั่งรัน Test

| คำสั่ง | คำอธิบาย |
|--------|-----------|
| `npm test` | รัน tests ทั้งหมดบน 3 browsers (headless mode) |
| `npm run test:headed` | รัน tests โดยแสดงหน้าต่าง browser |
| `npm run test:ui` | เปิด Playwright UI Mode (interactive, เลือก test ที่ต้องการรันได้) |
| `npm run test:chromium` | รัน tests เฉพาะบน Chromium |
| `npm run test:firefox` | รัน tests เฉพาะบน Firefox |
| `npm run test:webkit` | รัน tests เฉพาะบน WebKit (Safari) |
| `npm run test:report` | เปิด HTML report ใน browser |
| `npm run test:debug` | รัน tests ใน debug mode (หยุดที่แต่ละ step) |

### ตัวอย่างการใช้งาน

```bash
# รัน test เฉพาะไฟล์
npx playwright test tests/todo.spec.ts

# รัน test เฉพาะ test case ที่มีชื่อตรงกัน
npx playwright test -g "should add a single new todo item"

# รัน tests บน Chromium แบบ headed พร้อมแสดง browser
npx playwright test --project=chromium --headed

# รัน tests แบบขนาน 4 workers
npx playwright test --workers=4
```

---

## การดู HTML Report และ Trace Viewer

### HTML Report

หลังจากรัน tests แล้ว report จะถูกสร้างอัตโนมัติในโฟลเดอร์ `playwright-report/`

```bash
# เปิด report ใน browser
npm run test:report

# หรือ
npx playwright show-report
```

### Trace Viewer

Trace จะถูกบันทึกเมื่อ test fail ใน retry ครั้งแรก (trace: 'on-first-retry')

```bash
# เปิด trace จากไฟล์ .zip
npx playwright show-trace test-results/path-to-trace.zip

# ดู trace ออนไลน์ที่
# https://trace.playwright.dev
# แล้วลาก .zip ไฟล์ไปวาง
```

Trace Viewer แสดงข้อมูล:
- ทุก action ที่เกิดขึ้นใน test (timeline)
- Screenshot ก่อน/หลังแต่ละ action
- Network requests
- Console logs

---

## GitHub Actions CI/CD

สร้างไฟล์ `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run Playwright tests
        run: npx playwright test --project=${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 14

      - name: Upload traces on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-traces-${{ matrix.browser }}
          path: test-results/
          retention-days: 7
```

---

## การแก้ปัญหาที่พบบ่อย

### ปัญหา: `Error: browserType.launch: Executable doesn't exist`

**สาเหตุ:** ยังไม่ได้ติดตั้ง browser binaries

**วิธีแก้:**
```bash
npx playwright install chromium firefox webkit
```

---

### ปัญหา: `Cannot find module '../pages/TodoPage'`

**สาเหตุ:** TypeScript path หรือโครงสร้างโฟลเดอร์ไม่ถูกต้อง

**วิธีแก้:** ตรวจสอบว่าไฟล์ `pages/TodoPage.ts` อยู่ในตำแหน่งที่ถูกต้อง:
```bash
ls pages/TodoPage.ts   # macOS/Linux
dir pages\TodoPage.ts  # Windows
```

---

### ปัญหา: Tests ล้มเหลวด้วย `Timeout exceeded`

**สาเหตุ:** การเชื่อมต่ออินเทอร์เน็ตช้า หรือ URL เป้าหมายไม่ตอบสนอง

**วิธีแก้:** เพิ่ม timeout ใน `playwright.config.ts`:
```typescript
use: {
  timeout: 60000,        // เพิ่มเป็น 60 วินาที
  navigationTimeout: 30000,
}
```

---

### ปัญหา: `Error: listen EADDRINUSE` เมื่อรัน `--ui`

**สาเหตุ:** port ที่ใช้สำหรับ UI mode ถูกใช้งานอยู่แล้ว

**วิธีแก้:**
```bash
npx playwright test --ui --ui-port=8080
```

---

### ปัญหา: Tests ผ่านบน local แต่ fail บน CI

**สาเหตุ:** ขาด system dependencies สำหรับ Linux

**วิธีแก้:**
```bash
npx playwright install --with-deps
```

---

### ปัญหา: `WebKit` ไม่ทำงานบน Windows

**สาเหตุ:** WebKit บน Windows ต้องการ Visual C++ Redistributables

**วิธีแก้:**
```powershell
npx playwright install-deps webkit
```

---

## ข้อมูลเพิ่มเติม

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TodoMVC Demo](https://demo.playwright.dev/todomvc)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
