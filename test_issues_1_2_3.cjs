const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { chromium } = require('d:/SBA/carrental-FE/node_modules/playwright');

const BASE_URL = 'http://localhost:8080';
const FE_URL = 'http://localhost:3000';

const results = [];
let passed = 0;
let failed = 0;

function record(id, name, ok, actual, expected) {
    results.push({ id, name, ok, actual, expected });
    if (ok) {
        passed++;
        console.log(`[PASS] [${id}] ${name} -> ${actual}`);
    } else {
        failed++;
        console.error(`[FAIL] [${id}] ${name} -> Actual: ${actual} | Expected: ${expected}`);
    }
}

// Valid 8x8 RGB PNG bytes (clean ImageIO decode without warnings)
const VALID_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAD0lEQVR4nGNowAEYhpYEAILzYAGc7g8kAAAAAElFTkSuQmCC',
    'base64'
);
// Valid minimal 1x1 JPEG bytes (generated programmatically or tiny JFIF)
const VALID_JPEG_HEADER_INVALID = Buffer.from('not a real jpeg file', 'utf8');

function jsonReq(method, urlPath, token, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE_URL);
        const data = body ? JSON.stringify(body) : null;
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        if (data) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers,
        }, res => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                resolve({ status: res.statusCode, data: parsed, raw });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function multipartReq(urlPath, token, parts) {
    return new Promise((resolve, reject) => {
        const boundary = '----CarDbBoundary' + Date.now() + Math.random().toString(16).slice(2);
        const chunks = [];
        for (const p of parts) {
            chunks.push(Buffer.from(`--${boundary}\r\n`));
            if (p.filename) {
                chunks.push(Buffer.from(`Content-Disposition: form-data; name="${p.name}"; filename="${p.filename}"\r\n`));
                chunks.push(Buffer.from(`Content-Type: ${p.contentType || 'application/octet-stream'}\r\n\r\n`));
                chunks.push(p.buffer);
                chunks.push(Buffer.from('\r\n'));
            } else {
                chunks.push(Buffer.from(`Content-Disposition: form-data; name="${p.name}"\r\n\r\n`));
                chunks.push(Buffer.from(String(p.value)));
                chunks.push(Buffer.from('\r\n'));
            }
        }
        chunks.push(Buffer.from(`--${boundary}--\r\n`));
        const body = Buffer.concat(chunks);
        const url = new URL(urlPath, BASE_URL);
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
            },
        }, res => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                resolve({ status: res.statusCode, data: parsed, raw });
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function login(email, password = 'Password123@') {
    const res = await jsonReq('POST', '/api/auth/login', null, { email, password });
    return res.data?.data?.accessToken;
}

async function registerVerifiedCustomer(prefix) {
    const ts = Date.now() + '_' + Math.floor(Math.random() * 10000);
    const email = `${prefix}_${ts}@test.vn`;
    const phone = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
    const reg = await jsonReq('POST', '/api/auth/register', null, {
        fullName: `Test ${prefix}`,
        email,
        phone,
        password: 'Password123@',
    });
    if (reg.status !== 200 && reg.status !== 201) {
        throw new Error(`Register failed ${reg.status}: ${reg.raw}`);
    }
    const token = await login(email);
    if (!token) throw new Error(`Login after register failed for ${email}`);
    return { email, token, id: reg.data?.data?.id };
}

async function run() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cardb-test-'));
    const png1Path = path.join(tmpDir, 'car-front.png');
    const png2Path = path.join(tmpDir, 'car-side.png');
    const cavetPath = path.join(tmpDir, 'cavet.png');
    const txtPath = path.join(tmpDir, 'invalid.txt');
    const bigPngPath = path.join(tmpDir, 'oversized.png');
    const fakeJpgPath = path.join(tmpDir, 'fake-spoof.jpg');
    const realJpgPath = 'd:/SBA/docs/postman/fixtures/synthetic-front.jpg';
    const realWebpPath = 'd:/SBA/carrental-FE/public/images/9aa3d9bc2c6c3ec1.webp';

    fs.writeFileSync(png1Path, VALID_PNG);
    fs.writeFileSync(png2Path, VALID_PNG);
    fs.writeFileSync(cavetPath, VALID_PNG);
    fs.writeFileSync(txtPath, 'not-an-image');
    fs.writeFileSync(fakeJpgPath, VALID_JPEG_HEADER_INVALID);
    const bigBuf = Buffer.alloc(5 * 1024 * 1024 + 512, 0);
    VALID_PNG.copy(bigBuf);
    fs.writeFileSync(bigPngPath, bigBuf);
    const medBuf = Buffer.alloc(4 * 1024 * 1024 + 200 * 1024, 0);
    VALID_PNG.copy(medBuf);

    const adminToken = await login('admin@carrental.vn');
    const ownerToken = await login('binh@gmail.com');
    record('SETUP', 'Seeded Admin & Owner login', Boolean(adminToken && ownerToken), 'Tokens obtained', 'Valid JWTs');

    // ========================================================
    // ISSUE 1: CAR IMAGE UPLOAD (API)
    // ========================================================
    console.log('\n=== ISSUE 1: API TESTS ===');
    const upPng = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'front.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    const uploadedUrl = upPng.data?.data?.url;
    record('I1-API-01', 'Upload valid PNG via /api/uploads/images', upPng.status === 200 && uploadedUrl?.startsWith('/api/uploads/files/'), `HTTP ${upPng.status}, url=${uploadedUrl}`, 'HTTP 200 + internal path');

    if (uploadedUrl) {
        const fetched = await jsonReq('GET', uploadedUrl);
        record('I1-API-02', 'Serve uploaded file publicly via /api/uploads/files/{name}', fetched.status === 200, `HTTP ${fetched.status}`, 'HTTP 200');
    }

    const upBatch = await multipartReq('/api/uploads/images/batch', ownerToken, [
        { name: 'files', filename: 'a.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'files', filename: 'b.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    record('I1-API-03', 'Batch upload multiple images', upBatch.status === 200 && upBatch.data?.data?.urls?.length === 2, `HTTP ${upBatch.status}, count=${upBatch.data?.data?.urls?.length}`, 'HTTP 200, 2 urls');

    const upBadFmt = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'bad.txt', contentType: 'text/plain', buffer: VALID_PNG },
    ]);
    record('I1-API-04', 'Reject invalid file extension (.txt)', upBadFmt.status === 415, `HTTP ${upBadFmt.status}`, 'HTTP 415');

    const upFakeImg = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'fake.jpg', contentType: 'image/jpeg', buffer: VALID_JPEG_HEADER_INVALID },
    ]);
    record('I1-API-05', 'Reject non-image bytes masquerading as .jpg', upFakeImg.status === 415, `HTTP ${upFakeImg.status}`, 'HTTP 415');

    const upTooBig = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'huge.png', contentType: 'image/png', buffer: bigBuf },
    ]);
    record('I1-API-06', 'Reject image > 5MB', upTooBig.status === 413, `HTTP ${upTooBig.status}`, 'HTTP 413');

    const apiPlate = `51K-${Math.floor(10000 + Math.random() * 89999)}`;
    const carCreate = await jsonReq('POST', '/api/cars', ownerToken, {
        licensePlate: apiPlate,
        brand: 'Kia',
        model: 'Seltos',
        manufactureYear: 2024,
        carType: 'SUV',
        seats: 5,
        transmission: 'AUTOMATIC',
        fuelType: 'GASOLINE',
        city: 'Hồ Chí Minh',
        pickupAddress: '10 Thảo Điền',
        pricePerDay: 950000,
    });
    const apiCarId = carCreate.data?.data?.id;
    const carImgMulti = await multipartReq(`/api/cars/${apiCarId}/images`, ownerToken, [
        { name: 'files', filename: 'c1.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'files', filename: 'c2.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'primaryIndex', value: '0' },
    ]);
    const carDetailAfter = await jsonReq('GET', `/api/cars/${apiCarId}`, ownerToken);
    record(
        'I1-API-07',
        'Multipart POST /api/cars/{id}/images saves paths to DB',
        carImgMulti.status === 200 && carDetailAfter.data?.data?.images?.length === 2 && carDetailAfter.data?.data?.images[0]?.imageUrl?.startsWith('/api/uploads/files/'),
        `HTTP ${carImgMulti.status}, dbImages=${carDetailAfter.data?.data?.images?.length}, url=${carDetailAfter.data?.data?.images?.[0]?.imageUrl}`,
        'HTTP 200 & 2 DB images'
    );

    const realJpgBuf = fs.readFileSync(realJpgPath);
    const realWebpBuf = fs.readFileSync(realWebpPath);
    const upJpg = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'real.jpg', contentType: 'image/jpeg', buffer: realJpgBuf },
    ]);
    const upWebp = await multipartReq('/api/uploads/images', ownerToken, [
        { name: 'file', filename: 'real.webp', contentType: 'image/webp', buffer: realWebpBuf },
    ]);
    const jpgRead = upJpg.data?.data?.url ? await jsonReq('GET', upJpg.data.data.url) : { status: 0 };
    const webpRead = upWebp.data?.data?.url ? await jsonReq('GET', upWebp.data.data.url) : { status: 0 };
    record(
        'I1-API-08',
        'Upload real JPG and WebP files and serve publicly',
        upJpg.status === 200 && upWebp.status === 200 && jpgRead.status === 200 && webpRead.status === 200,
        `jpg=${upJpg.status}/${jpgRead.status}, webp=${upWebp.status}/${webpRead.status}`,
        'All HTTP 200'
    );

    const largeMulti = await multipartReq(`/api/cars/${apiCarId}/images`, ownerToken, [
        { name: 'files', filename: 'm1.png', contentType: 'image/png', buffer: medBuf },
        { name: 'files', filename: 'm2.png', contentType: 'image/png', buffer: medBuf },
        { name: 'files', filename: 'm3.png', contentType: 'image/png', buffer: medBuf },
    ]);
    record(
        'I1-API-09',
        'Multi-file upload 3x4.2MB (>11MB total, <=5MB each) succeeds HTTP 200',
        largeMulti.status === 200 && largeMulti.data?.data?.length === 3,
        `HTTP ${largeMulti.status}, saved=${largeMulti.data?.data?.length}`,
        'HTTP 200 & 3 saved'
    );

    // ========================================================
    // ISSUE 2 & 3: OWNER UPGRADE LIMIT, PENDING, EMAIL, REASON (API)
    // ========================================================
    console.log('\n=== ISSUE 2 & 3: API TESTS ===');
    const uLimit = await registerVerifiedCustomer('upglimit');

    // Attempt 1
    const sub1 = await multipartReq('/api/user-documents', uLimit.token, [
        { name: 'docType', value: 'CITIZEN_ID' },
        { name: 'docNumber', value: `CCCD1_${Date.now()}` },
        { name: 'fullNameOnDoc', value: 'Test Limit User' },
        { name: 'dateOfBirthOnDoc', value: '1995-05-05' },
        { name: 'frontImage', filename: 'f1.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'backImage', filename: 'b1.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    const doc1Id = sub1.data?.data?.id;
    record('I2-API-01', 'Attempt 1 (CITIZEN_ID) succeeds as PENDING', sub1.status === 201 && sub1.data?.data?.verifyStatus === 'PENDING', `HTTP ${sub1.status}, id=${doc1Id}, raw=${sub1.raw}`, 'HTTP 201 PENDING');

    // While PENDING, try submitting PASSPORT -> MUST fail 409
    const subPendingBlocked = await multipartReq('/api/user-documents', uLimit.token, [
        { name: 'docType', value: 'PASSPORT' },
        { name: 'docNumber', value: `PPBLOCK_${Date.now()}` },
        { name: 'frontImage', filename: 'f.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    record('I2-API-02', 'Submitting PASSPORT while CITIZEN_ID is PENDING is blocked (409)', subPendingBlocked.status === 409, `HTTP ${subPendingBlocked.status}, msg=${subPendingBlocked.data?.message}`, 'HTTP 409');

    // Admin rejects without reason -> MUST fail 400
    const rejNoReason = await jsonReq('PATCH', `/api/user-documents/${doc1Id}/review`, adminToken, {
        verifyStatus: 'REJECTED',
        rejectReason: '   ',
    });
    record('I3-API-01', 'Admin rejecting without rejectReason fails 400', rejNoReason.status === 400, `HTTP ${rejNoReason.status}`, 'HTTP 400');

    // Admin rejects WITH reason
    const reason1 = 'Ảnh mặt trước bị mờ góc phải';
    const rej1 = await jsonReq('PATCH', `/api/user-documents/${doc1Id}/review`, adminToken, {
        verifyStatus: 'REJECTED',
        rejectReason: reason1,
    });
    record('I3-API-02', 'Admin rejects Attempt 1 with reason', rej1.status === 200 && rej1.data?.data?.document?.rejectReason === reason1, `HTTP ${rej1.status}`, 'HTTP 200');

    // User fetches listMine -> MUST include rejectReason
    const listMine1 = await jsonReq('GET', '/api/user-documents?scope=mine', uLimit.token);
    const mineDoc1 = listMine1.data?.data?.content?.[0];
    record('I3-API-03', 'GET /api/user-documents?scope=mine returns rejectReason to user', mineDoc1?.rejectReason === reason1, `rejectReason="${mineDoc1?.rejectReason}"`, `rejectReason="${reason1}"`);

    // User fetches /api/customers/me/kyc -> MUST include quota counts
    const kyc1 = await jsonReq('GET', '/api/customers/me/kyc', uLimit.token);
    record(
        'I3-API-04',
        'GET /api/customers/me/kyc returns 1/3 used, 2 remaining',
        kyc1.status === 200 && kyc1.data?.data?.upgradeAttemptsUsed === 1 && kyc1.data?.data?.upgradeAttemptsRemaining === 2 && kyc1.data?.data?.hasPendingUpgradeRequest === false,
        JSON.stringify(kyc1.data?.data),
        'used=1, remaining=2, pending=false'
    );

    // Attempt 2 (PASSPORT) & Reject
    const sub2 = await multipartReq('/api/user-documents', uLimit.token, [
        { name: 'docType', value: 'PASSPORT' },
        { name: 'docNumber', value: `PP2_${Date.now()}` },
        { name: 'frontImage', filename: 'f2.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    const doc2Id = sub2.data?.data?.id;
    const rej2 = await jsonReq('PATCH', `/api/user-documents/${doc2Id}/review`, adminToken, {
        verifyStatus: 'REJECTED',
        rejectReason: 'Hộ chiếu sắp hết hạn',
    });
    record('I2-API-03', 'Attempt 2 submitted and rejected', sub2.status === 201 && rej2.status === 200, `sub=${sub2.status}, rej=${rej2.status}`, '201 & 200');

    // Attempt 3 (CITIZEN_ID) & Reject
    const sub3 = await multipartReq('/api/user-documents', uLimit.token, [
        { name: 'docType', value: 'CITIZEN_ID' },
        { name: 'docNumber', value: `CCCD3_${Date.now()}` },
        { name: 'frontImage', filename: 'f3.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'backImage', filename: 'b3.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    const doc3Id = sub3.data?.data?.id;
    const rej3 = await jsonReq('PATCH', `/api/user-documents/${doc3Id}/review`, adminToken, {
        verifyStatus: 'REJECTED',
        rejectReason: 'Thông tin không khớp hồ sơ',
    });
    record('I2-API-04', 'Attempt 3 submitted and rejected', sub3.status === 201 && rej3.status === 200, `sub=${sub3.status}, rej=${rej3.status}`, '201 & 200');

    // Attempt 4 MUST fail with 400 OWNER_UPGRADE_LIMIT_EXCEEDED
    const sub4 = await multipartReq('/api/user-documents', uLimit.token, [
        { name: 'docType', value: 'CITIZEN_ID' },
        { name: 'docNumber', value: `CCCD4_${Date.now()}` },
        { name: 'frontImage', filename: 'f4.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'backImage', filename: 'b4.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    record('I2-API-05', '4th upgrade attempt blocked at BE (400 OWNER_UPGRADE_LIMIT_EXCEEDED)', sub4.status === 400 && sub4.data?.code === 'OWNER_UPGRADE_LIMIT_EXCEEDED', `HTTP ${sub4.status}, code=${sub4.data?.code}, msg=${sub4.data?.message}, raw=${sub4.raw}`, 'HTTP 400 OWNER_UPGRADE_LIMIT_EXCEEDED');

    // Also test a user whose request is PENDING for Playwright UI check
    const uPending = await registerVerifiedCustomer('upgpend');
    await multipartReq('/api/user-documents', uPending.token, [
        { name: 'docType', value: 'CITIZEN_ID' },
        { name: 'docNumber', value: `CCCDP_${Date.now()}` },
        { name: 'frontImage', filename: 'fp.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'backImage', filename: 'bp.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);

    // And test approval promotes to OWNER
    const uApprove = await registerVerifiedCustomer('upgok');
    const subOk = await multipartReq('/api/user-documents', uApprove.token, [
        { name: 'docType', value: 'CITIZEN_ID' },
        { name: 'docNumber', value: `CCCDOK_${Date.now()}` },
        { name: 'fullNameOnDoc', value: 'Test upgok' },
        { name: 'dateOfBirthOnDoc', value: '1995-01-01' },
        { name: 'issuePlace', value: 'Cục Cảnh sát' },
        { name: 'issueDate', value: '2022-01-01' },
        { name: 'frontImage', filename: 'fo.png', contentType: 'image/png', buffer: VALID_PNG },
        { name: 'backImage', filename: 'bo.png', contentType: 'image/png', buffer: VALID_PNG },
    ]);
    const appRes = await jsonReq('PATCH', `/api/user-documents/${subOk.data.data.id}/review`, adminToken, {
        verifyStatus: 'APPROVED',
    });
    const profAfter = await jsonReq('GET', '/api/customers/me', await login(uApprove.email));
    record('I2-API-06', 'Admin approval upgrades user to OWNER', appRes.status === 200 && profAfter.data?.data?.role === 'OWNER', `role=${profAfter.data?.data?.role}`, 'OWNER');

    // ========================================================
    // PLAYWRIGHT EDGE UI VERIFICATION
    // ========================================================
    console.log('\n=== PLAYWRIGHT EDGE UI TESTS ===');
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        // 1. Issue 1 UI: Owner creates car via local image upload, sees previews, validates errors, renders on list & detail
        const ctx1 = await browser.newContext();
        const page = await ctx1.newPage();
        await page.goto(`${FE_URL}/login`, { waitUntil: 'networkidle' });
        await page.fill('input[type="email"]', 'binh@gmail.com');
        await page.fill('input[type="password"]', 'Password123@');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1500);

        await page.goto(`${FE_URL}/owner/vehicles/new`, { waitUntil: 'networkidle' });
        const uiPlate = `51H-${Math.floor(10000 + Math.random() * 89999)}`;
        // Fill plate & address in step 1
        await page.fill('input[placeholder="51K-889.92"]', uiPlate);
        await page.fill('input[placeholder="128 Thảo Điền, P. Thảo Điền"]', '88 Lê Lợi, Q.1');

        // Test invalid format file on cavet
        const step1FileInputs = page.locator('input[type="file"]');
        await step1FileInputs.nth(0).setInputFiles(txtPath);
        await page.waitForTimeout(300);
        const badDocAlert = await page.locator('[role="alert"]').first().textContent().catch(() => '');
        record('I1-UI-01', 'Step 1 rejects invalid document image format (.txt) in UI', badDocAlert.includes('JPG, PNG hoặc WebP'), badDocAlert, 'Format validation error');

        // Test valid PNG file on cavet -> preview renders BEFORE saving
        await step1FileInputs.nth(0).setInputFiles(cavetPath);
        await page.waitForTimeout(400);
        const cavetPreviewSrc = await page.locator('img[alt="Xem trước giấy đăng ký xe"]').getAttribute('src');
        record('I1-UI-02', 'Step 1 shows blob preview of local cavet file BEFORE saving', Boolean(cavetPreviewSrc && cavetPreviewSrc.startsWith('blob:')), cavetPreviewSrc, 'blob:... preview');

        // Advance Step 1 -> Step 2 -> Step 3 -> Step 4
        await page.getByRole('button', { name: /Tiếp tục: Thông số/i }).click();
        await page.waitForTimeout(300);
        await page.getByRole('button', { name: /Tiếp tục: Cài đặt bảng giá/i }).click();
        await page.waitForTimeout(300);
        await page.locator('input[placeholder="Tối thiểu 10.000đ"]').nth(0).fill('900000');
        await page.locator('input[placeholder="Tối thiểu 10.000đ"]').nth(1).fill('1000000');
        await page.locator('input[placeholder="Nhập 0 nếu miễn cọc"]').fill('3000000');
        await page.waitForTimeout(200);
        await page.getByRole('button', { name: /Tiếp tục: Tải bộ ảnh niêm yết/i }).click();
        await page.waitForTimeout(400);

        // Step 4: test >5MB file rejected
        const multiInput = page.locator('input[type="file"][multiple]');
        await multiInput.setInputFiles(bigPngPath);
        await page.waitForTimeout(300);
        const bigAlert = await page.locator('[role="alert"]').first().textContent().catch(() => '');
        record('I1-UI-03', 'Step 4 rejects image > 5MB in UI', bigAlert.includes('5MB'), bigAlert, '5MB size error');

        // Step 4: pick multiple valid local images at once
        await multiInput.setInputFiles([png1Path, png2Path]);
        await page.waitForTimeout(500);
        const previewImgs = page.locator('img[src^="blob:"]');
        const previewCount = await previewImgs.count();
        record('I1-UI-04', 'Step 4 shows multiple local image previews BEFORE saving', previewCount >= 2, `blobPreviews=${previewCount}`, '>= 2 previews');

        // Agree and submit
        await page.locator('input[type="checkbox"]').last().check();
        await page.getByRole('button', { name: /Gửi BQL CarDB thẩm định/i }).click();
        await page.waitForURL('**/owner/vehicles', { timeout: 15000 });
        await page.waitForTimeout(1200);
        const ownerVehiclesHtml = await page.content();
        const uiCarFound = ownerVehiclesHtml.includes(uiPlate);
        record('I1-UI-05', 'Submitted car with uploaded files redirects to /owner/vehicles', uiCarFound, `contains ${uiPlate}=${uiCarFound}`, 'Car appears in owner list');

        // Find created car ID via API and verify image URLs + approve car to verify public Explore & CarDetail
        const myCars = await jsonReq('GET', '/api/cars/my-cars?size=50', ownerToken);
        const createdUiCar = (myCars.data?.data?.content || []).find(c => c.licensePlate === uiPlate);
        const uiCarId = createdUiCar?.id;
        let hasUploadedPath = false;
        if (uiCarId) {
            const uiCarDetail = await jsonReq('GET', `/api/cars/${uiCarId}`, ownerToken);
            const imgs = uiCarDetail.data?.data?.images || [];
            hasUploadedPath = imgs.length === 2 && imgs.every(i => i.imageUrl.startsWith('/api/uploads/files/'));
            // Approve doc & car + activate so it renders publicly on /explore & /cars/:id
            const docs = await jsonReq('GET', `/api/cars/${uiCarId}/documents`, adminToken);
            for (const d of docs.data?.data || []) {
                await jsonReq('PATCH', `/api/admin/cars/${uiCarId}/documents/${d.id}/verify`, adminToken, { verifyStatus: 'APPROVED' });
            }
            await jsonReq('POST', `/api/admin/cars/${uiCarId}/approve`, adminToken);
            await jsonReq('PATCH', `/api/cars/${uiCarId}/status?status=ACTIVE`, ownerToken);
            // Subscribe + simulate gateway success so car is LISTED on public /explore
            const pkgs = await jsonReq('GET', '/api/packages');
            const pkgId = pkgs.data?.data?.[0]?.id;
            if (pkgId) {
                const sub = await jsonReq('POST', '/api/subscriptions', ownerToken, { carId: uiCarId, packageId: pkgId });
                const subId = sub.data?.data?.id;
                if (subId) {
                    const txn = await jsonReq('POST', '/api/transactions/package-payment', ownerToken, { subscriptionId: subId, paymentMethod: 'VNPAY' });
                    const txnId = txn.data?.data?.id;
                    if (txnId) {
                        await jsonReq('POST', `/api/transactions/${txnId}/simulate-gateway`, ownerToken, { simulateSuccess: true });
                    }
                }
            }
        }
        record('I1-UI-06', 'Car created from UI saved 2 /api/uploads/files/... images in DB', hasUploadedPath, `carId=${uiCarId}`, '2 internal uploaded URLs');

        if (uiCarId) {
            await page.goto(`${FE_URL}/owner/vehicles`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(800);
            const ownerImgWidth = await page.locator(`img[src*="/api/uploads/files/"]`).first().evaluate(el => el.naturalWidth).catch(() => 0);
            record('I1-UI-06b', 'Uploaded car image renders on Owner Vehicles page', ownerImgWidth > 0, `naturalWidth=${ownerImgWidth}`, '> 0');

            await page.goto(`${FE_URL}/cars/${uiCarId}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            const detailImg = page.locator('article img').first();
            const detailSrc = await detailImg.getAttribute('src');
            const naturalWidth = await detailImg.evaluate(el => el.naturalWidth);
            record('I1-UI-07', 'Uploaded car image renders properly on Car Detail page', Boolean(detailSrc?.includes('/api/uploads/files/') && naturalWidth > 0), `src=${detailSrc}, naturalWidth=${naturalWidth}`, 'naturalWidth > 0 & /api/uploads/files/...');

            const thumbBtns = page.locator('article button img');
            const thumbCount = await thumbBtns.count();
            let switchedSrc = '';
            if (thumbCount >= 2) {
                await page.locator('article button').nth(1).click();
                await page.waitForTimeout(200);
                switchedSrc = await detailImg.getAttribute('src');
            }
            record('I1-UI-07b', 'Car Detail thumbnails switch main uploaded image', thumbCount >= 2 && Boolean(switchedSrc?.includes('/api/uploads/files/')) && switchedSrc !== detailSrc, `thumbs=${thumbCount}, before=${detailSrc}, after=${switchedSrc}`, 'switched to 2nd uploaded image');

            await page.goto(`${FE_URL}/explore`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);
            const suggestBtn = page.getByRole('button', { name: /Gợi ý: nhận 9:00 ngày mai/i });
            if (await suggestBtn.count()) {
                await suggestBtn.click();
            }
            await page.getByRole('button', { name: /Tìm xe/i }).click();
            await page.waitForTimeout(1200);
            const exploreImg = page.locator(`img[src*="/api/uploads/files/"]`).first();
            const exploreMatch = await page.locator(`img[src*="/api/uploads/files/"]`).count();
            const exploreWidth = exploreMatch > 0 ? await exploreImg.evaluate(el => el.naturalWidth) : 0;
            record('I1-UI-08', 'Uploaded car image renders on Explore list page', exploreMatch > 0 && exploreWidth > 0, `uploadedImgOnExplore=${exploreMatch}, naturalWidth=${exploreWidth}`, '> 0 & loaded');

            // Test OwnerVehicleEditPage: upload .webp, preview before save, set primary, delete image
            await page.goto(`${FE_URL}/owner/vehicles/edit/${uiCarId}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(800);
            await page.getByRole('button', { name: /Hình ảnh niêm yết/i }).click();
            await page.waitForTimeout(300);
            await page.locator('input[type="file"][multiple]').setInputFiles(realWebpPath);
            await page.waitForTimeout(400);
            const editBlobCount = await page.locator('img[src^="blob:"]').count();
            await page.getByRole('button', { name: /Lưu ảnh mới/i }).click();
            await page.waitForTimeout(1000);
            const editImgsAfterUpload = await page.locator('img[src*="/api/uploads/files/"]').count();
            const setPrimaryBtns = page.getByRole('button', { name: 'Đặt ảnh chính' });
            const primaryBtnsBefore = await setPrimaryBtns.count();
            if (primaryBtnsBefore > 0) {
                await setPrimaryBtns.last().click();
                await page.waitForTimeout(800);
            }
            const carAfterPrimary = await jsonReq('GET', `/api/cars/${uiCarId}`, ownerToken);
            const webpIsPrimary = (carAfterPrimary.data?.data?.images || []).some(img => img.isPrimary && img.imageUrl.endsWith('.webp'));
            const deleteBtns = page.getByRole('button', { name: 'Xóa', exact: true });
            if (await deleteBtns.count() >= 2) {
                await deleteBtns.first().click();
                await page.waitForTimeout(800);
            }
            const carAfterDelete = await jsonReq('GET', `/api/cars/${uiCarId}`, ownerToken);
            record(
                'I1-UI-09',
                'OwnerVehicleEditPage uploads WebP with preview, sets primary image, and deletes image',
                editBlobCount >= 1 && editImgsAfterUpload >= 3 && webpIsPrimary && (carAfterDelete.data?.data?.images?.length === 2),
                `blob=${editBlobCount}, afterUpload=${editImgsAfterUpload}, webpPrimary=${webpIsPrimary}, afterDelete=${carAfterDelete.data?.data?.images?.length}`,
                'preview>=1, upload>=3, webpPrimary=true, afterDelete=2'
            );

            // Test OwnerVehicleNewPage: spoofed .jpg fails cleanly without creating orphan car, then mixed URL (front) + local .jpg (rear) keeps front primary
            await page.goto(`${FE_URL}/owner/vehicles/new`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);
            const mixPlate = `51M-${Math.floor(10000 + Math.random() * 89999)}`;
            await page.fill('input[placeholder="51K-889.92"]', mixPlate);
            await page.fill('input[placeholder="128 Thảo Điền, P. Thảo Điền"]', '99 Hai Bà Trưng, Q.1');
            await page.locator('input[type="file"]').nth(0).setInputFiles(realJpgPath);
            await page.waitForTimeout(300);
            await page.getByRole('button', { name: /Tiếp tục: Thông số/i }).click();
            await page.waitForTimeout(250);
            await page.getByRole('button', { name: /Tiếp tục: Cài đặt bảng giá/i }).click();
            await page.waitForTimeout(250);
            await page.locator('input[placeholder="Tối thiểu 10.000đ"]').nth(0).fill('850000');
            await page.locator('input[placeholder="Tối thiểu 10.000đ"]').nth(1).fill('950000');
            await page.locator('input[placeholder="Nhập 0 nếu miễn cọc"]').fill('2000000');
            await page.waitForTimeout(200);
            await page.getByRole('button', { name: /Tiếp tục: Tải bộ ảnh niêm yết/i }).click();
            await page.waitForTimeout(300);

            const slotInputs = page.locator('input[type="url"]');
            await slotInputs.nth(0).fill('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400');
            const singleSlotFiles = page.locator('input[type="file"]:not([multiple])');
            await singleSlotFiles.nth(1).setInputFiles(fakeJpgPath);
            await page.waitForTimeout(200);
            await page.locator('input[type="checkbox"]').last().check();
            await page.getByRole('button', { name: /Gửi BQL CarDB thẩm định/i }).click();
            await page.waitForTimeout(1000);
            const myCarsCheck = await jsonReq('GET', '/api/cars/my-cars?size=50', ownerToken);
            const noOrphan = !(myCarsCheck.data?.data?.content || []).some(c => c.licensePlate === mixPlate);

            // Now replace spoofed .jpg with real .jpg and resubmit -> succeeds with front URL as primary!
            await singleSlotFiles.nth(1).setInputFiles(realJpgPath);
            await page.waitForTimeout(300);
            await page.getByRole('button', { name: /Gửi BQL CarDB thẩm định/i }).click();
            await page.waitForURL('**/owner/vehicles', { timeout: 15000 });
            await page.waitForTimeout(800);
            const myCarsAfterMix = await jsonReq('GET', '/api/cars/my-cars?size=50', ownerToken);
            const mixCar = (myCarsAfterMix.data?.data?.content || []).find(c => c.licensePlate === mixPlate);
            const mixDetail = mixCar ? await jsonReq('GET', `/api/cars/${mixCar.id}`, ownerToken) : null;
            const mixImgs = mixDetail?.data?.data?.images || [];
            const frontRemainsPrimary = mixImgs.length === 2 && mixImgs[0].isPrimary && mixImgs[0].imageUrl.startsWith('https://') && !mixImgs[1].isPrimary && mixImgs[1].imageUrl.startsWith('/api/uploads/files/');
            record(
                'I1-UI-10',
                'Spoofed .jpg leaves no orphan car and mixed URL(front)+File(rear) preserves front as primary',
                noOrphan && frontRemainsPrimary,
                `noOrphan=${noOrphan}, imgs=${JSON.stringify(mixImgs.map(i => ({ p: i.isPrimary, u: i.imageUrl })))}`,
                'noOrphan=true & front URL isPrimary=true'
            );
        }
        await ctx1.close();

        // 2. Issue 2 & 3 UI: Pending lockout
        const ctxPend = await browser.newContext();
        const pagePend = await ctxPend.newPage();
        await pagePend.goto(`${FE_URL}/login`, { waitUntil: 'networkidle' });
        await pagePend.fill('input[type="email"]', uPending.email);
        await pagePend.fill('input[type="password"]', 'Password123@');
        await pagePend.click('button[type="submit"]');
        await pagePend.waitForTimeout(1500);
        await pagePend.goto(`${FE_URL}/account/verification`, { waitUntil: 'networkidle' });
        await pagePend.waitForTimeout(1000);
        const pendText = await pagePend.textContent('body');
        const pendSubmitDisabled = await pagePend.locator('form button[type="submit"]').isDisabled();
        record('I2-UI-01', 'Verification page shows PENDING lockout banner & disables submit button', pendText.includes('1/3') && pendText.includes('PENDING') && pendSubmitDisabled, `disabled=${pendSubmitDisabled}`, 'disabled=true + quota 1/3 + PENDING banner');
        await ctxPend.close();

        // 3. Issue 2 & 3 UI: 3/3 limit exhausted + rejection reason visible
        const ctxLimit = await browser.newContext();
        const pageLimit = await ctxLimit.newPage();
        await pageLimit.goto(`${FE_URL}/login`, { waitUntil: 'networkidle' });
        await pageLimit.fill('input[type="email"]', uLimit.email);
        await pageLimit.fill('input[type="password"]', 'Password123@');
        await pageLimit.click('button[type="submit"]');
        await pageLimit.waitForTimeout(1500);
        await pageLimit.goto(`${FE_URL}/account/verification`, { waitUntil: 'networkidle' });
        await pageLimit.waitForTimeout(1000);
        const limitBody = await pageLimit.textContent('body');
        const limitDisabled = await pageLimit.locator('form button[type="submit"]').isDisabled();
        const hasQuota = limitBody.includes('3/3') && limitBody.includes('Còn lại 0 lần');
        const hasReasons = limitBody.includes('Ảnh mặt trước bị mờ góc phải') && limitBody.includes('Thông tin không khớp hồ sơ');
        record('I2-UI-02', 'Verification page disables submit & shows 3/3 limit exhausted message', limitDisabled && hasQuota, `disabled=${limitDisabled}, hasQuota=${hasQuota}`, 'disabled=true & 3/3 quota');
        record('I3-UI-01', 'Verification page visibly renders Admin rejection reasons', hasReasons, `hasReasons=${hasReasons}`, 'All rejection reasons visible');
        await ctxLimit.close();

        // 4. Issue 3 UI: Admin Users page shows rejectReason and Admin can reject via UI
        const ctxAdm = await browser.newContext();
        const pageAdm = await ctxAdm.newPage();
        await pageAdm.goto(`${FE_URL}/login`, { waitUntil: 'networkidle' });
        await pageAdm.fill('input[type="email"]', 'admin@carrental.vn');
        await pageAdm.fill('input[type="password"]', 'Password123@');
        await pageAdm.click('button[type="submit"]');
        await pageAdm.waitForTimeout(1500);
        await pageAdm.goto(`${FE_URL}/admin/users?id=${uPending.id}`, { waitUntil: 'networkidle' });
        await pageAdm.waitForTimeout(1200);
        await pageAdm.getByRole('button', { name: 'Từ chối', exact: true }).first().click();
        await pageAdm.waitForTimeout(300);
        // Check confirm disabled when reason empty
        const confirmBtn = pageAdm.getByRole('button', { name: 'Xác nhận' });
        const disabledWithoutReason = await confirmBtn.isDisabled();
        await pageAdm.locator('textarea').fill('Ảnh mặt sau bị che số');
        await confirmBtn.click();
        await pageAdm.waitForTimeout(1200);
        const admDetailText = await pageAdm.textContent('body');
        record('I3-UI-02', 'Admin cannot confirm reject without reason and reason appears on Admin UI after reject', disabledWithoutReason && admDetailText.includes('Ảnh mặt sau bị che số'), `disabledWithoutReason=${disabledWithoutReason}`, 'Reason required & displayed');
        await ctxAdm.close();

        // Verify user now sees that UI-submitted rejection reason
        const ctxPend2 = await browser.newContext();
        const pagePend2 = await ctxPend2.newPage();
        await pagePend2.goto(`${FE_URL}/login`, { waitUntil: 'networkidle' });
        await pagePend2.fill('input[type="email"]', uPending.email);
        await pagePend2.fill('input[type="password"]', 'Password123@');
        await pagePend2.click('button[type="submit"]');
        await pagePend2.waitForTimeout(1500);
        await pagePend2.goto(`${FE_URL}/account/verification`, { waitUntil: 'networkidle' });
        await pagePend2.waitForTimeout(1000);
        const p2Text = await pagePend2.textContent('body');
        const p2BtnEnabled = !(await pagePend2.locator('form button[type="submit"]').isDisabled());
        record('I3-UI-03', 'User sees UI-rejected reason and remaining quota (1/3 sent, 2 left, form re-enabled)', p2Text.includes('Ảnh mặt sau bị che số') && p2Text.includes('Còn lại 2 lần') && p2BtnEnabled, `btnEnabled=${p2BtnEnabled}`, 'Reason + 2 left + re-enabled');
        await ctxPend2.close();
    } finally {
        await browser.close();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    console.log(`\n=== SUMMARY: ${passed} PASSED / ${failed} FAILED (TOTAL ${results.length}) ===`);
    if (failed > 0) process.exit(1);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
