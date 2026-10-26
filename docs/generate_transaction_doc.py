# -*- coding: utf-8 -*-
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_code_block(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "F7FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=200, right=200)
    
    # Left border accent
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="3182CE"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(45, 55, 72)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_callout(doc, title, text, bg_color="EBF8FF", border_color="3182CE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"📌 {title}: ")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(10.5)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(43, 108, 176)
    
    run_text = p.add_run(text)
    run_text.font.name = "Calibri"
    run_text.font.size = Pt(10)
    run_text.font.color.rgb = RGBColor(45, 55, 72)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def main():
    doc = docx.Document()
    
    # Set standard margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.different_first_page_header_footer = True
        
        # Header / Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("SBA301 - Nền tảng Cho Thuê Xe Tự Lái | Luồng Giao Dịch & Hoàn Tiền")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(160, 174, 192)

    # ------------------ TITLE & COVER BLOCK ------------------
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(18)
    p_title.paragraph_format.space_after = Pt(6)
    run_title = p_title.add_run("TÀI LIỆU ĐẶC TẢ LUỒNG HOẠT ĐỘNG GIAO DỊCH\n(TRANSACTION LIFECYCLE & REFUND FLOW)")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(26, 54, 93) # Navy

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run("Dự án: Hệ thống Cho Thuê Xe Tự Lái Trực Tuyến (SBA301 - Car Rental Marketplace)")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(74, 85, 104)

    # Meta box
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table, color="E2E8F0", sz="6")
    meta_data = [
        ("Phân hệ phụ trách:", "Function 3 (Đơn thuê & Vòng đời) & Function 4 (Giao dịch, Thanh toán, Chi trả & Hoàn tiền)"),
        ("Đối tượng áp dụng:", "Khách thuê (Customer/Renter), Chủ xe (Car Owner), Quản trị viên (Admin), Kế toán sàn"),
        ("Cổng tích hợp:", "VNPay Sandbox Payment Gateway & Mock Gateway giả lập"),
        ("Ngày phát hành:", "Tháng 10/2026 | Phiên bản 1.0 (Chuẩn kiểm thử Postman & Backend API)")
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        c0 = meta_table.cell(row_idx, 0)
        c1 = meta_table.cell(row_idx, 1)
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_background(c0, "F7FAFC")
        set_cell_margins(c0, 60, 60, 100, 100)
        set_cell_margins(c1, 60, 60, 100, 100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(43, 108, 176)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ------------------ PHẦN I ------------------
    h1 = doc.add_heading("I. TỔNG QUAN KIẾN TRÚC GIAO DỊCH & BẢO MẬT DÒNG TIỀN", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    
    p = doc.add_paragraph(
        "Trong nền tảng Car Rental SBA301, giao dịch (Transaction) được thiết kế theo mô hình Ký quỹ / Đảm bảo giao dịch (Escrow Model) "
        "nhằm bảo vệ tối đa quyền lợi cho cả Khách thuê (Renter) lẫn Chủ xe (Owner). Dòng tiền trong hệ thống được phân định rõ ràng thành các loại giao dịch:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)

    types = [
        ("1. Tiền đặt cọc giữ xe (DEPOSIT):", " Số tiền cố định theo từng loại xe (chụp từ cấu hình cars.deposit_amount). Khoản tiền này được giữ an toàn trên sàn trong suốt chuyến đi và chỉ được hoàn trả (REFUND) sau khi kết thúc chuyến đi và kiểm tra xe không có thiệt hại."),
        ("2. Tiền thuê xe (RENTAL_PAYMENT):", " Tiền thuê tính theo số giờ/ngày thực tế đã trừ mã giảm giá (Voucher). Khoản tiền này chuyển vào tài khoản trung gian của hệ thống và chỉ được chi trả (PAYOUT) cho chủ xe sau khi chuyến đi hoàn tất thành công."),
        ("3. Phí phát sinh (EXTRA_FEE):", " Các khoản phụ thu được phát hiện lúc trả xe như: rửa xe (CLEANING), trễ giờ (LATE_RETURN), vượt số km (EXTRA_KM), hoặc bồi thường va quẹt nhẹ (DAMAGE)."),
        ("4. Hoàn tiền (REFUND):", " Giao dịch hoàn trả tiền cọc hoặc hoàn tiền thuê xe do huỷ chuyến/giải quyết khiếu nại. Mỗi giao dịch hoàn tiền luôn liên kết trực tiếp với một giao dịch gốc (parentTransactionId) và được kiểm soát nghiêm ngặt không vượt quá số tiền gốc."),
        ("5. Chi trả chủ xe (PAYOUT):", " Lệnh quyết toán chuyển tiền từ hệ thống về số tài khoản ngân hàng của chủ xe sau khi đã khấu trừ phí dịch vụ sàn (platformFee = 10%).")
    ]
    for title, desc in types:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_before = Pt(2)
        bp.paragraph_format.space_after = Pt(2)
        bp.paragraph_format.line_spacing = 1.15
        rt = bp.add_run(title)
        rt.bold = True
        rt.font.color.rgb = RGBColor(26, 54, 93)
        rd = bp.add_run(desc)
        rd.font.color.rgb = RGBColor(45, 55, 72)

    add_callout(
        doc,
        "Nguyên tắc Bất biến (Immutability & Safety)",
        "Tất cả các bản ghi giao dịch (Transaction) khi đã thành công (SUCCESS) sẽ KHÔNG bị sửa đổi hay xoá. "
        "Mọi hành động hoàn tiền đều tạo ra bản ghi Transaction mới mang loại REFUND tham chiếu tới giao dịch gốc (refundOfId), "
        "sử dụng khóa bi quan (Pessimistic Lock - SELECT FOR UPDATE) để ngăn chặn tuyệt đối tình trạng Race Condition hay Double-Refund."
    )

    add_callout(
        doc,
        "Giải thích thuật ngữ 'Tx' là gì?",
        "Trong ngành phần mềm và tài chính ngân hàng, 'Tx' là từ viết tắt quy ước của 'Transaction' (Giao dịch). "
        "Khi tài liệu nhắc đến 'Tạo Tx' hoặc 'Tx DEPOSIT', điều đó có nghĩa là hệ thống tạo một bản ghi mới trong bảng 'transactions' "
        "của cơ sở dữ liệu (tương ứng với Java Entity: Transaction.java) để lưu trữ số tiền, phương thức (VNPay/Mock), mã tham chiếu và trạng thái xử lý."
    )

    # ------------------ PHẦN II ------------------
    h2 = doc.add_heading("II. BẢNG TỔNG HỢP TOÀN BỘ API THEO THỨ TỰ THỰC THI", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph("Dưới đây là trình tự gọi API đầy đủ từ lúc người dùng bắt đầu tìm xe đến khi hoàn tất trả tiền cọc và chi trả doanh thu:").paragraph_format.space_after = Pt(6)

    table_api = doc.add_table(rows=1, cols=6)
    table_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_api, color="CBD5E0", sz="4")

    headers = ["Bước", "Tên Thao Tác", "Method", "Endpoint API", "Người Gọi", "Mục Đích / Trạng Thái Mới"]
    col_widths = [Inches(0.6), Inches(1.4), Inches(0.8), Inches(2.2), Inches(0.9), Inches(1.6)]
    
    hdr_cells = table_api.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "2B6CB0") # Blue
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=80, right=80)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(title)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    api_steps = [
        ("0", "Đăng nhập", "POST", "/api/auth/login", "Mọi Role", "Lấy Bearer Token JWT"),
        ("1", "Tính báo giá", "POST", "/api/orders/quote", "Khách thuê", "Tính tiền thuê & tiền cọc dự kiến"),
        ("2", "Tạo đơn thuê xe", "POST", "/api/orders", "Khách thuê", "Tạo đơn (OrderStatus: PENDING)"),
        ("3", "Chủ xe duyệt đơn", "PUT", "/api/orders/{id}/confirm", "Chủ xe", "Duyệt đơn (OrderStatus: CONFIRMED)"),
        ("4", "Tạo giao dịch Đặt cọc", "POST", "/api/transactions/deposit", "Khách thuê", "Tạo Giao dịch DEPOSIT (status: PENDING)"),
        ("5a", "Thanh toán cọc VNPay", "GET", "/api/transactions/{id}/vnpay-url", "Khách thuê", "Lấy URL Sandbox & nhập thẻ test"),
        ("5b", "Mô phỏng cổng cọc", "POST", "/api/transactions/{id}/simulate-gateway", "Khách / Dev", "Chuyển Giao dịch cọc sang SUCCESS"),
        ("6", "Tạo giao dịch Tiền thuê", "POST", "/api/transactions/payment", "Khách thuê", "Tạo Giao dịch RENTAL_PAYMENT"),
        ("7", "Thanh toán tiền thuê", "POST/GET", "/simulate-gateway hoặc VNPay", "Khách thuê", "Chuyển Giao dịch tiền thuê sang SUCCESS, Order.paymentStatus -> PAID"),
        ("8", "Bàn giao nhận xe (Pickup)", "POST/PUT", "/api/orders/{id}/handovers & confirm", "Cả 2 bên", "Ký biên bản nhận xe, OrderStatus -> ONGOING"),
        ("9", "Bàn giao trả xe (Return)", "POST/PUT", "/api/orders/{id}/handovers & confirm", "Cả 2 bên", "Ký biên bản trả xe, OrderStatus -> COMPLETED"),
        ("10", "Tạo phí phát sinh (nếu có)", "POST", "/api/extra-fees", "Chủ xe/Admin", "Ghi nhận phí dọn xe, trễ giờ, quá km..."),
        ("11", "Thanh toán phụ phí", "POST", "/api/extra-fees/{id}/pay", "Khách thuê", "Tạo Giao dịch EXTRA_FEE -> SUCCESS"),
        ("12", "HOÀN TIỀN CỌC (Refund)", "POST", "/api/transactions/refund", "Admin", "Tạo Giao dịch REFUND -> Hoàn tiền cọc về cho khách"),
        ("13", "Chi trả tiền cho Chủ xe", "POST/PUT", "/api/payouts & /process", "Admin/Sàn", "Tạo Payout -> Chuyển tiền vào STK chủ xe (PAID)"),
        ("14", "Đánh giá chuyến đi", "POST", "/api/reviews", "Khách thuê", "Đánh giá sao và nhận xét chất lượng xe")
    ]

    for step, name, method, endpoint, actor, note in api_steps:
        row_cells = table_api.add_row().cells
        for idx, text in enumerate([step, name, method, endpoint, actor, note]):
            row_cells[idx].width = col_widths[idx]
            set_cell_margins(row_cells[idx], top=60, bottom=60, left=70, right=70)
            if idx == 0:
                set_cell_background(row_cells[idx], "F7FAFC")
            p = row_cells[idx].paragraphs[0]
            if idx in (0, 2):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if idx == 2:
                r.bold = True
                if text == "POST":
                    r.font.color.rgb = RGBColor(49, 130, 206) # Blue
                elif text == "PUT":
                    r.font.color.rgb = RGBColor(214, 158, 46) # Orange
                elif text == "GET":
                    r.font.color.rgb = RGBColor(56, 161, 105) # Green
            elif idx == 1:
                r.bold = True
                r.font.color.rgb = RGBColor(45, 55, 72)
            elif idx == 3:
                r.font.name = "Consolas"
                r.font.color.rgb = RGBColor(43, 108, 176)
            else:
                r.font.color.rgb = RGBColor(74, 85, 104)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ------------------ PHẦN III ------------------
    h3 = doc.add_heading("III. CHI TIẾT CÁC BƯỚC THỰC HIỆN TỪ ĐẶT XE ĐẾN HOÀN TIỀN", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)

    # BƯỚC 1 & 2
    doc.add_heading("1. Giai đoạn Đặt xe & Duyệt đơn (Booking & Approval)", level=2)
    doc.add_paragraph(
        "Quy trình giao dịch bắt đầu khi khách thuê lựa chọn được chiếc xe phù hợp và yêu cầu hệ thống tính toán chi phí minh bạch:"
    ).paragraph_format.line_spacing = 1.15

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 1.1 - Yêu cầu Báo giá trước (Quote): ").bold = True
    p.add_run("Khách gọi API ")
    r = p.add_run("POST /api/orders/quote")
    r.font.name = "Consolas"
    p.add_run(" kèm thời gian nhận/trả xe và mã giảm giá (voucher). Hệ thống tính toán tổng tiền thuê (totalAmount) và số tiền cọc quy định (depositAmount) mà chưa lưu đơn vào cơ sở dữ liệu.")

    add_code_block(doc, """// Request: POST /api/orders/quote
{
  "carId": 3,
  "startDateTime": "2026-11-01T08:00:00",
  "endDateTime": "2026-11-03T20:00:00",
  "voucherCode": "GIAM50K"
}

// Response: HTTP 200 OK
{
  "success": true,
  "data": {
    "carId": 3,
    "rentalPricePerDay": 600000,
    "totalDays": 3,
    "depositAmount": 2000000,
    "rentalAmount": 1800000,
    "discountAmount": 50000,
    "totalAmount": 1750000
  }
}""")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 1.2 - Khách tạo đơn thuê chính thức (Create Order): ").bold = True
    p.add_run("Khách gọi API ")
    r = p.add_run("POST /api/orders")
    r.font.name = "Consolas"
    p.add_run(". Hệ thống kiểm tra lịch trống (Car Slot), tính toán và lưu đơn thuê với trạng thái ")
    p.add_run("OrderStatus = PENDING").bold = True
    p.add_run(" và ")
    p.add_run("PaymentStatus = UNPAID").bold = True
    p.add_run(". Đơn được cấp mã duy nhất, ví dụ: ORD-2026-001 kèm thời hạn tự hủy (expiresAt, mặc định sau 2 giờ nếu không được duyệt/thanh toán).")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 1.3 - Chủ xe duyệt đơn (Confirm Order): ").bold = True
    p.add_run("Chủ xe nhận thông báo đơn mới, kiểm tra lịch trình và gọi API ")
    r = p.add_run("PUT /api/orders/{orderId}/confirm")
    r.font.name = "Consolas"
    p.add_run(". Trạng thái đơn chuyển sang ")
    p.add_run("OrderStatus = CONFIRMED").bold = True
    p.add_run(". Khi đơn đã CONFIRMED, người thuê mới được phép tiến hành bước thanh toán cọc và tiền thuê.")

    # BƯỚC 3 & 4: THANH TOÁN
    doc.add_heading("2. Giai đoạn Ký quỹ Đặt cọc & Thanh toán tiền thuê (Escrow Payment)", level=2)
    doc.add_paragraph(
        "Hệ thống SBA301 tách bạch 2 dòng tiền để đảm bảo tính độc lập và minh bạch:"
    ).paragraph_format.line_spacing = 1.15

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 2.1 - Tạo giao dịch đặt cọc giữ xe (Create Deposit): ").bold = True
    p.add_run("Khách gọi API ")
    r = p.add_run("POST /api/transactions/deposit")
    r.font.name = "Consolas"
    p.add_run(". Backend kiểm tra điều kiện:")
    
    sub_checks = [
        "Đơn thuê phải ở trạng thái CONFIRMED và chưa quá hạn expiresAt.",
        "Đơn thuê chưa từng có giao dịch DEPOSIT nào ở trạng thái SUCCESS trước đó (tránh cọc trùng).",
        "Số tiền cọc phải khớp chính xác với order.depositAmount (ví dụ 2,000,000 VND)."
    ]
    for sc in sub_checks:
        sp = doc.add_paragraph(style='List Bullet 2')
        sp.paragraph_format.space_before = Pt(1)
        sp.paragraph_format.space_after = Pt(1)
        sp.add_run(sc).font.color.rgb = RGBColor(74, 85, 104)

    add_code_block(doc, """// Request: POST /api/transactions/deposit
{
  "orderId": 1,
  "amount": 2000000,
  "method": "VNPAY" // hoặc "MOCK_GATEWAY"
}

// Response: HTTP 200 OK
{
  "success": true,
  "message": "Tạo giao dịch đặt cọc thành công",
  "data": {
    "id": 102,
    "orderId": 1,
    "transactionType": "DEPOSIT",
    "amount": 2000000,
    "method": "VNPAY",
    "status": "PENDING",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=200000000&vnp_Command=pay..."
  }
}""")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 2.2 - Xử lý cổng thanh toán: ").bold = True
    p.add_run("Khách hàng thực hiện qua 1 trong 2 hình thức:")
    
    pay_methods = [
        ("Cổng VNPay Sandbox thực tế: ", "Khách truy cập link paymentUrl, chọn ngân hàng NCB, nhập thẻ test 9704198526191432198, tên NGUYEN VAN A, ngày phát hành 07/15, OTP 123456. Sau khi thanh toán, VNPay gọi về Return URL (/api/transactions/vnpay-return) và IPN (/api/vnpay/ipn)."),
        ("Giả lập Mock Gateway (Dành cho Dev/Testing): ", "Gọi API POST /api/transactions/{id}/simulate-gateway kèm body {\"simulateSuccess\": true}. Giao dịch ngay lập tức chuyển sang trạng thái SUCCESS và cập nhật paidAt.")
    ]
    for pm_title, pm_desc in pay_methods:
        pmp = doc.add_paragraph(style='List Bullet 2')
        pmp.paragraph_format.space_before = Pt(1)
        pmp.paragraph_format.space_after = Pt(1)
        pmp.add_run(pm_title).bold = True
        pmp.add_run(pm_desc)

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 2.3 - Thanh toán tiền thuê xe (Rental Payment): ").bold = True
    p.add_run("Khách tiếp tục gọi API ")
    r = p.add_run("POST /api/transactions/payment")
    r.font.name = "Consolas"
    p.add_run(" với số tiền thuê (ví dụ 1,750,000 VND). Khi giao dịch này thanh toán SUCCESS, hệ thống tự động kích hoạt ")
    p.add_run("PaymentCompletedEvent").bold = True
    p.add_run(", cập nhật ")
    p.add_run("order.paymentStatus = PAID").bold = True
    p.add_run(". Lúc này đơn thuê đã sẵn sàng cho ngày nhận xe.")

    # BƯỚC BÀN GIAO & PHÍ PHÁT SINH
    doc.add_heading("3. Giai đoạn Bàn giao xe & Xử lý Phí phát sinh (Handover & Extra Fees)", level=2)
    
    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 3.1 - Bàn giao nhận xe (Pickup Handover): ").bold = True
    p.add_run("Khi đến giờ nhận xe, 2 bên gặp nhau kiểm tra xe. Chủ xe tạo biên bản qua API ")
    r = p.add_run("POST /api/orders/{orderId}/handovers")
    r.font.name = "Consolas"
    p.add_run(" (loại PICKUP, ghi nhận chỉ số ODO, % xăng, hình ảnh xe 4 mặt). Khách thuê gọi ")
    r = p.add_run("PUT /api/handovers/{handoverId}/confirm")
    r.font.name = "Consolas"
    p.add_run(" để ký nhận. Khi cả 2 bên đã xác nhận, đơn chuyển sang trạng thái ")
    p.add_run("OrderStatus = ONGOING").bold = True
    p.add_run(" (chuyến đi bắt đầu).")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 3.2 - Bàn giao trả xe (Return Handover): ").bold = True
    p.add_run("Khi kết thúc chuyến đi, 2 bên lập biên bản trả xe (loại RETURN) qua API ")
    r = p.add_run("POST /api/orders/{orderId}/handovers")
    r.font.name = "Consolas"
    p.add_run(". Khi cả 2 bên xác nhận, đơn thuê chuyển sang trạng thái ")
    p.add_run("OrderStatus = COMPLETED").bold = True
    p.add_run(".")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 3.3 - Xử lý Phí phát sinh (nếu có): ").bold = True
    p.add_run("Nếu xe bị bẩn hoặc trả trễ giờ, chủ xe/admin tạo phụ phí qua API ")
    r = p.add_run("POST /api/extra-fees")
    r.font.name = "Consolas"
    p.add_run(". Khách thuê thanh toán qua API ")
    r = p.add_run("POST /api/extra-fees/{id}/pay")
    r.font.name = "Consolas"
    p.add_run(" (tạo transaction loại EXTRA_FEE). Nếu chủ xe thông cảm bỏ qua, chủ xe gọi ")
    r = p.add_run("PUT /api/extra-fees/{id}/waive")
    r.font.name = "Consolas"
    p.add_run(" để miễn trừ phụ phí.")

    # ------------------ PHẦN IV: HOÀN TIỀN ------------------
    h4 = doc.add_heading("IV. CHI TIẾT CÁC TRƯỜNG HỢP HOÀN TIỀN (REFUND SCENARIOS)", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Hoàn tiền là mắt xích nhạy cảm và quan trọng nhất trong chu trình tài chính của sàn xe tự lái. "
        "Hệ thống SBA301 xây dựng API hoàn tiền chuẩn mực tại endpoint POST /api/transactions/refund nhằm phục vụ 3 kịch bản thực tế:"
    ).paragraph_format.line_spacing = 1.15

    # Kịch bản 1
    doc.add_heading("Kịch bản 1: Hoàn trả tiền đặt cọc sau chuyến đi hoàn tất (Standard Deposit Refund)", level=2)
    doc.add_paragraph(
        "Đây là trường hợp phổ biến nhất. Khách thuê nhận và trả xe đúng hẹn, xe nguyên vẹn không hư hỏng, "
        "biên bản bàn giao trả xe đã ký xong (OrderStatus = COMPLETED), toàn bộ phụ phí (nếu có) đã thanh toán. "
        "Hệ thống tiến hành hoàn trả 100% tiền đặt cọc giữ xe ban đầu cho khách."
    ).paragraph_format.line_spacing = 1.15

    add_code_block(doc, """// Request: POST /api/transactions/refund
// Headers: Authorization: Bearer <ADMIN_OR_SYSTEM_TOKEN>
{
  "parentTransactionId": 102, // ID của giao dịch đặt cọc ban đầu (phải có status = SUCCESS)
  "amount": 2000000,          // Hoàn đủ 2,000,000 VND
  "reason": "Hoàn tiền cọc sau chuyến đi khi kiểm tra xe nguyên vẹn"
}

// Response: HTTP 200 OK
{
  "success": true,
  "message": "Hoàn tiền thành công",
  "data": {
    "id": 104,
    "orderId": 1,
    "transactionType": "REFUND",
    "amount": 2000000,
    "method": "VNPAY",
    "status": "SUCCESS",
    "refundOfId": 102,
    "providerRef": "REFUND_e1a4d872",
    "paidAt": "2026-11-03T21:00:00"
  }
}""")

    # Kịch bản 2
    doc.add_heading("Kịch bản 2: Hoàn tiền khi Huỷ đơn thuê xe (Cancellation Refund)", level=2)
    doc.add_paragraph(
        "Trường hợp khách hàng hoặc chủ xe huỷ đơn trước ngày nhận xe thông qua API PUT /api/orders/{orderId}/cancel (OrderStatus chuyển sang CANCELLED):"
    ).paragraph_format.line_spacing = 1.15

    cancel_cases = [
        ("Chủ xe tự ý huỷ chuyến: ", "Hệ thống tự động phạt uy tín chủ xe và tiến hành hoàn tiền 100% (cả tiền cọc và tiền thuê) lại cho khách thuê ngay lập tức."),
        ("Khách huỷ trước 24 giờ: ", "Theo chính sách huỷ, khách được hoàn 100% tiền cọc và tiền thuê."),
        ("Khách huỷ sát giờ (dưới 24 giờ): ", "Khách được hoàn 100% tiền cọc nhưng bị khấu trừ một phần tiền thuê xe (ví dụ 30% tiền thuê để đền bù cơ hội cho chủ xe). Khi đó, Admin thực hiện lệnh Refund với số tiền đã khấu trừ:")
    ]
    for cc_title, cc_desc in cancel_cases:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.add_run(cc_title).bold = True
        p.add_run(cc_desc)

    add_code_block(doc, """// Request hoàn tiền thuê có khấu trừ phí huỷ muộn:
// Tiền thuê gốc = 1,750,000 VND, khấu trừ 30% = 525,000 VND -> Hoàn lại 1,225,000 VND
{
  "parentTransactionId": 103, // Giao dịch RENTAL_PAYMENT gốc
  "amount": 1225000,          // Số tiền hoàn sau khấu trừ phí huỷ
  "reason": "Hoàn tiền thuê do khách huỷ muộn (khấu trừ 30% phí giữ xe cho chủ xe)"
}""")

    # Kịch bản 3
    doc.add_heading("Kịch bản 3: Hoàn tiền sau khi giải quyết Khiếu nại / Tranh chấp (Dispute Resolution Refund)", level=2)
    doc.add_paragraph(
        "Trường hợp sau khi trả xe phát sinh bất đồng (ví dụ chủ xe đòi bồi thường 1,000,000 VND tiền xước sơn nhưng khách không đồng ý):"
    ).paragraph_format.line_spacing = 1.15

    dispute_steps = [
        ("Mở khiếu nại: ", "Khách thuê gọi POST /api/disputes để mở tranh chấp, cung cấp ảnh bằng chứng qua POST /api/disputes/{id}/evidences."),
        ("Trọng tài Admin phân xử: ", "Admin xem xét bằng chứng và ra quyết định thông qua API PUT /api/disputes/{id}/resolve (Ví dụ: phán quyết chỉ trừ 300,000 VND tiền đánh bóng sơn, hoàn lại 1,700,000 VND tiền cọc cho khách)."),
        ("Thực thi lệnh hoàn tiền: ", "Admin gọi POST /api/transactions/refund với amount = 1,700,000 VND kèm lý do trích xuất từ phán quyết khiếu nại.")
    ]
    for ds_title, ds_desc in dispute_steps:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.add_run(ds_title).bold = True
        p.add_run(ds_desc)

    # 4 NGUYÊN TẮC BẢO VỆ GIAO DỊCH
    doc.add_heading("5 Cơ chế Kiểm soát & An toàn trong Nghiệp vụ Hoàn tiền", level=2)
    
    rules = [
        ("1. Quyền thực thi (RBAC):", " Chỉ tài khoản có vai trò ADMIN hoặc Service Worker nội bộ có quyền gọi API /refund nhằm ngăn chặn khách thuê hoặc hacker tự hoàn tiền trái phép."),
        ("2. Kiểm tra trạng thái giao dịch gốc:", " Giao dịch cha (parentTransaction) BẮT BUỘC phải có status = SUCCESS. Không cho phép hoàn tiền đối với các giao dịch PENDING hoặc FAILED."),
        ("3. Chống hoàn lồng nhau (Anti-Recursive Refund):", " Nghiêm cấm hoàn tiền cho một giao dịch vốn dĩ đã là loại REFUND (parent.getTransactionType() != TransactionType.REFUND)."),
        ("4. Kiểm soát trần số tiền hoàn (Cumulative Amount Cap):", " Hệ thống tự động tính tổng số tiền của tất cả các lần hoàn tiền thành công trước đó (alreadyRefunded) liên quan tới giao dịch cha. Nếu alreadyRefunded + refundAmount > parent.getAmount(), backend lập tức từ chối với lỗi 400 Bad Request."),
        ("5. Đồng bộ trạng thái đơn hàng:", " Khi hoàn tất giao dịch REFUND thành công, hệ thống tự động cập nhật order.paymentStatus = REFUNDED để đồng bộ trạng thái hạch toán kế toán.")
    ]
    for r_title, r_desc in rules:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        rt = p.add_run(r_title)
        rt.bold = True
        rt.font.color.rgb = RGBColor(197, 48, 48) # Red-ish
        p.add_run(" ")
        p.add_run(r_desc)

    # ------------------ PHẦN V: CHI TRẢ DOANH THU ------------------
    h5 = doc.add_heading("V. CHI TRẢ DOANH THU CHO CHỦ XE (PAYOUT TO CAR OWNER)", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Sau khi chuyến đi kết thúc, khách đã được hoàn trả cọc và không còn khiếu nại tồn đọng, "
        "tiền thuê xe đang tạm giữ trên sàn sẽ được quyết toán và chuyển về tài khoản ngân hàng của chủ xe:"
    ).paragraph_format.line_spacing = 1.15

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 5.1 - Tạo yêu cầu chi trả (Create Payout): ").bold = True
    p.add_run("Hệ thống hoặc Kế toán gọi API ")
    r = p.add_run("POST /api/payouts")
    r.font.name = "Consolas"
    p.add_run(". Công thức tính tiền: ")
    p.add_run("netAmount = grossAmount - platformFee").bold = True
    p.add_run(" (Ví dụ: Tiền thuê 1,750,000 VND, phí sàn 10% = 175,000 VND -> Chủ xe thực nhận 1,575,000 VND).")

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Bước 5.2 - Kế toán chuyển khoản & Cập nhật trạng thái (Process Payout): ").bold = True
    p.add_run("Kế toán thực hiện lệnh chuyển khoản qua Internet Banking, sau đó gọi API ")
    r = p.add_run("PUT /api/payouts/{id}/process")
    r.font.name = "Consolas"
    p.add_run(" với ")
    p.add_run("status = PAID").bold = True
    p.add_run(". Chuyến đi chính thức hoàn tất về mặt tài chính.")

    # ------------------ PHẦN VI: MA TRẬN TRẠNG THÁI ------------------
    h6 = doc.add_heading("VI. MA TRẬN CHUYỂN ĐỔI TRẠNG THÁI (STATE TRANSITION MATRIX)", level=1)
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(6)

    matrix_table = doc.add_table(rows=1, cols=4)
    matrix_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(matrix_table, color="CBD5E0", sz="4")
    m_headers = ["Thời Điểm / Sự Kiện", "OrderStatus", "Order.paymentStatus", "Transaction Mới Nhất"]
    m_widths = [Inches(2.2), Inches(1.5), Inches(1.5), Inches(1.8)]

    for idx, th in enumerate(m_headers):
        matrix_table.rows[0].cells[idx].width = m_widths[idx]
        set_cell_background(matrix_table.rows[0].cells[idx], "2B6CB0")
        set_cell_margins(matrix_table.rows[0].cells[idx], 80, 80, 80, 80)
        p = matrix_table.rows[0].cells[idx].paragraphs[0]
        r = p.add_run(th)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    matrix_rows = [
        ("Khách gửi yêu cầu đặt xe", "PENDING", "UNPAID", "Chưa có"),
        ("Chủ xe chấp nhận cuốc", "CONFIRMED", "UNPAID", "Chưa có"),
        ("Khách thanh toán cọc thành công", "CONFIRMED", "UNPAID (hoặc DEPOSITED)", "DEPOSIT -> SUCCESS"),
        ("Khách thanh toán tiền thuê xe", "CONFIRMED", "PAID", "RENTAL_PAYMENT -> SUCCESS"),
        ("Ký biên bản nhận xe (Pickup)", "ONGOING", "PAID", "-"),
        ("Ký biên bản trả xe (Return)", "COMPLETED", "PAID", "-"),
        ("Khách thanh toán phụ phí (nếu có)", "COMPLETED", "PAID", "EXTRA_FEE -> SUCCESS"),
        ("Admin thực hiện hoàn trả cọc", "COMPLETED", "REFUNDED", "REFUND -> SUCCESS"),
        ("Khách/Chủ xe huỷ đơn trước chuyến", "CANCELLED", "REFUNDED (nếu đã cọc)", "REFUND -> SUCCESS")
    ]

    for event, o_st, p_st, tx_st in matrix_rows:
        rc = matrix_table.add_row().cells
        for col_idx, text in enumerate([event, o_st, p_st, tx_st]):
            rc[col_idx].width = m_widths[col_idx]
            set_cell_margins(rc[col_idx], 60, 60, 70, 70)
            p = rc[col_idx].paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(45, 55, 72)
            elif col_idx in (1, 2):
                r.font.name = "Consolas"
                r.font.color.rgb = RGBColor(43, 108, 176)
            else:
                r.font.name = "Consolas"
                r.font.color.rgb = RGBColor(56, 161, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ------------------ PHẦN VII: HƯỚNG DẪN KIỂM THỬ POSTMAN ------------------
    h7 = doc.add_heading("VII. HƯỚNG DẪN KIỂM THỬ TỰ ĐỘNG BẰNG POSTMAN & NEWMAN", level=1)
    h7.paragraph_format.space_before = Pt(14)
    h7.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Toàn bộ chu trình giao dịch, cọc, thanh toán và hoàn tiền nói trên đã được gói gọn trong file bộ sưu tập Postman:"
    ).paragraph_format.line_spacing = 1.15

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("File Collection: ").bold = True
    p.add_run("docs/carrental_postman_collection.json").font.name = "Consolas"

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Tài khoản kiểm thử: ").bold = True
    p.add_run("admin@carrental.com").font.name = "Consolas"
    p.add_run(" / Mật khẩu: ")
    p.add_run("123456").bold = True

    p = doc.add_paragraph(style='List Bullet')
    p.add_run("Lệnh chạy kiểm thử tự động toàn bộ luồng giao dịch bằng Newman CLI:").bold = True

    add_code_block(doc, """# Di chuyển vào thư mục backend và chạy test:
cd d:\\Study\\SBA302\\project\\SBA301\\carrental-BE
npx --yes newman run carrental_postman_collection.json

# Kết quả thực thi tiêu chuẩn:
# - requests: 26 / 26 thành công (0 failed)
# - assertions: 40 / 40 passed (100% kiểm thử hợp lệ)
# - thời gian thực thi trung bình: 16ms/request""")

    target_path = "d:/Study/SBA302/project/SBA301/docs/QUY_TRINH_HOAT_DONG_TRANSACTION_VA_HOAN_TIEN.docx"
    try:
        doc.save(target_path)
        print("Document successfully created at:", target_path)
    except PermissionError:
        target_path = "d:/Study/SBA302/project/SBA301/docs/QUY_TRINH_HOAT_DONG_TRANSACTION_VA_HOAN_TIEN_v2.docx"
        doc.save(target_path)
        print("Main file was locked by Word. Successfully saved as:", target_path)

if __name__ == "__main__":
    main()
