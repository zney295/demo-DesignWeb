# Feedback Canva — 03/11/2026

Nguồn: https://www.canva.com/design/DAHZkzi2pws/g2DFQVbHP1KJt2pZvI2Mwg/edit (6 trang). Bảng All comments không có bình luận; yêu cầu được đọc trực tiếp từ từng trang và ảnh minh họa.

| Trang | Yêu cầu | Xử lý |
|---|---|---|
| 1 | Dấu cộng nằm trong ảnh ở New Arrivals, dưới ảnh ở listing | Giữ vị trí overlay chỉ trong New Arrivals; listing giữ cùng hàng thông tin dưới ảnh. |
| 1 | Bấm + thêm giỏ nhanh, bấm ảnh mở chi tiết | Chuyển + thành button; thêm biến thể đầu tiên còn hàng, cập nhật giỏ thử, không chuyển trang. Nút hết hàng bị vô hiệu hóa. |
| 1 | Đổi ảnh nút theo màu chiến dịch, bỏ viền blur | SVG mặc định sắc nét, bỏ box-shadow; thêm trình tải ảnh PNG/JPG/WebP tại `/__editor/`, lưu cấu hình trên máy. |
| 1 | Thu gọn New Arrivals, phần bên phải nằm trong chiều cao ảnh chính | Rút khoảng cách chữ/nút, đồng bộ chiều cao cột phải theo ảnh chính, slider co trong phần còn lại. |
| 1 | Ô màu chữ nhật bo góc chỉ ở home, listing vuông | Hiển thị màu theo biến thể có thật trong catalog; home dùng ô 30×17 bo góc, listing dùng ô vuông. Màu hết hàng không chọn được; thêm giỏ theo màu đã chọn. |
| 2–3 | Nơ nằm trên phần trắng, khi lướt chồng lên ảnh; demo bằng ảnh trang 3 | Thay hoàn toàn nền cũ, không thêm banner trùng. Nơ trên khoảng trắng rồi ghim dưới top bar, ảnh ghim bằng sticky trong cảnh chung với footer; footer trượt lên che ảnh trong khi ảnh giữ nguyên tọa độ. Khung ảnh responsive để hạn chế phóng lớn ảnh ngang trên mobile. |
| 2 | Thanh màu listing không xuất hiện ở trang sản phẩm | Giới hạn CSS theo template collection, dọn thanh màu nếu không có collection-page. |
| 4 | Căn lại tên/giá/+ trên thẻ sản phẩm | Tên và giá xếp dọc bên trái, + canh giữa bên phải; khoảng cách gọn và nhất quán. |
| 4 | Logo header checkout và favicon chỉ là nơ, không chữ | Favicon đổi sang logo-bow; thêm giao diện checkout cục bộ với header chỉ có nơ. Không kết nối đặt hàng/thanh toán. |
| 5 | Chuyển Help tức thì, không tải lại trang | Bản nguồn đã có đủ panel trong HTML. Bổ sung điều hướng tab tức thì, giữ vị trí cuộn, hỗ trợ bàn phím và Back/Forward, không fetch khi chọn mục. |
| 6 | Bỏ thống kê 5,000+/60/5/88% trên About us | Phần thống kê đã vắng trong bản nguồn hiện tại; bộ áp dụng feedback tiếp tục loại section-counter nếu xuất hiện. |
| 6 | Laundry + Sustainability Journey dẫn trang trắng Coming soon | Tạo `/pages/coming-soon` có Coming soon, hai mục menu cùng dẫn đến đó. |
| 6 | Bỏ Facebook ở footer | Footer bản nguồn đã chỉ có TikTok/Instagram; kiểm tra và giữ nguyên, bộ áp dụng loại Facebook nếu xuất hiện. |

## Phạm vi vận hành

Các thay đổi nằm trong bản sao cục bộ; không sửa website Haravan đang hoạt động. Checkout là giao diện xem trước với giỏ hàng thử, chưa có đăng nhập/tồn kho/đặt hàng/thanh toán thật. Browser tab title do trình duyệt quản lý; favicon là nơ, tiêu đề tài liệu vẫn có nhãn để nhận biết trang.

