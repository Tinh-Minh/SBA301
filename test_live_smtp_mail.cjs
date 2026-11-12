const net = require('net');
const http = require('http');

const BASE_URL = 'http://localhost:8080';
const SMTP_PORT = 2525;

let failNextMail = false;
const capturedEmails = [];

function decodeQuotedPrintableUtf8(str) {
    // Unfold soft line breaks and decode =XX UTF-8 bytes if present
    const unfolded = str.replace(/=\r?\n/g, '');
    const bytes = [];
    for (let i = 0; i < unfolded.length; i++) {
        if (unfolded[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(unfolded.slice(i + 1, i + 3))) {
            bytes.push(parseInt(unfolded.slice(i + 1, i + 3), 16));
            i += 2;
        } else {
            const buf = Buffer.from(unfolded[i], 'utf8');
            for (const b of buf) bytes.push(b);
        }
    }
    return Buffer.from(bytes).toString('utf8');
}

function decodeMimeBody(raw) {
    // Handle base64 or quoted-printable or plain UTF-8
    const parts = raw.split(/\r?\n\r?\n/);
    const headers = parts[0] || '';
    const body = parts.slice(1).join('\r\n\r\n');
    let decodedBody = body;
    if (/Content-Transfer-Encoding:\s*base64/i.test(headers)) {
        decodedBody = Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
    } else if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(headers)) {
        decodedBody = decodeQuotedPrintableUtf8(body);
    }
    const decodedHeaders = headers.replace(/=\?UTF-8\?([BQ])\?([^?]+)\?=/gi, (_, enc, val) => {
        if (enc.toUpperCase() === 'B') return Buffer.from(val, 'base64').toString('utf8');
        return decodeQuotedPrintableUtf8(val.replace(/_/g, ' '));
    });
    return { headers: decodedHeaders, body: decodedBody, raw };
}

