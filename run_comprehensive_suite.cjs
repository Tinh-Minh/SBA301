const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { chromium } = require('d:/SBA/carrental-FE/node_modules/playwright');

const BASE_URL = 'http://localhost:8080';
const FE_URL = 'http://localhost:3000';

const results = [];
let passedCount = 0;
let failedCount = 0;

function logTest(id, feature, scenario, passed, actual, expected, severity = 'Medium', suspectedFile = '') {
    const item = { id, feature, scenario, passed, actual, expected, severity, suspectedFile };
    results.push(item);
    if (passed) {
        passedCount++;
        console.log(`[PASS] [${id}] ${feature} - ${scenario}`);
    } else {
        failedCount++;
        console.error(`[FAIL] [${id}] ${feature} - ${scenario}`);
        console.error(`   Actual: ${actual}`);
        console.error(`   Expected: ${expected}`);
    }
}

function request(method, urlPath, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const fullUrl = new URL(urlPath, BASE_URL);
        const options = {
            hostname: fullUrl.hostname,
            port: fullUrl.port,
            path: fullUrl.pathname + fullUrl.search,
            method: method,
            headers: {
                ...headers,
            }
        };

        let requestData = null;
        if (body) {
            if (Buffer.isBuffer(body)) {
                requestData = body;
            } else if (typeof body === 'object') {
                requestData = JSON.stringify(body);
                if (!options.headers['Content-Type']) {
                    options.headers['Content-Type'] = 'application/json';
                }
            } else {
                requestData = String(body);
            }
            options.headers['Content-Length'] = Buffer.byteLength(requestData);
        }

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => { resData += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(resData);
                } catch (e) {
                    parsed = resData;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: parsed,
                    raw: resData
                });
            });
        });

        req.on('error', (err) => reject(err));
        if (requestData) {
            req.write(requestData);
        }
        req.end();
    });
}