## File chỉnh sửa

- `dist/custom.css`, `dist/custom.js`: giao diện và hành vi storefront.
- `dist/__editor/index.html`, `local-settings.json`: trình thay ảnh dấu cộng và cấu hình được tạo khi lưu.
- `dist/checkout/`: giao diện checkout cục bộ.
- `dist/assets/custom/`: nút dấu cộng, ảnh chiến dịch và ảnh nền Girlhood.
- `scripts/apply_feedback.py`: áp lại các thay đổi markup nếu chạy lại mirror.
- `server.py`: phục vụ checkout và lưu ảnh nút cục bộ.
- `dist/footer-reveal.css`, `dist/footer-reveal.js`: ảnh nền cố định và nơ ghim top bar dùng chung.
- `scripts/apply_autumn_images.py`, `feedback/autumn-images.json`: 6 ảnh người dùng gửi và vị trí sử dụng.

## Kiểm tra hoàn tất

- Python và JavaScript qua kiểm tra cú pháp.
- HTTP 200 cho các trang chính, Coming soon, checkout, editor, script và ảnh demo.
- Trình duyệt: dấu + ở home thêm Sailor hat vào giỏ mà URL vẫn ở trang chủ; nút trên listing thêm sản phẩm màu Xanh / size S. Màu Cam/Vàng hết hàng bị khóa. Giá giữ đúng sau khi chọn màu.
- Desktop 1280×900: hai cột New Arrivals cùng chiều cao, 9 nút + đều nằm trong ảnh, slider có kích thước slide hợp lệ.
- Mobile 390×844: không tràn ngang; nút + listing ở dưới ảnh; swatch listing vuông, swatch home 30×17 bo góc.
- Hiệu ứng cuối trang đã kiểm tra lại sau góp ý: nền có top=0 trước/sau cuộn; nơ top=86 bằng đúng bottom=86 của top bar trên desktop. Footer di chuyển từ y=646 xuống y=430 khi cuộn, nền và nơ không đổi vị trí. Không còn `.section-bannerfull`/`.banner-thanks` bị trùng. Cùng một module xuất hiện trên 193 trang storefront, gồm checkout; editor nội bộ không có module này.
- Help chuyển Shipping ngay trong cùng tài liệu, Back trở lại FAQs; thêm thao tác bàn phím, cập nhật breadcrumb và tiêu đề.
- API editor lưu đúng bytes ảnh PNG và cấu hình, reset về SVG mặc định; từ chối payload ảnh không hợp lệ.
- Checkout mobile hiển thị nơ không chữ, trường giao hàng và tổng giỏ hàng thử chính xác.
- Ảnh đối chiếu trong `feedback/screenshots/`.

## Ảnh bổ sung từ người dùng

Đã dùng cả 6 JPG trong `Downloads/IgAutumn`: ba ảnh lá thu/công viên/hiệu sách cho slider; ảnh quần áo gấp cho New Arrivals; ảnh dây chuyền cho banner chi tiết; các ảnh quần áo/bếp/hiệu sách/công viên cho lookbook. About us dùng ảnh hiệu sách và bếp. Giữ ảnh sản phẩm thật trong catalog. Ảnh marketing dùng `src` thật ngay trong HTML; các ảnh sản phẩm tải trước viewport 800px để giảm khung trắng khi cuộn.

Kiểm tra ảnh bổ sung: cả 6 ảnh tải thành công trên desktop và mobile 390px; không tràn ngang, không có ảnh lỗi trong vùng New Arrivals đang hiển thị. Chạy lại script ảnh không làm thay đổi HTML. Ảnh đối chiếu mới: `autumn-home-desktop.jpg`, `autumn-home-mobile.jpg`, `autumn-new-arrivals.jpg`.

## Thay nền Girlhood theo ảnh mới