function startSmtpServer() {
    return new Promise((resolve) => {
        const server = net.createServer((socket) => {
            let mode = 'CMD';
            let buffer = '';
            let dataBuf = '';
            let current = { from: '', to: [], raw: '' };

            socket.write('220 localhost Simple Mock SMTP Ready\r\n');

            socket.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
                if (mode === 'DATA') {
                    dataBuf += buffer;
                    buffer = '';
                    const endIdx = dataBuf.indexOf('\r\n.\r\n');
                    if (endIdx !== -1) {
                        const rawEmail = dataBuf.slice(0, endIdx).replace(/\r\n\.\./g, '\r\n.');
                        dataBuf = '';
                        mode = 'CMD';
                        if (failNextMail) {
                            socket.write('550 Simulated SMTP delivery failure\r\n');
                        } else {
                            capturedEmails.push({
                                from: current.from,
                                to: current.to,
                                ...decodeMimeBody(rawEmail),
                            });
                            socket.write('250 2.0.0 Ok: queued\r\n');
                        }
                    }
                    return;
                }

                let nl;
                while ((nl = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, nl).replace(/\r$/, '');
                    buffer = buffer.slice(nl + 1);
                    const upper = line.toUpperCase();
                    if (upper.startsWith('EHLO')) {
                        socket.write('250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n');
                    } else if (upper.startsWith('HELO')) {
                        socket.write('250 localhost\r\n');
                    } else if (upper.startsWith('AUTH ')) {
                        socket.write('235 2.7.0 Authentication successful\r\n');
                    } else if (upper.startsWith('MAIL FROM:')) {
                        current = { from: line.slice(10).trim(), to: [], raw: '' };
                        socket.write('250 2.1.0 Ok\r\n');
                    } else if (upper.startsWith('RCPT TO:')) {
                        current.to.push(line.slice(8).trim());
                        socket.write('250 2.1.5 Ok\r\n');
                    } else if (upper === 'DATA') {
                        mode = 'DATA';
                        dataBuf = buffer;
                        buffer = '';
                        socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
                        break;
                    } else if (upper === 'QUIT') {
                        socket.write('221 2.0.0 Bye\r\n');
                        socket.end();
                        break;
                    } else if (upper === 'NOOP') {
                        socket.write('250 OK\r\n');
                    } else {
                        socket.write('250 OK\r\n');
                    }
                }
            });
        });
        server.listen(SMTP_PORT, '127.0.0.1', () => resolve(server));
    });
}

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
        const boundary = '----SmtpBoundary' + Date.now();
        const chunks = [];
        for (const p of parts) {
            chunks.push(Buffer.from(`--${boundary}\r\n`));
            if (p.filename) {
                chunks.push(Buffer.from(`Content-Disposition: form-data; name="${p.name}"; filename="${p.filename}"\r\n`));
                chunks.push(Buffer.from(`Content-Type: ${p.contentType}\r\n\r\n`));
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

const VALID_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAD0lEQVR4nGNowAEYhpYEAILzYAGc7g8kAAAAAElFTkSuQmCC',
    'base64'
);

async function run() {
    const mode = process.argv[2] || 'all';
    if (mode === 'server-only') {
        await startSmtpServer();
        console.log(`Mock SMTP listening on 127.0.0.1:${SMTP_PORT}`);
        return;
    }

    const smtp = await startSmtpServer();
    console.log(`Mock SMTP listening on 127.0.0.1:${SMTP_PORT}`);
    let passed = 0;
    let failed = 0;
    const assertCheck = (id, name, ok, info) => {
        if (ok) {
            passed++;
            console.log(`[PASS] [${id}] ${name} -> ${info}`);
        } else {
            failed++;
            console.error(`[FAIL] [${id}] ${name} -> ${info}`);
        }
    };

    try {
        const adminLogin = await jsonReq('POST', '/api/auth/login', null, { email: 'admin@carrental.vn', password: 'Password123@' });
        const adminToken = adminLogin.data?.data?.accessToken;
        assertCheck('SMTP-00', 'Admin login', Boolean(adminToken), `HTTP ${adminLogin.status}`);

        // Register user -> notice registration ALSO sends verification email when mail is configured!
        const ts = Date.now();
        const email = `smtptest_${ts}@test.vn`;
        const phone = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
        await jsonReq('POST', '/api/auth/register', null, {
            fullName: 'SMTP Live User',
            email,
            phone,
            password: 'Password123@',
        });

        // Verify email via token extracted from verification email!
        const regMail = capturedEmails.find(m => m.to.some(t => t.includes(email)));
        const tokenMatch = regMail?.body?.match(/token=([A-Za-z0-9\-_.]+)/);
        assertCheck('SMTP-01', 'Registration sent verification email over live SMTP', Boolean(tokenMatch), `captured=${capturedEmails.length}`);
        if (tokenMatch) {
            await jsonReq('POST', '/api/auth/verify-email', null, { token: tokenMatch[1] });
        }

        const userLogin = await jsonReq('POST', '/api/auth/login', null, { email, password: 'Password123@' });
        const userToken = userLogin.data?.data?.accessToken;
        assertCheck('SMTP-02', 'User logged in after SMTP email verification', Boolean(userToken), `HTTP ${userLogin.status}`);

        // Submit doc 1 -> Admin REJECTS -> verify email has rejection reason
        const sub1 = await multipartReq('/api/user-documents', userToken, [
            { name: 'docType', value: 'CITIZEN_ID' },
            { name: 'docNumber', value: `SMTP1_${ts}` },
            { name: 'fullNameOnDoc', value: 'SMTP Live User' },
            { name: 'dateOfBirthOnDoc', value: '1995-05-05' },
            { name: 'issuePlace', value: 'Cục Cảnh sát' },
            { name: 'issueDate', value: '2022-01-01' },
            { name: 'frontImage', filename: 'f1.png', contentType: 'image/png', buffer: VALID_PNG },
            { name: 'backImage', filename: 'b1.png', contentType: 'image/png', buffer: VALID_PNG },
        ]);
        const doc1Id = sub1.data?.data?.id;
        const rejectReason = 'Ảnh CCCD bị chói sáng ở góc trái';
        const beforeRejectCount = capturedEmails.length;
        const rejRes = await jsonReq('PATCH', `/api/user-documents/${doc1Id}/review`, adminToken, {
            verifyStatus: 'REJECTED',
            rejectReason,
        });
        const rejEmail = capturedEmails.slice(beforeRejectCount).find(m => m.to.some(t => t.includes(email)));
        assertCheck(
            'SMTP-03',
            'Admin rejection sends live SMTP email with Vietnamese reason',
            rejRes.status === 200 && Boolean(rejEmail) && rejEmail.body.includes(rejectReason) && rejEmail.body.includes('Còn 2/3 lượt'.replace('Còn', 'còn')),
            `status=${rejRes.status}, hasEmail=${Boolean(rejEmail)}, hasReason=${rejEmail?.body?.includes(rejectReason)}`
        );

        // Submit doc 2 -> Admin APPROVES -> verify email has congrats + OWNER upgrade
        const sub2 = await multipartReq('/api/user-documents', userToken, [
            { name: 'docType', value: 'CITIZEN_ID' },
            { name: 'docNumber', value: `SMTP2_${ts}` },
            { name: 'fullNameOnDoc', value: 'SMTP Live User' },
            { name: 'dateOfBirthOnDoc', value: '1995-05-05' },
            { name: 'issuePlace', value: 'Cục Cảnh sát' },
            { name: 'issueDate', value: '2022-01-01' },
            { name: 'frontImage', filename: 'f2.png', contentType: 'image/png', buffer: VALID_PNG },
            { name: 'backImage', filename: 'b2.png', contentType: 'image/png', buffer: VALID_PNG },
        ]);
        const doc2Id = sub2.data?.data?.id;
        const beforeApproveCount = capturedEmails.length;
        const appRes = await jsonReq('PATCH', `/api/user-documents/${doc2Id}/review`, adminToken, {
            verifyStatus: 'APPROVED',
        });
        const appEmail = capturedEmails.slice(beforeApproveCount).find(m => m.to.some(t => t.includes(email)));
        assertCheck(
            'SMTP-04',
            'Admin approval sends live SMTP congratulatory email for OWNER upgrade',
            appRes.status === 200 && Boolean(appEmail) && appEmail.headers.includes('Chúc mừng') && appEmail.body.includes('Chủ xe (OWNER)'),
            `status=${appRes.status}, hasEmail=${Boolean(appEmail)}, subjectOk=${appEmail?.headers?.includes('Chúc mừng')}`
        );

        // Now test LIVE SMTP FAILURE (SMTP server rejects DATA with 550) on another user!
        failNextMail = true;
        const emailFail = `smtpfail_${ts}@test.vn`;
        const phoneFail = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
        // Note: AuthServiceImpl throws DEPENDENCY_UNAVAILABLE if register mail fails, so register first with failNextMail=false, then turn failNextMail=true!
        failNextMail = false;
        await jsonReq('POST', '/api/auth/register', null, {
            fullName: 'SMTP Fail User',
            email: emailFail,
            phone: phoneFail,
            password: 'Password123@',
        });
        const regFailMail = capturedEmails.find(m => m.to.some(t => t.includes(emailFail)));
        const tokFail = regFailMail?.body?.match(/token=([A-Za-z0-9\-_.]+)/);
        if (tokFail) await jsonReq('POST', '/api/auth/verify-email', null, { token: tokFail[1] });
        const uFailLogin = await jsonReq('POST', '/api/auth/login', null, { email: emailFail, password: 'Password123@' });
        const uFailToken = uFailLogin.data?.data?.accessToken;

        const subFail = await multipartReq('/api/user-documents', uFailToken, [
            { name: 'docType', value: 'CITIZEN_ID' },
            { name: 'docNumber', value: `SMTPF_${ts}` },
            { name: 'frontImage', filename: 'ff.png', contentType: 'image/png', buffer: VALID_PNG },
            { name: 'backImage', filename: 'bf.png', contentType: 'image/png', buffer: VALID_PNG },
        ]);
        const docFailId = subFail.data?.data?.id;

        failNextMail = true;
        const rejFailRes = await jsonReq('PATCH', `/api/user-documents/${docFailId}/review`, adminToken, {
            verifyStatus: 'REJECTED',
            rejectReason: 'Lý do vẫn phải lưu dù mail lỗi',
        });
        const checkUserDocs = await jsonReq('GET', '/api/user-documents?scope=mine', uFailToken);
        const persistedReason = checkUserDocs.data?.data?.content?.[0]?.rejectReason;
        assertCheck(
            'SMTP-05',
            'Live SMTP 550 mail failure does NOT fail admin review or rollback rejectReason',
            rejFailRes.status === 200 && persistedReason === 'Lý do vẫn phải lưu dù mail lỗi',
            `reviewStatus=${rejFailRes.status}, persistedReason="${persistedReason}"`
        );
    } finally {
        smtp.close();
    }
    console.log(`\n=== SMTP LIVE SUMMARY: ${passed} PASSED / ${failed} FAILED ===`);
    if (failed > 0) process.exit(1);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