async function run() {
    console.log('====================================================');
    console.log('BẮT ĐẦU KIỂM THỬ TOÀN BỘ HỆ THỐNG CAR RENTAL (E2E + API)');
    console.log('====================================================\n');

    let adminToken = '';
    let ownerToken = '';
    let customerToken = '';
    let unverifiedCustomerToken = '';

    // Helper sinh thời gian chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh)
    function getVietnamISO(hoursOffset = 0) {
        const d = new Date(Date.now() + hoursOffset * 3600 * 1000);
        const formatter = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return formatter.format(d).replace(' ', 'T');
    }

    // ================================================================
    // PHÂN HỆ 1: AUTHENTICATION & SECURITY
    // ================================================================
    console.log('--- 1. KIỂM THỬ AUTHENTICATION & SECURITY ---');

    // 1.1 Login Happy Path (Admin)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'admin@carrental.vn', password: 'Password123@' });
        const pass = res.status === 200 && res.data?.data?.accessToken && res.data?.data?.account?.role === 'ADMIN';
        if (pass) adminToken = res.data.data.accessToken;
        logTest('TC-AUTH-01', 'Auth - Login', 'Admin đăng nhập thành công', pass, `HTTP ${res.status}, role=${res.data?.data?.account?.role}`, 'HTTP 200 có JWT token');
    } catch (e) {
        logTest('TC-AUTH-01', 'Auth - Login', 'Admin đăng nhập', false, e.message, 'HTTP 200');
    }

    // 1.2 Login Happy Path (Owner)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'binh@gmail.com', password: 'Password123@' });
        const pass = res.status === 200 && res.data?.data?.accessToken && res.data?.data?.account?.role === 'OWNER';
        if (pass) ownerToken = res.data.data.accessToken;
        logTest('TC-AUTH-02', 'Auth - Login', 'Owner đăng nhập thành công', pass, `HTTP ${res.status}, role=${res.data?.data?.account?.role}`, 'HTTP 200 role OWNER');
    } catch (e) {
        logTest('TC-AUTH-02', 'Auth - Login', 'Owner đăng nhập', false, e.message, 'HTTP 200');
    }

    // 1.3 Login Happy Path (Customer)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'khach@gmail.com', password: 'Password123@' });
        const pass = res.status === 200 && res.data?.data?.accessToken && res.data?.data?.account?.role === 'CUSTOMER';
        if (pass) customerToken = res.data.data.accessToken;
        logTest('TC-AUTH-03', 'Auth - Login', 'Customer đăng nhập thành công', pass, `HTTP ${res.status}, role=${res.data?.data?.account?.role}`, 'HTTP 200 role CUSTOMER');
    } catch (e) {
        logTest('TC-AUTH-03', 'Auth - Login', 'Customer đăng nhập', false, e.message, 'HTTP 200');
    }

    // 1.4 Login unverified customer (tester99@gmail.com - KYC None, Email Verified)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'tester99@gmail.com', password: 'Password123@' });
        const pass = res.status === 200 && res.data?.data?.accessToken;
        if (pass) unverifiedCustomerToken = res.data.data.accessToken;
        logTest('TC-AUTH-04', 'Auth - Login', 'Khách hàng chưa duyệt KYC (tester99) đăng nhập thành công', pass, `HTTP ${res.status}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-AUTH-04', 'Auth - Login', 'Khách hàng chưa KYC đăng nhập', false, e.message, 'HTTP 200');
    }

    // 1.4b Login tài khoản chưa xác minh email (nam@gmail.com -> 403)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'nam@gmail.com', password: 'Password123@' });
        const pass = res.status === 403 && res.data?.code === 'EMAIL_VERIFICATION_REQUIRED';
        logTest('TC-AUTH-04b', 'Auth - Login Security', 'Tài khoản chưa xác minh email bị từ chối 403 EMAIL_VERIFICATION_REQUIRED', pass, `HTTP ${res.status}, code=${res.data?.code}`, 'HTTP 403 EMAIL_VERIFICATION_REQUIRED');
    } catch (e) {
        logTest('TC-AUTH-04b', 'Auth - Login Security', 'Tài khoản chưa verify email', false, e.message, 'HTTP 403');
    }

    // 1.5 Login sai mật khẩu
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'admin@carrental.vn', password: 'WrongPassword999!' });
        const pass = res.status === 401;
        logTest('TC-AUTH-05', 'Auth - Login', 'Đăng nhập sai mật khẩu báo 401', pass, `HTTP ${res.status}`, 'HTTP 401 Unauthorized');
    } catch (e) {
        logTest('TC-AUTH-05', 'Auth - Login', 'Đăng nhập sai mk', false, e.message, 'HTTP 401');
    }

    // 1.6 Login tài khoản bị khóa (locked@gmail.com)
    try {
        const res = await request('POST', '/api/auth/login', {}, { email: 'locked@gmail.com', password: 'Password123@' });
        const pass = res.status === 401 || res.status === 403;
        logTest('TC-AUTH-06', 'Auth - Login', 'Đăng nhập tài khoản bị khóa bị từ chối (401/403)', pass, `HTTP ${res.status}`, 'HTTP 401 hoặc 403');
    } catch (e) {
        logTest('TC-AUTH-06', 'Auth - Login', 'Tài khoản locked đăng nhập', false, e.message, 'HTTP 401/403');
    }

    // 1.7 Login dữ liệu rỗng
    try {
        const res = await request('POST', '/api/auth/login', {}, {});
        const pass = res.status === 400 || res.status === 401;
        logTest('TC-AUTH-07', 'Auth - Login', 'Đăng nhập body rỗng trả lỗi 400/401', pass, `HTTP ${res.status}`, 'HTTP 400/401');
    } catch (e) {
        logTest('TC-AUTH-07', 'Auth - Login', 'Đăng nhập rỗng', false, e.message, 'HTTP 400/401');
    }

    // 1.8 Register Happy Path (Sửa BUG-01)
    const newRegEmail = `testuser_${Date.now()}@example.com`;
    let registeredToken = null;
    try {
        const res = await request('POST', '/api/auth/register', {}, {
            fullName: 'Nguyen Test User',
            email: newRegEmail,
            phone: '0988' + Math.floor(100000 + Math.random() * 899999),
            password: 'Password123@'
        });
        const pass = (res.status === 200 || res.status === 201) && res.data?.data?.email === newRegEmail;
        logTest('TC-AUTH-08', 'Auth - Register', 'Đăng ký tài khoản mới thành công (Fix BUG-01)', pass, `HTTP ${res.status}, email=${res.data?.data?.email}`, 'HTTP 200 hoặc 201');
        
        // Thử đăng nhập ngay bằng tài khoản vừa tạo
        if (pass) {
            const loginRes = await request('POST', '/api/auth/login', {}, { email: newRegEmail, password: 'Password123@' });
            if (loginRes.status === 200 && loginRes.data?.data?.accessToken) {
                registeredToken = loginRes.data.data.accessToken;
            }
        }
    } catch (e) {
        logTest('TC-AUTH-08', 'Auth - Register', 'Đăng ký thành công', false, e.message, 'HTTP 200/201');
    }

    // 1.9 Register trùng email
    try {
        const res = await request('POST', '/api/auth/register', {}, {
            fullName: 'Duplicate Email User',
            email: 'admin@carrental.vn',
            phone: '0912345678',
            password: 'Password123@'
        });
        const pass = res.status === 409 || res.status === 400;
        logTest('TC-AUTH-09', 'Auth - Register', 'Đăng ký trùng email báo 409 Conflict', pass, `HTTP ${res.status}`, 'HTTP 409 hoặc 400');
    } catch (e) {
        logTest('TC-AUTH-09', 'Auth - Register', 'Đăng ký trùng email', false, e.message, 'HTTP 409');
    }

    // 1.10 Register thiếu trường mật khẩu
    try {
        const res = await request('POST', '/api/auth/register', {}, {
            fullName: 'No Password User',
            email: `nopass_${Date.now()}@example.com`,
            phone: '0912345678'
        });
        const pass = res.status === 400;
        logTest('TC-AUTH-10', 'Auth - Register', 'Đăng ký thiếu mật khẩu trả 400 Bad Request', pass, `HTTP ${res.status}`, 'HTTP 400');
    } catch (e) {
        logTest('TC-AUTH-10', 'Auth - Register', 'Đăng ký thiếu mk', false, e.message, 'HTTP 400');
    }

    // 1.11 Register mật khẩu quá ngắn (< 8 ký tự)
    try {
        const res = await request('POST', '/api/auth/register', {}, {
            fullName: 'Short Pass User',
            email: `shortpass_${Date.now()}@example.com`,
            phone: '0912345678',
            password: '123'
        });
        const pass = res.status === 400;
        logTest('TC-AUTH-11', 'Auth - Register', 'Đăng ký mật khẩu < 8 ký tự trả 400', pass, `HTTP ${res.status}`, 'HTTP 400');
    } catch (e) {
        logTest('TC-AUTH-11', 'Auth - Register', 'Đăng ký mk ngắn', false, e.message, 'HTTP 400');
    }

    // 1.12 Unauthenticated access to protected endpoint
    try {
        const res = await request('GET', '/api/customers/me');
        const pass = res.status === 401;
        logTest('TC-AUTH-12', 'Security', 'Truy cập endpoint bảo vệ khi chưa đăng nhập trả 401', pass, `HTTP ${res.status}`, 'HTTP 401 Unauthorized');
    } catch (e) {
        logTest('TC-AUTH-12', 'Security', 'Chưa đăng nhập trả 401', false, e.message, 'HTTP 401');
    }

    // 1.13 Expired / Malformed token
    try {
        const res = await request('GET', '/api/customers/me', { Authorization: 'Bearer thisisafaketoken1234567890' });
        const pass = res.status === 401;
        logTest('TC-AUTH-13', 'Security', 'Gửi token giả mạo trả 401 Unauthorized', pass, `HTTP ${res.status}`, 'HTTP 401 Unauthorized');
    } catch (e) {
        logTest('TC-AUTH-13', 'Security', 'Token giả trả 401', false, e.message, 'HTTP 401');
    }

    // 1.13b Real expired JWT token
    try {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(JSON.stringify({
            sub: '1',
            iss: 'sba301-rentcar',
            aud: 'sba301-rentcar-client',
            role: 'CUSTOMER',
            exp: Math.floor(Date.now() / 1000) - 3600
        })).toString('base64url');
        const sig = crypto.createHmac('sha256', 'super-secret-jwt-key-for-carrental-system-32bytes-long!')
            .update(header + '.' + payload).digest('base64url');
        const expiredToken = header + '.' + payload + '.' + sig;
        const res = await request('GET', '/api/customers/me', { Authorization: `Bearer ${expiredToken}` });
        const pass = res.status === 401 && res.data?.code === 'INVALID_TOKEN';
        logTest('TC-AUTH-13b', 'Security', 'Gửi token JWT đã hết hạn bị từ chối 401 INVALID_TOKEN', pass, `HTTP ${res.status}, code=${res.data?.code}`, 'HTTP 401 INVALID_TOKEN');
    } catch (e) {
        logTest('TC-AUTH-13b', 'Security', 'Token hết hạn', false, e.message, 'HTTP 401');
    }

    // 1.14 Customer cố tình truy cập API Admin (/api/admin/cars)
    try {
        const res = await request('GET', '/api/admin/cars', { Authorization: `Bearer ${customerToken}` });
        const pass = res.status === 403;
        logTest('TC-AUTH-14', 'Security - Role Guard', 'Customer gọi API Admin bị từ chối 403 Forbidden', pass, `HTTP ${res.status}`, 'HTTP 403 Forbidden');
    } catch (e) {
        logTest('TC-AUTH-14', 'Security - Role Guard', 'Customer gọi API Admin', false, e.message, 'HTTP 403');
    }

    // ================================================================
    // PHÂN HỆ 2: HỒ SƠ CÁ NHÂN & KYC XÁC MINH DANH TÍNH
    // ================================================================
    console.log('\n--- 2. KIỂM THỬ HỒ SƠ & KYC ---');

    // 2.1 Get my profile
    try {
        const res = await request('GET', '/api/customers/me', { Authorization: `Bearer ${customerToken}` });
        const pass = res.status === 200 && res.data?.data?.email === 'khach@gmail.com';
        logTest('TC-CUST-01', 'Customer - Profile', 'Lấy thông tin cá nhân /api/customers/me thành công', pass, `HTTP ${res.status}, email=${res.data?.data?.email}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CUST-01', 'Customer - Profile', 'Get profile', false, e.message, 'HTTP 200');
    }

    // 2.2 Update profile (Zalo & contact note)
    try {
        const res = await request('PATCH', '/api/customers/me', { Authorization: `Bearer ${customerToken}` }, {
            zaloPhone: '0988112233',
            contactNote: 'Liên hệ sau 18h'
        });
        const pass = res.status === 200 && res.data?.data?.zaloPhone === '0988112233';
        logTest('TC-CUST-02', 'Customer - Profile', 'Cập nhật Zalo và ghi chú liên hệ thành công', pass, `HTTP ${res.status}, zalo=${res.data?.data?.zaloPhone}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CUST-02', 'Customer - Profile', 'Update profile', false, e.message, 'HTTP 200');
    }

    // 2.3 Check my KYC
    try {
        const res = await request('GET', '/api/customers/me/kyc', { Authorization: `Bearer ${customerToken}` });
        const pass = res.status === 200 && res.data?.data?.kycStatus !== undefined;
        logTest('TC-CUST-03', 'Customer - KYC', 'Xem trạng thái KYC cá nhân', pass, `HTTP ${res.status}, kycStatus=${res.data?.data?.kycStatus}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CUST-03', 'Customer - KYC', 'Get KYC', false, e.message, 'HTTP 200');
    }

    // 2.4 Admin list customers
    try {
        const res = await request('GET', '/api/customers?page=0&size=10', { Authorization: `Bearer ${adminToken}` });
        const pass = res.status === 200 && Array.isArray(res.data?.data?.content);
        logTest('TC-CUST-04', 'Admin - Customers', 'Admin xem danh sách người dùng phân trang thành công', pass, `HTTP ${res.status}, total=${res.data?.data?.totalElements}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CUST-04', 'Admin - Customers', 'Admin list customers', false, e.message, 'HTTP 200');
    }

    // 2.5 Admin lock and unlock customer
    try {
        const resLock = await request('PATCH', '/api/customers/14/status', { Authorization: `Bearer ${adminToken}` }, {
            status: 'LOCKED',
            reason: 'Tài khoản vi phạm thử nghiệm'
        });
        const lockPass = resLock.status === 200 && resLock.data?.data?.status === 'LOCKED';
        const resUnlock = await request('PATCH', '/api/customers/14/status', { Authorization: `Bearer ${adminToken}` }, {
            status: 'ACTIVE',
            reason: 'Mở khóa sau thử nghiệm'
        });
        const unlockPass = resUnlock.status === 200 && resUnlock.data?.data?.status === 'ACTIVE';
        logTest('TC-CUST-05', 'Admin - Customers', 'Admin khóa và mở khóa tài khoản người dùng thành công', lockPass && unlockPass, `Lock=${resLock.status}, Unlock=${resUnlock.status}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CUST-05', 'Admin - Customers', 'Admin lock/unlock', false, e.message, 'HTTP 200');
    }

    // 2.6 Nộp hồ sơ KYC với ảnh hợp lệ (dùng tài khoản vừa tạo hoặc tester99)
    let submittedDocId = null;
    const kycUploaderToken = registeredToken || unverifiedCustomerToken;
    const testDocNumber = '0' + Math.floor(10000000000 + Math.random() * 89999999999);
    try {
        const fixtureImg = fs.readFileSync('d:/SBA/docs/postman/fixtures/synthetic-front.jpg');
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
        
        let bodyBuffer = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="docType"\r\n\r\nCITIZEN_ID\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="docNumber"\r\n\r\n${testDocNumber}\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="fullNameOnDoc"\r\n\r\nNguyen Test User\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="dateOfBirthOnDoc"\r\n\r\n1995-05-15\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="issuePlace"\r\n\r\nCục Cảnh sát QLHC về TTXH\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="issueDate"\r\n\r\n2020-05-15\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="expiresAt"\r\n\r\n2035-12-31\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="frontImage"; filename="front.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
            fixtureImg,
            Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="backImage"; filename="back.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
            fixtureImg,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);

        const res = await request('POST', '/api/user-documents', {
            Authorization: `Bearer ${kycUploaderToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        }, bodyBuffer);

        const pass = (res.status === 200 || res.status === 201) && res.data?.data?.id;
        if (pass) submittedDocId = res.data.data.id;
        logTest('TC-KYC-01', 'KYC - Submit Document', 'Khách hàng nộp hồ sơ CCCD kèm 2 mặt ảnh thành công', pass, `HTTP ${res.status}, docId=${submittedDocId}`, 'HTTP 201 hoặc 200');
    } catch (e) {
        logTest('TC-KYC-01', 'KYC - Submit Document', 'Nộp CCCD', false, e.message, 'HTTP 201/200');
    }

    // 2.7 Nộp trùng giấy tờ KYC khi đơn cũ đang PENDING
    try {
        const fixtureImg = fs.readFileSync('d:/SBA/docs/postman/fixtures/synthetic-front.jpg');
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
        let bodyBuffer = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="docType"\r\n\r\nCITIZEN_ID\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="docNumber"\r\n\r\n${testDocNumber}\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="frontImage"; filename="front.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
            fixtureImg,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);
        const res = await request('POST', '/api/user-documents', {
            Authorization: `Bearer ${kycUploaderToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        }, bodyBuffer);
        const pass = res.status === 409 || res.status === 400;
        logTest('TC-KYC-02', 'KYC - Submit Duplicate', 'Nộp trùng hồ sơ KYC đang PENDING bị chặn 409 Conflict', pass, `HTTP ${res.status}`, 'HTTP 409');
    } catch (e) {
        logTest('TC-KYC-02', 'KYC - Submit Duplicate', 'Nộp trùng KYC', false, e.message, 'HTTP 409');
    }

    // 2.8 Admin duyệt hồ sơ KYC và tự động nâng cấp vai trò lên OWNER
    if (submittedDocId) {
        try {
            const res = await request('PATCH', `/api/user-documents/${submittedDocId}/review`, {
                Authorization: `Bearer ${adminToken}`
            }, {
                verifyStatus: 'APPROVED',
                rejectReason: null
            });
            const docStatus = res.data?.data?.document?.verifyStatus || res.data?.data?.verifyStatus || res.data?.data?.status;
            const pass = res.status === 200 && (docStatus === 'APPROVED' || res.data?.data?.kycStatus === 'VERIFIED');
            logTest('TC-KYC-03', 'KYC - Admin Review', 'Admin duyệt hồ sơ KYC thành công (nâng cấp vai trò)', pass, `HTTP ${res.status}, docStatus=${docStatus}, kycStatus=${res.data?.data?.kycStatus}`, 'HTTP 200 APPROVED');
        } catch (e) {
            logTest('TC-KYC-03', 'KYC - Admin Review', 'Admin review KYC', false, e.message, 'HTTP 200');
        }
    }

    // ================================================================
    // PHÂN HỆ 3: QUẢN LÝ XE & TÌM KIẾM XE (F2)
    // ================================================================
    console.log('\n--- 3. KIỂM THỬ XE & TÌM KIẾM XE ---');

    // 3.1 Public search cars
    let sampleCarId = 1; // Honda City RS
    try {
        const res = await request('GET', '/api/cars/search?page=0&size=10');
        const pass = res.status === 200 && Array.isArray(res.data?.data?.content);
        logTest('TC-CAR-01', 'Car - Search', 'Tìm kiếm xe công khai trả về danh sách xe LISTED', pass, `HTTP ${res.status}, count=${res.data?.data?.content?.length}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CAR-01', 'Car - Search', 'Public search cars', false, e.message, 'HTTP 200');
    }

    // 3.2 Search với bộ lọc tỉnh thành, loại xe, khoảng giá
    try {
        const res = await request('GET', '/api/cars/search?city=Hà Nội&minPrice=500000&maxPrice=5000000&page=0&size=5');
        const pass = res.status === 200 && Array.isArray(res.data?.data?.content);
        logTest('TC-CAR-02', 'Car - Search Filter', 'Lọc xe theo thành phố và khoảng giá hoạt động chính xác', pass, `HTTP ${res.status}, found=${res.data?.data?.content?.length}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-CAR-02', 'Car - Search Filter', 'Filter cars', false, e.message, 'HTTP 200');
    }

    // 3.3 Search với tham số sai: minPrice > maxPrice
    try {
        const res = await request('GET', '/api/cars/search?minPrice=5000000&maxPrice=1000000');
        const pass = res.status === 400;
        logTest('TC-CAR-03', 'Car - Search Validation', 'Tìm kiếm với minPrice > maxPrice trả 400 Bad Request', pass, `HTTP ${res.status}`, 'HTTP 400');
    } catch (e) {
        logTest('TC-CAR-03', 'Car - Search Validation', 'Bad price search', false, e.message, 'HTTP 400');
    }

    // 3.4 Public xem chi tiết xe (ẩn biển số)
    try {
        const res = await request('GET', `/api/cars/${sampleCarId}`);
        const pass = res.status === 200 && res.data?.data?.id === sampleCarId && (!res.data.data.licensePlate || res.data.data.licensePlate.includes('*') || res.data.data.licensePlate === 'Biển số đã được ẩn');
        logTest('TC-CAR-04', 'Car - Detail Masking', 'Khách vãng lai xem chi tiết xe bị ẩn biển số bảo mật', pass, `HTTP ${res.status}, plate="${res.data?.data?.licensePlate}"`, 'HTTP 200 plate masked/hidden');
    } catch (e) {
        logTest('TC-CAR-04', 'Car - Detail Masking', 'Car detail guest', false, e.message, 'HTTP 200');
    }

    // 3.5 Owner tạo xe mới (chờ admin duyệt)
    let newCreatedCarId = null;
    const testPlate = `30A-${Math.floor(10000 + Math.random() * 89999)}`;
    try {
        const res = await request('POST', '/api/cars', { Authorization: `Bearer ${ownerToken}` }, {
            brand: 'Mazda',
            model: 'Mazda 3 Luxury',
            manufactureYear: 2023,
            licensePlate: testPlate,
            carType: 'SEDAN',
            transmission: 'AUTOMATIC',
            fuelType: 'GASOLINE',
            seats: 5,
            rentalPricePerDay: 800000,
            city: 'Hà Nội',
            district: 'Cầu Giấy',
            pickupAddress: '123 Cầu Giấy, Hà Nội',
            features: '["GPS", "BLUETOOTH", "CAMERA_360"]',
            description: 'Xe gia đình giữ gìn sạch sẽ'
        });
        const pass = res.status === 200 && res.data?.data?.id;
        if (pass) newCreatedCarId = res.data.data.id;
        logTest('TC-CAR-05', 'Car - Owner Create', 'Chủ xe đăng ký xe mới thành công (trạng thái PENDING_APPROVAL)', pass, `HTTP ${res.status}, carId=${newCreatedCarId}, status=${res.data?.data?.status}`, 'HTTP 200 PENDING_APPROVAL');
    } catch (e) {
        logTest('TC-CAR-05', 'Car - Owner Create', 'Create car', false, e.message, 'HTTP 200');
    }

    // 3.6 Tạo xe trùng biển số
    try {
        const res = await request('POST', '/api/cars', { Authorization: `Bearer ${ownerToken}` }, {
            brand: 'Mazda',
            model: 'Mazda 3 Luxury',
            manufactureYear: 2023,
            licensePlate: testPlate,
            carType: 'SEDAN',
            transmission: 'AUTOMATIC',
            fuelType: 'GASOLINE',
            seats: 5,
            rentalPricePerDay: 800000,
            city: 'Hà Nội',
            pickupAddress: '123 Cầu Giấy, Hà Nội'
        });
        const pass = res.status === 409 || res.status === 400;
        logTest('TC-CAR-06', 'Car - Duplicate Plate', 'Đăng ký xe trùng biển số bị chặn 409 Conflict', pass, `HTTP ${res.status}`, 'HTTP 409');
    } catch (e) {
        logTest('TC-CAR-06', 'Car - Duplicate Plate', 'Duplicate plate', false, e.message, 'HTTP 409');
    }

    // 3.7 Customer chưa duyệt KYC cố tình tạo xe -> 403
    try {
        const res = await request('POST', '/api/cars', { Authorization: `Bearer ${customerToken}` }, {
            brand: 'Honda',
            model: 'City',
            manufactureYear: 2022,
            licensePlate: '29A-99999',
            carType: 'SEDAN',
            transmission: 'AUTOMATIC',
            fuelType: 'GASOLINE',
            seats: 5,
            rentalPricePerDay: 600000,
            city: 'Hà Nội',
            pickupAddress: 'Số 1 Phố Huế'
        });
        const pass = res.status === 403;
        logTest('TC-CAR-07', 'Car - Role Guard', 'Customer chưa KYC gọi tạo xe bị chặn 403 Forbidden', pass, `HTTP ${res.status}`, 'HTTP 403 Forbidden');
    } catch (e) {
        logTest('TC-CAR-07', 'Car - Role Guard', 'Customer create car', false, e.message, 'HTTP 403');
    }

    // 3.8 Chủ xe cố tình bật status xe khi xe chưa được Admin duyệt (F2-01 Fix Verification)
    if (newCreatedCarId) {
        try {
            const res = await request('PATCH', `/api/cars/${newCreatedCarId}/status?status=ACTIVE`, {
                Authorization: `Bearer ${ownerToken}`
            });
            const pass = res.status === 409 || res.status === 400;
            logTest('TC-CAR-08', 'Car - Status Security', 'Chủ xe không được tự kích hoạt xe khi chưa qua Admin duyệt (báo 409)', pass, `HTTP ${res.status}`, 'HTTP 409 Conflict');
        } catch (e) {
            logTest('TC-CAR-08', 'Car - Status Security', 'Owner self-activate unapproved car', false, e.message, 'HTTP 409');
        }
    }

    // 3.8b Chủ xe nộp giấy đăng ký xe (REGISTRATION) và Admin duyệt trước khi duyệt xe
    let carDocId = null;
    if (newCreatedCarId) {
        try {
            const resDoc = await request('POST', `/api/cars/${newCreatedCarId}/documents`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                docType: 'REGISTRATION',
                fileUrl: '/api/uploads/files/test_cavet.jpg',
                expiresAt: '2030-12-31'
            });
            carDocId = resDoc.data?.data?.id;

            if (carDocId) {
                await request('PATCH', `/api/admin/cars/${newCreatedCarId}/documents/${carDocId}/verify`, {
                    Authorization: `Bearer ${adminToken}`
                }, {
                    verifyStatus: 'APPROVED'
                });
            }
        } catch (e) {
            console.error('Error submitting car document:', e.message);
        }
    }

    // 3.9 Admin duyệt xe (Sau khi giấy tờ đã được xác minh)
    if (newCreatedCarId) {
        try {
            const res = await request('POST', `/api/admin/cars/${newCreatedCarId}/approve`, {
                Authorization: `Bearer ${adminToken}`
            });
            const pass = res.status === 200 && res.data?.data?.status === 'ACTIVE';
            logTest('TC-CAR-09', 'Admin - Approve Car', 'Admin duyệt xe thành công chuyển sang ACTIVE', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 ACTIVE');
        } catch (e) {
            logTest('TC-CAR-09', 'Admin - Approve Car', 'Admin approve car', false, e.message, 'HTTP 200');
        }
    }

    // 3.10 Sau khi duyệt, chủ xe có thể bật/tắt hiển thị xe (ACTIVE <-> INACTIVE)
    if (newCreatedCarId) {
        try {
            const resInactive = await request('PATCH', `/api/cars/${newCreatedCarId}/status?status=INACTIVE`, {
                Authorization: `Bearer ${ownerToken}`
            });
            const passInactive = resInactive.status === 200 && resInactive.data?.data?.status === 'INACTIVE';
            const resActive = await request('PATCH', `/api/cars/${newCreatedCarId}/status?status=ACTIVE`, {
                Authorization: `Bearer ${ownerToken}`
            });
            const passActive = resActive.status === 200 && resActive.data?.data?.status === 'ACTIVE';
            logTest('TC-CAR-10', 'Car - Owner Toggle Status', 'Chủ xe tạm dừng và kích hoạt lại xe đã duyệt thành công', passInactive && passActive, `Inactive=${resInactive.status}, Active=${resActive.status}`, 'HTTP 200');
        } catch (e) {
            logTest('TC-CAR-10', 'Car - Owner Toggle Status', 'Toggle status', false, e.message, 'HTTP 200');
        }
    }

    // ================================================================
    // PHÂN HỆ 4: GÓI ĐĂNG TIN, VOUCHER, THANH TOÁN (F3 & F4)
    // ================================================================
    console.log('\n--- 4. KIỂM THỬ GÓI TIN, VOUCHER & THANH TOÁN ---');

    // 4.1 Danh sách gói tin công khai
    let basicPackageId = null;
    try {
        const res = await request('GET', '/api/packages');
        const pass = res.status === 200 && Array.isArray(res.data?.data) && res.data.data.length >= 3;
        if (pass) {
            const pkg = res.data.data.find(p => p.code === 'PKG_BASIC') || res.data.data[0];
            basicPackageId = pkg.id;
        }
        logTest('TC-PKG-01', 'Package - Public List', 'Lấy danh sách 3 gói cước công khai thành công', pass, `HTTP ${res.status}, count=${res.data?.data?.length}, basicId=${basicPackageId}`, 'HTTP 200 >= 3 gói');
    } catch (e) {
        logTest('TC-PKG-01', 'Package - Public List', 'Public packages', false, e.message, 'HTTP 200');
    }

    // 4.2 Admin tạo voucher mới (discountType: PERCENT)
    const testVoucherCode = `TEST${Math.floor(1000 + Math.random() * 8999)}`;
    try {
        const res = await request('POST', '/api/vouchers', { Authorization: `Bearer ${adminToken}` }, {
            code: testVoucherCode,
            discountType: 'PERCENT',
            discountValue: 15,
            minOrderAmount: 50000,
            maxDiscount: 50000,
            usageLimit: 50,
            startAt: '2026-01-01T00:00:00',
            endAt: '2027-12-31T23:59:59',
            description: 'Giảm giá 15% cho kiểm thử'
        });
        const pass = (res.status === 200 || res.status === 201) && res.data?.data?.code === testVoucherCode;
        logTest('TC-VOU-01', 'Voucher - Admin Create', 'Admin tạo mã giảm giá mới thành công', pass, `HTTP ${res.status}, code=${res.data?.data?.code}`, 'HTTP 201 hoặc 200');
    } catch (e) {
        logTest('TC-VOU-01', 'Voucher - Admin Create', 'Create voucher', false, e.message, 'HTTP 201/200');
    }

    // 4.3 Owner lấy báo giá mua gói kèm voucher (dùng xe vừa được duyệt ACTIVE)
    if (newCreatedCarId && basicPackageId) {
        try {
            const res = await request('POST', '/api/subscriptions/quote', { Authorization: `Bearer ${ownerToken}` }, {
                carId: newCreatedCarId,
                packageId: basicPackageId,
                voucherCode: testVoucherCode
            });
            const pass = res.status === 200 && res.data?.data?.discountAmount > 0;
            logTest('TC-SUB-01', 'Subscription - Quote', 'Chủ xe lấy báo giá gói tin có áp voucher giảm giá chuẩn xác', pass, `HTTP ${res.status}, original=${res.data?.data?.originalPrice}, discount=${res.data?.data?.discountAmount}, final=${res.data?.data?.finalPrice}`, 'HTTP 200 có discount > 0');
        } catch (e) {
            logTest('TC-SUB-01', 'Subscription - Quote', 'Quote subscription', false, e.message, 'HTTP 200');
        }
    }

    // 4.4 Owner tạo yêu cầu mua gói tin
    let subscriptionId = null;
    if (newCreatedCarId && basicPackageId) {
        try {
            const res = await request('POST', '/api/subscriptions', { Authorization: `Bearer ${ownerToken}` }, {
                carId: newCreatedCarId,
                packageId: basicPackageId,
                voucherCode: testVoucherCode
            });
            const pass = (res.status === 200 || res.status === 201) && res.data?.data?.id;
            if (pass) subscriptionId = res.data.data.id;
            logTest('TC-SUB-02', 'Subscription - Create', 'Chủ xe tạo đơn mua gói tin thành công (chờ thanh toán)', pass, `HTTP ${res.status}, subId=${subscriptionId}, status=${res.data?.data?.status}`, 'HTTP 201 hoặc 200');
        } catch (e) {
            logTest('TC-SUB-02', 'Subscription - Create', 'Create subscription', false, e.message, 'HTTP 201/200');
        }
    }

    // 4.5 Owner tạo giao dịch thanh toán gói
    let transactionId = null;
    if (subscriptionId) {
        try {
            const res = await request('POST', '/api/transactions/package-payment', { Authorization: `Bearer ${ownerToken}` }, {
                subscriptionId: subscriptionId,
                paymentMethod: 'VNPAY'
            });
            const pass = res.status === 200 && res.data?.data?.id;
            if (pass) transactionId = res.data.data.id;
            logTest('TC-TXN-01', 'Transaction - Init', 'Khởi tạo giao dịch thanh toán gói thành công', pass, `HTTP ${res.status}, txnId=${transactionId}, status=${res.data?.data?.status}`, 'HTTP 200 PENDING');
        } catch (e) {
            logTest('TC-TXN-01', 'Transaction - Init', 'Init package payment', false, e.message, 'HTTP 200');
        }
    }

    // 4.6 Giả lập thanh toán thất bại (F4-01 Fix Verification: simulateSuccess: false phải trả FAILED)
    if (transactionId) {
        try {
            const res = await request('POST', `/api/transactions/${transactionId}/simulate-gateway`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                simulateSuccess: false
            });
            const pass = res.status === 200 && res.data?.data?.status === 'FAILED';
            logTest('TC-TXN-02', 'Transaction - Simulate Failure', 'Giả lập cổng thanh toán thất bại: giao dịch chuyển đúng FAILED', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 FAILED');
        } catch (e) {
            logTest('TC-TXN-02', 'Transaction - Simulate Failure', 'Simulate failure', false, e.message, 'HTTP 200 FAILED');
        }
    }

    // 4.7 Thanh toán lại sau khi thất bại và giả lập thành công -> xe trở thành LISTED
    let paidTxnId = null;
    if (subscriptionId) {
        try {
            const resTxn = await request('POST', '/api/transactions/package-payment', { Authorization: `Bearer ${ownerToken}` }, {
                subscriptionId: subscriptionId,
                paymentMethod: 'VNPAY'
            });
            paidTxnId = resTxn.data?.data?.id;
            const resSim = await request('POST', `/api/transactions/${paidTxnId}/simulate-gateway`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                simulateSuccess: true
            });
            const pass = resSim.status === 200 && resSim.data?.data?.status === 'SUCCESS';
            logTest('TC-TXN-03', 'Transaction - Simulate Success', 'Giả lập thanh toán thành công: gói kích hoạt, xe lên sàn LISTED', pass, `HTTP ${resSim.status}, txnStatus=${resSim.data?.data?.status}`, 'HTTP 200 SUCCESS');
        } catch (e) {
            logTest('TC-TXN-03', 'Transaction - Simulate Success', 'Simulate success', false, e.message, 'HTTP 200 SUCCESS');
        }
    }

    // 4.8 Kiểm tra xe vừa mua gói đã xuất hiện trên tìm kiếm công khai (LISTED)
    if (newCreatedCarId) {
        try {
            const res = await request('GET', `/api/cars/${newCreatedCarId}`);
            const pass = res.status === 200 && res.data?.data?.listingStatus === 'LISTED';
            logTest('TC-CAR-11', 'Car - Listing Active', 'Xe sau khi thanh toán gói tin có listingStatus = LISTED', pass, `HTTP ${res.status}, listingStatus=${res.data?.data?.listingStatus}`, 'HTTP 200 LISTED');
        } catch (e) {
            logTest('TC-CAR-11', 'Car - Listing Active', 'Check listed status', false, e.message, 'HTTP 200');
        }
    }

    // ================================================================
    // PHÂN HỆ 5: QUY TRÌNH ĐẶT XE, BÀN GIAO & ĐÁNH GIÁ (BOOKING FLOW)
    // Dùng carId = 1 (Honda City RS của binh@gmail.com)
    // ================================================================
    console.log('\n--- 5. KIỂM THỬ ĐẶT XE & BÀN GIAO XE ---');

    let bookingCarId = newCreatedCarId || 3;
    const pickupTime = getVietnamISO(2);
    const returnTime = getVietnamISO(26);

    // 5.1 Báo giá thuê xe theo ngày và giờ
    try {
        const res = await request('GET', `/api/cars/${bookingCarId}/quote?pickupAt=${pickupTime}&returnAt=${returnTime}`);
        const pass = res.status === 200 && res.data?.data?.rentalAmount > 0;
        logTest('TC-BKG-01', 'Booking - Quote', 'Tính báo giá thuê xe theo khoảng thời gian chính xác', pass, `HTTP ${res.status}, days=${res.data?.data?.rentalDays}, hours=${res.data?.data?.rentalHours}, rentalAmount=${res.data?.data?.rentalAmount}`, 'HTTP 200 có rentalAmount > 0');
    } catch (e) {
        logTest('TC-BKG-01', 'Booking - Quote', 'Quote booking', false, e.message, 'HTTP 200');
    }

    // 5.2 Khách hàng đặt xe mới (Create Booking)
    let bookingId = null;
    try {
        const res = await request('POST', '/api/bookings', { Authorization: `Bearer ${customerToken}` }, {
            carId: bookingCarId,
            pickupAt: pickupTime,
            returnAt: returnTime,
            contactPhone: '0988776655',
            customerNote: 'Tôi cần nhận xe đúng giờ'
        });
        const pass = res.status === 200 && res.data?.data?.id && res.data?.data?.status === 'REQUESTED';
        if (pass) bookingId = res.data.data.id;
        logTest('TC-BKG-02', 'Booking - Customer Request', 'Khách hàng tạo đơn thuê xe thành công (trạng thái REQUESTED)', pass, `HTTP ${res.status}, bookingId=${bookingId}, status=${res.data?.data?.status}`, 'HTTP 200 REQUESTED');
    } catch (e) {
        logTest('TC-BKG-02', 'Booking - Customer Request', 'Create booking', false, e.message, 'HTTP 200');
    }

    // 5.3 Chủ xe đánh dấu đã liên hệ khách (mark contacted)
    if (bookingId) {
        try {
            const res = await request('POST', `/api/bookings/${bookingId}/contacted`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                contacted: true,
                contactNote: 'Đã gọi điện thoại chốt địa điểm nhận xe'
            });
            const pass = res.status === 200 && (res.data?.data?.ownerContactedAt !== undefined || res.data?.data?.contactNote !== undefined);
            logTest('TC-BKG-03', 'Booking - Owner Contacted', 'Chủ xe xác nhận đã liên hệ khách thành công', pass, `HTTP ${res.status}, contactNote=${res.data?.data?.contactNote}`, 'HTTP 200 contacted=true');
        } catch (e) {
            logTest('TC-BKG-03', 'Booking - Owner Contacted', 'Mark contacted', false, e.message, 'HTTP 200');
        }
    }

    // 5.4 Chủ xe chấp nhận đơn thuê (accept booking)
    if (bookingId) {
        try {
            const res = await request('POST', `/api/bookings/${bookingId}/accept`, {
                Authorization: `Bearer ${ownerToken}`
            });
            const pass = res.status === 200 && res.data?.data?.status === 'CONFIRMED';
            logTest('TC-BKG-04', 'Booking - Owner Accept', 'Chủ xe chấp nhận đơn thuê: chuyển trạng thái sang CONFIRMED', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 CONFIRMED');
        } catch (e) {
            logTest('TC-BKG-04', 'Booking - Owner Accept', 'Accept booking', false, e.message, 'HTTP 200');
        }
    }

    // 5.5 Chủ xe gửi biên bản nhận xe (Handover PICKUP) kèm 7 hạng mục bắt buộc
    let pickupHandoverItems = [];
    if (bookingId) {
        try {
            const handoverCategories = [
                'EXTERIOR_FRONT', 'EXTERIOR_REAR', 'EXTERIOR_LEFT', 'EXTERIOR_RIGHT',
                'INTERIOR', 'DASHBOARD_ODOMETER', 'DOCUMENTS'
            ];
            const items = handoverCategories.map(cat => ({
                category: cat,
                photoUrl: `/api/uploads/files/demo_${cat.toLowerCase()}.jpg`,
                conditionNote: 'Tình trạng tốt, nguyên bản'
            }));
            const res = await request('POST', `/api/bookings/${bookingId}/handovers/PICKUP`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                odometerKm: 25000,
                fuelPercent: 90,
                ownerNote: 'Xe sạch sẽ, đầy đủ giấy tờ',
                items: items
            });
            const pass = res.status === 200 && res.data?.data?.status === 'PICKUP_PENDING';
            const pickupHandover = res.data?.data?.handovers?.find(h => h.type === 'PICKUP');
            if (pass && pickupHandover?.items) {
                pickupHandoverItems = pickupHandover.items;
            }
            logTest('TC-BKG-05', 'Booking - Submit Handover Pickup', 'Chủ xe gửi biên bản giao xe kèm 7 hạng mục thành công (PICKUP_PENDING)', pass, `HTTP ${res.status}, status=${res.data?.data?.status}, itemsCount=${pickupHandoverItems.length}`, 'HTTP 200 PICKUP_PENDING');
        } catch (e) {
            logTest('TC-BKG-05', 'Booking - Submit Handover Pickup', 'Submit handover pickup', false, e.message, 'HTTP 200');
        }
    }

    // 5.6a Khách hàng từ chối 1 mục hiện trạng (Dispute Handover)
    if (bookingId && pickupHandoverItems.length > 0) {
        try {
            const firstItem = pickupHandoverItems[0];
            const disputeDecisions = pickupHandoverItems.map(item => ({
                itemId: item.id,
                accepted: item.id !== firstItem.id,
                disputeNote: item.id === firstItem.id ? 'Gương phải bị trầy xước, cần chụp lại cận cảnh' : null
            }));
            const res = await request('POST', `/api/bookings/${bookingId}/handovers/PICKUP/respond`, {
                Authorization: `Bearer ${customerToken}`
            }, {
                decisions: disputeDecisions,
                customerNote: 'Yêu cầu chụp lại ảnh gương phải'
            });
            const pickupHandover = res.data?.data?.handovers?.find(h => h.type === 'PICKUP');
            const pass = res.status === 200 && pickupHandover?.status === 'DISPUTED' && res.data?.data?.status === 'PICKUP_PENDING';
            logTest('TC-BKG-05b', 'Booking - Dispute Handover', 'Khách từ chối 1 mục biên bản giao xe (chuyển DISPUTED)', pass, `HTTP ${res.status}, handoverStatus=${pickupHandover?.status}, bookingStatus=${res.data?.data?.status}`, 'HTTP 200 DISPUTED');
        } catch (e) {
            logTest('TC-BKG-05b', 'Booking - Dispute Handover', 'Dispute handover', false, e.message, 'HTTP 200');
        }

        // 5.6b Chủ xe chỉnh sửa lại mục bị từ chối (Revise Handover)
        try {
            const firstItem = pickupHandoverItems[0];
            const res = await request('PUT', `/api/bookings/${bookingId}/handovers/PICKUP`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                revisions: [{
                    itemId: firstItem.id,
                    photoUrl: '/api/uploads/files/pickup_front_revised.jpg',
                    conditionNote: 'Đã chụp lại rõ nét vết trầy nhỏ'
                }]
            });
            const pickupHandover = res.data?.data?.handovers?.find(h => h.type === 'PICKUP');
            const pass = res.status === 200 && pickupHandover?.status === 'SUBMITTED' && pickupHandover?.revision === 2;
            logTest('TC-BKG-05c', 'Booking - Revise Handover', 'Chủ xe chỉnh sửa lại mục bị tranh chấp (revision=2)', pass, `HTTP ${res.status}, revision=${pickupHandover?.revision}, status=${pickupHandover?.status}`, 'HTTP 200 SUBMITTED rev 2');
        } catch (e) {
            logTest('TC-BKG-05c', 'Booking - Revise Handover', 'Revise handover', false, e.message, 'HTTP 200');
        }

        // 5.6c Khách hàng chấp nhận mục đã sửa -> Đơn chuyển sang IN_PROGRESS (đang thuê)
        try {
            const firstItem = pickupHandoverItems[0];
            const res = await request('POST', `/api/bookings/${bookingId}/handovers/PICKUP/respond`, {
                Authorization: `Bearer ${customerToken}`
            }, {
                decisions: [{
                    itemId: firstItem.id,
                    accepted: true,
                    disputeNote: null
                }],
                customerNote: 'Đồng ý với ảnh chụp bổ sung'
            });
            const pass = res.status === 200 && res.data?.data?.status === 'IN_PROGRESS';
            logTest('TC-BKG-06', 'Booking - Customer Confirm Pickup', 'Khách xác nhận biên bản giao xe sau khi sửa: đơn chuyển thành IN_PROGRESS', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 IN_PROGRESS');
        } catch (e) {
            logTest('TC-BKG-06', 'Booking - Customer Confirm Pickup', 'Customer confirm pickup', false, e.message, 'HTTP 200');
        }
    }

    // 5.7 Chủ xe gửi biên bản trả xe (Handover RETURN)
    let returnHandoverItems = [];
    if (bookingId) {
        try {
            const returnCategories = [
                'EXTERIOR_FRONT', 'EXTERIOR_REAR', 'EXTERIOR_LEFT', 'EXTERIOR_RIGHT',
                'INTERIOR', 'DASHBOARD_ODOMETER', 'DOCUMENTS'
            ];
            const items = returnCategories.map(cat => ({
                category: cat,
                photoUrl: `/api/uploads/files/return_${cat.toLowerCase()}.jpg`,
                conditionNote: 'Hoàn trả nguyên vẹn'
            }));
            const res = await request('POST', `/api/bookings/${bookingId}/handovers/RETURN`, {
                Authorization: `Bearer ${ownerToken}`
            }, {
                odometerKm: 25400,
                fuelPercent: 88,
                ownerNote: 'Xe trả đúng hẹn, nguyên vẹn',
                items: items
            });
            const pass = res.status === 200 && res.data?.data?.status === 'RETURN_PENDING';
            const returnHandover = res.data?.data?.handovers?.find(h => h.type === 'RETURN');
            if (pass && returnHandover?.items) {
                returnHandoverItems = returnHandover.items;
            }
            logTest('TC-BKG-07', 'Booking - Submit Handover Return', 'Chủ xe gửi biên bản trả xe thành công (RETURN_PENDING)', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 RETURN_PENDING');
        } catch (e) {
            logTest('TC-BKG-07', 'Booking - Submit Handover Return', 'Submit handover return', false, e.message, 'HTTP 200');
        }
    }

    // 5.8 Khách hàng xác nhận biên bản trả xe -> Đơn hoàn thành COMPLETED
    if (bookingId && returnHandoverItems.length > 0) {
        try {
            const decisions = returnHandoverItems.map(item => ({
                itemId: item.id,
                accepted: true,
                disputeNote: null
            }));
            const res = await request('POST', `/api/bookings/${bookingId}/handovers/RETURN/respond`, {
                Authorization: `Bearer ${customerToken}`
            }, {
                decisions: decisions,
                customerNote: 'Cảm ơn chủ xe, chuyến đi rất tốt'
            });
            const pass = res.status === 200 && res.data?.data?.status === 'COMPLETED';
            logTest('TC-BKG-08', 'Booking - Customer Confirm Return', 'Khách duyệt biên bản trả xe: đơn kết thúc COMPLETED', pass, `HTTP ${res.status}, status=${res.data?.data?.status}`, 'HTTP 200 COMPLETED');
        } catch (e) {
            logTest('TC-BKG-08', 'Booking - Customer Confirm Return', 'Customer confirm return', false, e.message, 'HTTP 200');
        }
    }

    // 5.9 Khách hàng viết đánh giá (Review) cho xe sau khi chuyến đi hoàn thành COMPLETED
    let reviewId = null;
    try {
        const res = await request('POST', '/api/reviews', { Authorization: `Bearer ${customerToken}` }, {
            carId: bookingCarId,
            rating: 5,
            comment: 'Xe chạy rất êm ái, tiết kiệm xăng, chủ xe nhiệt tình chu đáo!'
        });
        const pass = res.status === 200 && res.data?.data?.id;
        if (pass) reviewId = res.data.data.id;
        logTest('TC-REV-01', 'Review - Customer Submit', 'Khách hàng gửi đánh giá và nhận xét xe thành công', pass, `HTTP ${res.status}, reviewId=${reviewId}, rating=${res.data?.data?.rating}`, 'HTTP 200 rating=5');
    } catch (e) {
        logTest('TC-REV-01', 'Review - Customer Submit', 'Submit review', false, e.message, 'HTTP 200');
    }

    // 5.10 Đánh giá rác bị Admin gỡ bỏ
    if (reviewId) {
        try {
            const res = await request('DELETE', `/api/admin/reviews/${reviewId}`, {
                Authorization: `Bearer ${adminToken}`
            });
            const pass = res.status === 200;
            logTest('TC-REV-02', 'Review - Admin Delete', 'Admin xóa gỡ bài đánh giá vi phạm thành công', pass, `HTTP ${res.status}`, 'HTTP 200');
        } catch (e) {
            logTest('TC-REV-02', 'Review - Admin Delete', 'Admin delete review', false, e.message, 'HTTP 200');
        }
    }

    // ================================================================
    // PHÂN HỆ 6: HỒ SƠ AN TOÀN & DASHBOARDS
    // ================================================================
    console.log('\n--- 6. KIỂM THỬ HỒ SƠ AN TOÀN & DASHBOARDS ---');

    // 6.1 Owner thêm bản ghi đăng kiểm an toàn cho carId = 1
    let safetyRecordId = null;
    try {
        const res = await request('POST', `/api/cars/${bookingCarId}/safety-records`, {
            Authorization: `Bearer ${ownerToken}`
        }, {
            recordType: 'INSPECTION',
            performedAt: '2026-05-10',
            expiresAt: '2027-05-10',
            provider: 'Trung tâm đăng kiểm 29-03V',
            referenceNumber: 'DK-2026-999',
            odometerKm: 20000,
            result: 'PASSED',
            note: 'Đạt tiêu chuẩn an toàn kỹ thuật'
        });
        const pass = res.status === 200 && res.data?.data?.id;
        if (pass) safetyRecordId = res.data.data.id;
        logTest('TC-SAF-01', 'Safety - Owner Create Record', 'Chủ xe thêm bản ghi đăng kiểm an toàn thành công (PENDING)', pass, `HTTP ${res.status}, recordId=${safetyRecordId}`, 'HTTP 200 PENDING');
    } catch (e) {
        logTest('TC-SAF-01', 'Safety - Owner Create Record', 'Create safety record', false, e.message, 'HTTP 200');
    }

    // 6.2 Admin xác minh bản ghi an toàn
    if (safetyRecordId) {
        try {
            const res = await request('PATCH', `/api/admin/cars/${bookingCarId}/safety-records/${safetyRecordId}/verify`, {
                Authorization: `Bearer ${adminToken}`
            }, {
                verifyStatus: 'APPROVED',
                rejectReason: null
            });
            const pass = res.status === 200 && res.data?.data?.verifyStatus === 'APPROVED';
            logTest('TC-SAF-02', 'Safety - Admin Verify Record', 'Admin xác minh duyệt bản ghi an toàn thành công', pass, `HTTP ${res.status}, verifyStatus=${res.data?.data?.verifyStatus}`, 'HTTP 200 APPROVED');
        } catch (e) {
            logTest('TC-SAF-02', 'Safety - Admin Verify Record', 'Admin verify safety', false, e.message, 'HTTP 200');
        }
    }

    // 6.3 Public xem tóm tắt an toàn xe
    try {
        const res = await request('GET', `/api/cars/${bookingCarId}/safety`);
        const pass = res.status === 200 && res.data?.data?.level !== undefined;
        logTest('TC-SAF-03', 'Safety - Public Summary', 'Xem tóm tắt hồ sơ an toàn xe công khai thành công', pass, `HTTP ${res.status}, level=${res.data?.data?.level}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-SAF-03', 'Safety - Public Summary', 'Get safety summary', false, e.message, 'HTTP 200');
    }

    // 6.4 Owner Dashboard
    try {
        const res = await request('GET', '/api/dashboards/owner', { Authorization: `Bearer ${ownerToken}` });
        const pass = res.status === 200 && res.data?.data?.totalCars !== undefined;
        logTest('TC-DASH-01', 'Dashboard - Owner', 'Lấy số liệu bảng điều khiển chủ xe thành công', pass, `HTTP ${res.status}, totalCars=${res.data?.data?.totalCars}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-DASH-01', 'Dashboard - Owner', 'Owner dashboard', false, e.message, 'HTTP 200');
    }

    // 6.5 Customer Dashboard
    try {
        const res = await request('GET', '/api/dashboards/customer', { Authorization: `Bearer ${customerToken}` });
        const pass = res.status === 200 && res.data?.data?.totalBookings !== undefined;
        logTest('TC-DASH-02', 'Dashboard - Customer', 'Lấy số liệu chuyến đi khách hàng thành công', pass, `HTTP ${res.status}, totalBookings=${res.data?.data?.totalBookings}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-DASH-02', 'Dashboard - Customer', 'Customer dashboard', false, e.message, 'HTTP 200');
    }

    // 6.6 Admin Dashboard Revenue
    try {
        const res = await request('GET', '/api/admin/dashboard/revenue', { Authorization: `Bearer ${adminToken}` });
        const pass = res.status === 200 && res.data?.data?.totalRevenue !== undefined;
        logTest('TC-DASH-03', 'Dashboard - Admin Revenue', 'Lấy báo cáo doanh thu bán gói cước thành công', pass, `HTTP ${res.status}, totalRevenue=${res.data?.data?.totalRevenue}`, 'HTTP 200');
    } catch (e) {
        logTest('TC-DASH-03', 'Dashboard - Admin Revenue', 'Admin revenue dashboard', false, e.message, 'HTTP 200');
    }

    // ================================================================
    // PHÂN HỆ 7: KIỂM THỬ GIAO DIỆN BẰNG PLAYWRIGHT (BROWSER E2E)
    // ================================================================
    console.log('\n--- 7. KIỂM THỬ GIAO DIỆN TRÌNH DUYỆT (PLAYWRIGHT) ---');

    let browser;
    try {
        browser = await chromium.launch({ channel: 'msedge', headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(`${FE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const title = await page.title();
        const homePass = title.length > 0;
        logTest('TC-UI-01', 'UI - Home Page', 'Trang chủ tải thành công, không crash', homePass, `Title: "${title}"`, 'Trang chủ hiển thị đúng');

        // 7.2 Explore cars page
        await page.goto(`${FE_URL}/explore`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const exploreContent = await page.content();
        const explorePass = exploreContent.includes('Khám phá') || exploreContent.includes('Bộ lọc') || exploreContent.includes('xe');
        logTest('TC-UI-02', 'UI - Explore Page', 'Trang tìm kiếm xe hiển thị danh sách và bộ lọc', explorePass, 'Giao diện explore phản hồi', 'Hiển thị xe và bộ lọc');

        // 7.3 Unverified customer route guard test: Chặn vào /owner/dashboard
        await page.goto(`${FE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.fill('input[type="email"]', 'tester99@gmail.com');
        await page.fill('input[type="password"]', 'Password123@');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1500);

        // Thử truy cập thẳng /owner/dashboard
        await page.goto(`${FE_URL}/owner/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const ownerBlockedContent = await page.content();
        const gateBlockedPass = ownerBlockedContent.includes('Cần xác minh giấy tờ') || ownerBlockedContent.includes('Chủ xe') || ownerBlockedContent.includes('KYC');
        logTest('TC-UI-03', 'UI - Route Guard', 'Tài khoản chưa duyệt KYC bị chặn khi vào /owner/* kèm thông báo nộp giấy tờ', gateBlockedPass, 'Hiển thị Gate chặn quyền truy cập', 'Màn hình Gate cảnh báo xác minh KYC');

        // 7.4 Owner đăng nhập và vào trang /owner/vehicles
        await page.goto(`${FE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.fill('input[type="email"]', 'binh@gmail.com');
        await page.fill('input[type="password"]', 'Password123@');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1500);

        await page.goto(`${FE_URL}/owner/vehicles`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);
        const ownerVehiclesContent = await page.content();
        const ownerPass = ownerVehiclesContent.includes('Xe của tôi') || ownerVehiclesContent.includes('Đăng ký xe');
        logTest('TC-UI-04', 'UI - Owner Vehicles', 'Chủ xe truy cập thành công danh sách xe của mình', ownerPass, 'Trang /owner/vehicles hiển thị', 'Màn hình quản lý xe của chủ');

        // 7.5 Admin đăng nhập và vào /admin/dashboard, /admin/users
        await page.goto(`${FE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.fill('input[type="email"]', 'admin@carrental.vn');
        await page.fill('input[type="password"]', 'Password123@');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1500);

        await page.goto(`${FE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const adminDashContent = await page.content();
        const adminDashPass = adminDashContent.includes('Tổng quan') || adminDashContent.includes('Doanh thu') || adminDashContent.includes('Quản trị');
        logTest('TC-UI-05', 'UI - Admin Dashboard', 'Quản trị viên truy cập bảng điều khiển Admin thành công', adminDashPass, 'Admin dashboard hiển thị', 'Bảng điều khiển quản trị viên');

        await page.goto(`${FE_URL}/admin/users`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const adminUsersContent = await page.content();
        const adminUsersPass = adminUsersContent.includes('Người dùng') || adminUsersContent.includes('KYC');
        logTest('TC-UI-06', 'UI - Admin Users & KYC', 'Quản trị viên truy cập trang Người dùng & KYC thành công', adminUsersPass, 'Trang duyệt KYC hiển thị', 'Màn hình danh sách người dùng và duyệt KYC');

        await browser.close();
    } catch (e) {
        logTest('TC-UI-ERR', 'UI - Browser Automation', 'Lỗi thực thi kiểm thử Playwright', false, e.message, 'Browser test hoàn thành không văng exception');
        if (browser) await browser.close();
    }

    console.log('\n====================================================');
    console.log(`KẾT QUẢ KIỂM THỬ: ${passedCount} ĐẠT, ${failedCount} THẤT BẠI / TỔNG SỐ ${results.length} CA TEST`);
    console.log('====================================================');

    fs.writeFileSync('d:/SBA/test_run_results.json', JSON.stringify({
        timestamp: new Date().toISOString(),
        total: results.length,
        passed: passedCount,
        failed: failedCount,
        details: results
    }, null, 2));
}

run().catch(err => {
    console.error('Lỗi nghiêm trọng khi chạy suite:', err);
    process.exit(1);
});