Đã thay ảnh tím/ánh nến bằng `dist/assets/custom/girlhood-seaside.jpg` trên module cuối trang dùng chung cho 193 trang storefront. File JPEG 1280×720 (136779 bytes) giống hệt file đính kèm, không resize hay nén lại. Mobile đặt điểm cắt ngang ở 35% để giữ nhân vật trong khung. Độ nét khi phóng lớn vẫn bị giới hạn bởi độ phân giải của file gốc.

Kiểm tra desktop: nền giữ top=0, nơ top=86 khớp bottom của header; footer di chuyển từ y=695 tới y=479 khi cuộn. Mobile 390×844: nơ top=64 khớp header, không tràn ngang. Ảnh đối chiếu: `girlhood-seaside-desktop.jpg`, `girlhood-seaside-footer.jpg`, `girlhood-seaside-mobile.jpg`.

## Rà thẩm mỹ và trải nghiệm tổng thể

- Khung ảnh biển desktop vừa chiều cao còn lại dưới header; mobile cao 120vw (468px ở viewport 390px), giảm so với 780px trước đây. Nhân vật và bối cảnh biển cùng xuất hiện rõ hơn. Giữ nguyên JPEG gốc, không dùng filter blur hay nén lại.
- Ảnh và footer nằm trong cùng cảnh sticky: desktop ảnh top=86 và nơ top=86 không đổi khi footer đi từ y=695 tới y=479. Mobile nơ top=64, khớp header; ảnh đi vào trang tự nhiên, không có vùng trắng do cắt lớp ảnh fixed.
- Banner dây chuyền desktop dùng tỷ lệ 16:7 để tránh chiếm gần 950px chiều cao; mobile giữ 4:3. Lookbook cân lại tỷ lệ ảnh và bỏ hover đổi sang ảnh dây chuyền trên ba card khác chủ đề; hỗ trợ nhìn thấy nút khi focus bằng bàn phím.
- Ảnh New Arrivals dẫn tới `/collections/hot-products`; banner tới `/collections/all`; ba card lookbook dẫn tới các danh mục có sản phẩm (`set`, `all`, `hot-products`). Không còn các link mẫu #1/#2 ở các card này.
- Rà trình duyệt: New Arrivals desktop hai cột cùng cao 575.385px, dấu cộng nằm trong ảnh; listing dấu cộng ở dưới ảnh. Thêm Sailor hat (mint) vào giỏ thử giữ nguyên URL listing, giỏ hiển thị 1 món/320.000₫. Help chuyển sang Shipping tức thì; trang sản phẩm không hiện colorbar listing. About us tải đủ hai ảnh và không có counter. Checkout mobile không tràn ngang và tổng giỏ đúng 320.000₫.
- Rà file trên 193 trang: mỗi trang có đúng một cảnh ảnh và một footer; toàn bộ 124 tham chiếu ảnh trong HTML có tài nguyên local hợp lệ (bao gồm biến thể kích thước được server hỗ trợ). Chi tiết `feedback/ui-audit.json`.

Lần chạy lại cuối: bộ `apply_feedback.py` + `apply_autumn_images.py` chạy hai lượt, 0 HTML thay đổi ở lượt thứ hai. Ảnh bàn giao hiện tại: `polished-footer-desktop.jpg`, `polished-footer-mobile.jpg`.

## Năm bình luận trên trình duyệt — lượt sửa tiếp theo

