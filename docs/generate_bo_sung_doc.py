import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def style_table(table, col_widths, header_bg="1E3A8A"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for j, cell in enumerate(row.cells):
            cell.width = col_widths[j]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
            
            if is_header:
                set_cell_background(cell, header_bg)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        run.font.size = Pt(10)
                        run.font.name = "Segoe UI"
            else:
                bg = "F8FAFC" if i % 2 == 1 else "FFFFFF"
                set_cell_background(cell, bg)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(9.5)
                        run.font.name = "Segoe UI"
                        run.font.color.rgb = RGBColor(51, 65, 85)

def build_docx():
    doc = Document()
    
    # Page setup - A4, normal margins
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("TÀI LIỆU BỔ SUNG & ĐỒNG BỘ NGHIỆP VỤ")
    run_title.font.name = "Segoe UI"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(16)
    run_sub = sub_p.add_run("Phân tích sự khác biệt luồng Đặt cọc (Deposit) & Thanh toán (Payment) giữa Frontend và Backend")
    run_sub.font.name = "Segoe UI"
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.name = "Segoe UI"
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Segoe UI"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 118, 110) # Teal
        return p

    def add_body(text, bold_prefix=None, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Segoe UI"
            r_bold.font.size = Pt(10)
            r_bold.font.bold = True
            r_bold.font.color.rgb = RGBColor(30, 41, 59)
        r = p.add_run(text)
        r.font.name = "Segoe UI"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Segoe UI"
            r_bold.font.size = Pt(10)
            r_bold.font.bold = True
            r_bold.font.color.rgb = RGBColor(30, 41, 59)
        r = p.add_run(text)
        r.font.name = "Segoe UI"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # Section 1
    add_h1("1. Bối cảnh & Hiện trạng phát hiện")
    add_body("Khi rà soát đối chiếu toàn diện giữa mã nguồn Frontend (carrental-FE) và Backend (carrental-BE), nhóm phát hiện sự khác biệt trong việc xử lý luồng Đặt cọc (Deposit) và Thanh toán tiền thuê (Payment):")
    
    add_h2("1.1. Phía Frontend (carrental-FE)")
    add_bullet(" Chỉ gọi duy nhất API thanh toán tiền thuê createPayment (POST /api/transactions/payment) với số tiền totalAmount.", "Màn hình thanh toán trực tiếp (PaymentLive.jsx):")
    add_bullet(" Dòng tiền cọc được hiển thị với nhãn rõ ràng: 'Tiền cọc (thu khi nhận xe)'.", "Màn hình đặt xe (Checkout.jsx):")
    add_bullet(" Hiển thị ô tổng kết cọc với ghi chú nghiệp vụ: 'Cọc chủ xe đang giữ: Thu khi ký C10-A, không qua escrow'.", "Màn hình quản lý chuyến chủ xe (OwnerTrips.jsx):")
    add_bullet(" Đã viết sẵn hàm createDeposit gọi tới POST /api/transactions/deposit, tuy nhiên trên toàn bộ giao diện người dùng chưa có nút bấm nào kích hoạt hàm này.", "Tầng Service Frontend (customer-extra.service.js):")

    add_h2("1.2. Phía Backend (carrental-BE)")
    add_bullet(" Tạo giao dịch đặt cọc giữ xe (TransactionType.DEPOSIT) theo số tiền order.getDepositAmount().", "POST /api/transactions/deposit:")
    add_bullet(" Tạo giao dịch thanh toán tiền thuê (TransactionType.RENTAL_PAYMENT) theo số tiền order.getTotalAmount(). Khi thanh toán thành công qua VNPay, hệ thống tự động đổi order.paymentStatus = PAID.", "POST /api/transactions/payment:")

    # Section 2
    add_h1("2. Nguyên nhân & Bản chất nghiệp vụ")
    add_body("Sự khác biệt này xuất phát từ 2 mô hình vận hành đặt cọc thực tế trong lĩnh vực cho thuê xe tự lái tại Việt Nam:")

    # Table 1: Model comparison
    t1 = doc.add_table(rows=3, cols=3)
    t1.rows[0].cells[0].paragraphs[0].text = "Mô hình"
    t1.rows[0].cells[1].paragraphs[0].text = "Cách thức thực hiện"
    t1.rows[0].cells[2].paragraphs[0].text = "Ưu / Nhược điểm"

    t1.rows[1].cells[0].paragraphs[0].text = "Mô hình A: Thu cọc Offline khi giao xe\n(Frontend đang áp dụng)"
    t1.rows[1].cells[1].paragraphs[0].text = "Khách chỉ thanh toán online tiền thuê xe (totalAmount) qua VNPay.\nTiền cọc xe (depositAmount, từ 5 - 20 triệu VNĐ hoặc xe máy + cavet gốc) được chủ xe thu trực tiếp bằng tiền mặt hoặc chuyển khoản riêng khi 2 bên gặp nhau ký biên bản bàn giao xe (C10-A)."
    t1.rows[1].cells[2].paragraphs[0].text = "• Ưu điểm: Khách không bị giam khoản tiền lớn trên nền tảng; dễ linh hoạt đặt cọc bằng tài sản thế chấp (xe máy).\n• Nhược điểm: Sàn không kiểm soát trực tiếp rủi ro cọc."

    t1.rows[2].cells[0].paragraphs[0].text = "Mô hình B: Ký quỹ Online (Escrow Deposit)\n(Backend đã sẵn sàng)"
    t1.rows[2].cells[1].paragraphs[0].text = "Khách thanh toán tiền cọc online qua VNPay ngay sau khi đơn được duyệt (CONFIRMED). Nền tảng trung gian giữ tiền cọc. Khi kết thúc chuyến xe không có sự cố, hệ thống tự động tạo lệnh REFUND hoàn tiền cọc vào tài khoản khách."
    t1.rows[2].cells[2].paragraphs[0].text = "• Ưu điểm: Bảo vệ tối đa quyền lợi 2 bên, tự động hóa và minh bạch 100% trên hệ thống.\n• Nhược điểm: Khách phải nộp khoản tiền lớn qua cổng thanh toán điện tử."

    style_table(t1, [Inches(1.8), Inches(2.6), Inches(2.2)])

    # Section 3
    add_h1("3. Đánh giá & Hướng xử lý đề xuất")
    add_h2("3.1. Đối với Backend")
    add_bullet(" Đáp ứng 100% tài liệu đặc tả yêu cầu Function 4 (SRS: Quản lý giao dịch, cọc, thanh toán và hoàn tiền).", "Giữ nguyên API POST /api/transactions/deposit:")
    add_bullet(" Đáp ứng bài kiểm thử tự động (Unit Test / Integration Test / Postman Test).", "Sẵn sàng kiểm thử:")
    add_bullet(" Luôn sẵn sàng khi Frontend bật tính năng đặt cọc online mà không cần chỉnh sửa lại core backend.", "Khả năng mở rộng:")

    add_h2("3.2. Đối với Frontend")
    add_bullet(" Giữ nguyên luồng hiện tại của Frontend. Trong báo cáo đồ án hoặc khi thuyết minh trước hội đồng, giải thích rõ: 'Để tối ưu trải nghiệm người dùng thực tế và tránh việc khách phải thanh toán trước khoản tiền cọc lớn qua mạng, ứng dụng quy định tiền cọc được bàn giao trực tiếp cho chủ xe khi nhận xe và ký biên bản C10-A (như hiển thị tại Checkout và OwnerTrips). API deposit của Backend được xây dựng hoàn chỉnh để dự phòng cho mô hình mở rộng ký quỹ sàn (Escrow) trong tương lai.'", "Kịch bản 1 (Khuyên dùng khi báo cáo):")
    add_bullet(" Nếu muốn demo đầy đủ cả 2 API trên UI, chỉ cần bổ sung nút 'Đặt cọc giữ xe' gọi hàm transactionService.createDeposit tại trang chi tiết đơn hàng khi đơn ở trạng thái CONFIRMED.", "Kịch bản 2 (Bổ sung nút trên UI):")

    # Section 4
    add_h1("4. Bảng tổng hợp đối chiếu chức năng Function 4 sau khi hoàn thiện")
    
    t2 = doc.add_table(rows=10, cols=4)
    headers = ["Chức năng", "Endpoint Backend", "Trạng thái tích hợp Frontend", "Phân quyền truy cập"]
    for idx, h in enumerate(headers):
        t2.rows[0].cells[idx].paragraphs[0].text = h

    matrix_data = [
        ("Thanh toán tiền thuê", "POST /api/transactions/payment", "Đã tích hợp đầy đủ trong PaymentLive.jsx", "Chỉ CUSTOMER (người thuê)"),
        ("Đặt cọc giữ xe", "POST /api/transactions/deposit", "Service đã có sẵn; UI hỗ trợ thu cọc offline lúc nhận xe", "Chỉ CUSTOMER (người thuê)"),
        ("Cổng thanh toán VNPay", "/api/payments/vnpay/return\n/api/payments/vnpay/ipn", "Tích hợp xác thực checksum bảo mật cao", "Công khai (Xác thực chữ ký)"),
        ("Tạo phí phát sinh", "POST /api/extra-fees", "Tích hợp khi kết thúc chuyến đi", "Chỉ CUSTOMER (chủ xe tạo phí)"),
        ("Thanh toán phí phát sinh", "POST /api/extra-fees/{id}/pay", "Hỗ trợ 2 phương thức: VNPay link & Tiền mặt (Cash)", "Người thuê trả, chủ xe xác nhận"),
        ("Khiếu nại (Dispute)", "POST /api/disputes", "Tích hợp form gửi bằng chứng & khiếu nại phí/đơn", "Chỉ CUSTOMER (khách thuê tạo)"),
        ("Giải quyết khiếu nại", "POST /api/disputes/{id}/resolve", "Giao diện Admin quản trị khiếu nại", "Chỉ ADMIN (Tự động hoàn tiền)"),
        ("Thanh toán chủ xe (Payout)", "POST /api/payouts", "Tích hợp duyệt yêu cầu rút tiền của chủ xe", "Chỉ ADMIN"),
        ("Đánh giá chuyến đi", "POST /api/reviews", "Tích hợp form chấm sao & bình luận sau chuyến đi", "Chỉ CUSTOMER (người thuê)"),
    ]

    for row_idx, data in enumerate(matrix_data, start=1):
        for col_idx, text in enumerate(data):
            t2.rows[row_idx].cells[col_idx].paragraphs[0].text = text

    style_table(t2, [Inches(1.5), Inches(1.8), Inches(1.8), Inches(1.5)])

    out_path = r"d:\Study\SBA302\project\SBA301\docs\BO_SUNG.docx"
    doc.save(out_path)
    print("Exported docx successfully to", out_path)

if __name__ == "__main__":
    build_docx()