1. Nơ vắt qua mép ảnh: margin âm nửa chiều cao nơ; khi ghim, tâm nơ trùng top ảnh. Đo trên desktop: 39.375px = 39.375px; bản hẹp: sai lệch dưới 0.01px.
2. Khung ảnh cao bằng phần viewport còn lại dưới nơ, thay cho khung bị giới hạn bởi header. Header được ẩn khi đang xem ảnh theo chiều cuộn xuống.
3. Ảnh đặt tại `50% 65%` trên desktop, `35% 65%` trên mobile để nâng vị trí nhân vật; thêm khoảng giữ ảnh 45svh (giới hạn 220–480px) trước footer. Tại viewport cao 571px, ảnh từ y=39.375 tới y≈571, footer vẫn ngoài màn hình ở y≈693 trong giai đoạn giữ. Ảnh đứng yên khi footer tiếp tục đi lên.
4. Bỏ ép header hiện khi tới gần footer. Cuộn xuống tích lũy 32px để ẩn, cuộn lên 80px để hiện; khi mở menu/search/cart hoặc focus bàn phím thì ưu tiên hiện. Resize xóa tích lũy hướng cuộn để không bật header do thay đổi layout. Kiểm tra trình duyệt: cuộn xuống header ẩn, cuộn lên đủ khoảng header hiện lại.
5. Swatch New Arrivals tăng 30×17 → 36×22px, gap 8px, vùng chứa tối thiểu 32px. Đo DOM đúng 36×22px, hai cột vẫn cùng chiều cao; listing giữ ô vuông.

Các thay đổi áp dụng qua module chung trên 193 trang storefront; checkout cũng dùng logic header mới. Ảnh đối chiếu mới: `feedback-photo-hold-desktop.jpg`, `feedback-photo-hold-mobile.jpg`.

## Trang 2 — so sánh nơ hiện tại và nơ đính top bar

Theo yêu cầu tạo một trang thử để so sánh, giữ cách ghim đang dùng ở `/` làm bản 1 và tạo `/page-2` làm bản 2. Bản 2 áp dụng hai góp ý mới nhất: ảnh biển là `<img>` riêng theo tỷ lệ 1280×720, cuộn trong luồng trang; nơ từ giữa mép ảnh chuyển vào chính `.main-header--inner` khi tới header, tiếp tục hiện ở footer. Placeholder giữ chỗ nơ nên việc gắn/tháo không làm ảnh nhảy vị trí. Chưa thay cách ghim này trên các trang storefront khác.

Hai trang có nút đổi bản và “Xem footer”. Khi đang xem footer, nút đổi bản giữ điểm so sánh tại footer. Mỗi trang có đúng một nơ, một footer và một bộ nút. Script tạo lại hai trang không thay đổi HTML khi chạy lặp lại; `npm run refresh` đã bổ sung bước tạo trang 2.

Kiểm tra: cả hai URL và CSS/JS trả HTTP 200; JavaScript/Python qua kiểm tra cú pháp. Trình duyệt xác nhận bản 1 không chuyển nơ vào header; bản 2 có đúng một nơ trong header, top nơ khớp bottom header khoảng 86px, kể cả khi tới footer.

Cuộn ngược trở lại trước ảnh: nơ được trả về origin, tâm nơ và mép ảnh cùng ở y≈400.158px, vẫn chỉ có một nơ. Đổi bản ở footer giữ đúng anchor footer; nhấn bản đang chọn quay về ảnh. Bước refresh giữ nguyên HTML trang 2 và không làm lọt bộ nút so sánh vào Coming soon. Ảnh trước khi ghim: `bow-page-2-before-pin.jpg`.

Bản hẹp: không tràn ngang, ảnh tải đúng bản gốc 1280×720, nơ vẫn ở trong header và top nơ = bottom header ≈64px. Ảnh đối chiếu: `bow-page-2-footer-mobile.jpg`, `bow-page-2-before-pin.jpg`. Bản 1 đang được xem để đối chiếu: `bow-page-1-current.jpg`.

## Trang 2 — ảnh rời cuộn hết khỏi màn hình

Tách thành `.bow-photo-section` chứa `<img class="bow-comparison__photo">` với `position: static`, `width:100%`, `height:auto`; footer là section kế tiếp độc lập. Trang 2 không tải `footer-reveal.css`/`footer-reveal.js` và không còn node window/background/hold của hiệu ứng nền. Bộ asset so sánh có phiên bản `?v=3` để tải lại thay đổi.

Footer dùng chiều cao tối thiểu bằng viewport trừ header, giúp cuộn hết ảnh ở cửa sổ cao trong khi giữ bố cục footer. Kiểm tra ở viewport CSS 1143×803: ảnh hiển thị 1129.17×635.16 đúng tỷ lệ 16:9; khi tới footer, bottom ảnh ≈85.91px nằm sau header bottom ≈85.99px. Bản hẹp sau khi trả viewport: bottom ảnh ≈63.82px, header bottom ≈64px, nơ vẫn là con của header. Ảnh đối chiếu cuối: `page-2-photo-scrolled-out.jpg`.

## Trang 2 — thu gọn top bar và tối ưu chuyển động nơ

Thay cơ chế di chuyển node bằng một nơ sticky cố định trong wrapper chung của ảnh và footer. Ảnh vẫn là `<img>` độc lập cuộn bình thường. Nơ giữ tâm tại mép ảnh khi đi vào, sau đó thu gọn theo 96px cuộn cuối trước header, giữ ở mép bar qua footer. Kích thước khi ghim: 40px ở bản hẹp, 48px từ breakpoint desktop. Bỏ dải nền trắng thêm dưới header; chiều cao bar gốc giữ 64/86px. Khi nhảy nhanh qua điểm ghim, header không phải đợi transition hoàn tất.

Controller cache hình học khi resize/load/font thay đổi, không đo offset/getBoundingClientRect trong mỗi scroll frame; gom sự kiện vào một requestAnimationFrame, chỉ cập nhật transform của ảnh nơ khi scale thực sự đổi. Observer class chỉ quan tâm menu/search/cart, không tự tạo vòng RAF từ class của controller. Builder thêm guard cho `headerJS.scrollFixedHeader` của theme để tránh hai controller chạy đồng thời ở bản 2. Asset so sánh dùng `?v=4`.

Kiểm tra controller bằng Node VM với code thực: 100 sự kiện scroll gom thành một frame; nhảy nhanh qua điểm ghim và cuộn ngược cập nhật ngay frame kế tiếp; 100 scroll frame không phát sinh phép đo layout; class tự thay đổi không tạo frame lặp; resize cập nhật kích thước ghim đúng. Trình duyệt: trước/sau cuộn nhanh header đều 64px; nơ 88→40px; node vẫn ở `.bow-comparison__region`; không còn các class hSticky của controller theme. Ảnh vẫn cuộn hết khỏi vùng nhìn.

## Nơ không bị top bar hoặc footer che

Ở bản 1 và các trang dùng `footer-reveal`, nơ có lớp 60, cao hơn header 40 và footer 30. Tâm nơ và mép trên ảnh dùng chung một đường ghim theo chiều cao header. Header giữ hiện khi đi vào vùng ảnh/footer để tránh che nơ lúc xuất hiện lại; observer chỉ phản ứng khi menu/search/cart đổi trạng thái.

Trình duyệt xác nhận tâm nơ / mép ảnh / đáy header khớp khoảng 64px ở khung 496×510 và 86px ở khung 1143×510. Khi footer đã phủ qua mép ảnh (top footer khoảng -50px), nơ vẫn hiện đầy đủ. Ảnh kiểm tra: `bow-above-header-footer-mobile.jpg`, `bow-above-header-footer-desktop.jpg`. Kiểm tra cú pháp JS và bản xuất Pages cùng bài test catalog/search/cart đều qua.

## Chọn bản 2 — nơ ghim trên thanh trắng riêng

Trang chủ và `/page-2` cùng dùng bản 2; bỏ nút đổi bản. `.bow-comparison__bar` là lớp cố định riêng, nền `#fff`, không border/shadow, có chiều cao khớp vùng header. Khi nơ đi vào viewport, header điều hướng bị ẩn và inert; chiều cuộn không làm hiện lại menu/logo/icon trong toàn bộ vùng ảnh–footer. Trước vùng có nơ, header hoạt động bình thường.

Đã thử trên desktop và mobile: nền trắng tính toán `rgb(255, 255, 255)`; thanh cao khoảng 86px/64px; cuộn lên từ trạng thái ghim rồi cuộn xuống vẫn giữ header ẩn và thanh trắng hiện; không tràn ngang. Builder chạy lại không đổi kết quả; xuất Pages và kiểm tra catalog/search/cart đều qua.
