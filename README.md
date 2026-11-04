# Mandy Crimson — frontend cục bộ

Bản chụp giao diện công khai từ https://mandy-crimson.myharavan.com/, tải ngày 03/11/2026. Giữ HTML, CSS, JavaScript, ảnh và font của storefront để chỉnh sửa trực tiếp trên máy. Không cần npm install.

## Chạy

Nhấp đúp **start.cmd**, hoặc mở terminal tại thư mục này và chạy:

```powershell
python server.py
```

Cũng có thể chạy `npm start`. Mở **http://127.0.0.1:4173**. Dừng bằng Ctrl+C. Nếu cổng bị chiếm, chạy `python server.py --port 4174` rồi mở cổng tương ứng. Không mở HTML bằng `file://` vì giao diện dùng đường dẫn tuyệt đối và AJAX.

## Chỉnh sửa

Đã áp dụng feedback Canva 6 trang: xem `feedback/CHECKLIST.md`. Thay ảnh dấu cộng tại **http://127.0.0.1:4173/__editor/**. Giao diện checkout thử ở `/checkout`, trang Coming soon ở `/pages/coming-soon`. Các sửa đổi dùng `custom.css` và `custom.js`.

So sánh nơ: **http://127.0.0.1:4173/** giữ bản hiện tại; **http://127.0.0.1:4173/page-2** là bản thử nơ đính vào top bar. Trang 2 dùng ảnh biển riêng có đủ tỷ lệ gốc; khi nơ tới header, cùng node nơ được gắn vào header và giữ tới footer. Dùng các nút so sánh ở góc dưới để đổi bản hoặc tới footer. Thay đổi này đang giới hạn ở trang thử, chưa áp đại trà cách ghim mới.

Nhấn lại nút của bản đang xem để quay về ảnh. Khi đổi sang bản còn lại lúc đang xem footer, vị trí so sánh vẫn ở footer.

Ảnh trang 2 nằm trong section riêng, độc lập với footer, giữ đúng tỷ lệ gốc và cuộn theo trang. Footer có đủ chiều cao để cuộn hết ảnh khỏi vùng nhìn; chỉ nơ tiếp tục gắn vào header. CSS/JS nền cũ không được tải ở trang 2.

- `dist/index.html`: trang chủ.
- `dist/custom.css`: CSS tùy chỉnh, được nạp sau CSS gốc trên mọi trang.
- `dist/footer-reveal.css`, `dist/footer-reveal.js`: khung ảnh biển responsive, nơ ghim header và footer trượt lên trên ảnh. Ảnh gốc ở `dist/assets/custom/girlhood-seaside.jpg`.
- `scripts/apply_autumn_images.py`: dùng sáu ảnh mùa thu, các khung marketing và liên kết bộ sưu tập trong trang chủ.
- `dist/page-2/index.html`, `dist/bow-comparison.css`, `dist/bow-comparison.js`: bản thử nơ gắn header và nút chuyển hai bản.
- `scripts/build_bow_comparison.py`: tạo lại trang 2 từ trang chủ và giữ nguyên bản 1 để đối chiếu.
- `dist/assets/cdn.hstatic.net/themes/200001179192/1001519910/14/`: mã frontend gốc; `main.scss.css`, `general.scss.css`, `main.js`, `general.js`, `pages.scss.css` và thư viện. Các file `.scss.css` là CSS đã biên dịch, chỉnh sửa như CSS thông thường.
- `dist/products/<handle>/index.html`: giao diện từng sản phẩm.
- `dist/collections/<handle>/index.html`: giao diện từng bộ sưu tập.
- `dist/pages/<handle>/index.html`: các trang nội dung.
- `dist/blogs/`: blog và bài viết công khai.
- `dist/assets/`: ảnh, font, thư viện CSS/JS đã tải về, sắp theo tên miền và đường dẫn gốc.
- `dist/data/products.json`: dữ liệu sản phẩm/biến thể dùng cho tìm kiếm, danh mục và giỏ hàng thử.
- `dist/data/collection-*.json`: dữ liệu xác định sản phẩm trong từng bộ sưu tập.
- `source/`: bản HTML/CSS/JS/JSON gốc để đối chiếu.
- `mirror-report.json`: danh sách trang, tài nguyên và URL không tải được.

Sửa HTML/CSS/JS trong `dist/`, lưu rồi tải lại trình duyệt. Sau khi sửa JSON trong `dist/data/`, khởi động lại server để đọc dữ liệu mới. Header/footer nằm trong từng trang HTML đã được Haravan render; muốn đổi đồng loạt cần sửa các trang tương ứng. Dữ liệu sản phẩm xuất hiện cả trong HTML từng trang và JSON danh mục; khi đổi nội dung/giá cần cập nhật cả hai vị trí.

## Phạm vi

Đã thu thập các trang trong sitemap và các liên kết nội bộ tìm thấy. Bộ sưu tập rỗng trên nguồn được giữ nguyên. Các vùng ảnh marketing đã thay bằng ảnh người dùng gửi; dữ liệu sản phẩm từ nguồn được giữ nguyên.

Kết quả tải: **192 trang HTML, 247 URL tài nguyên và 150 sản phẩm có dữ liệu chi tiết**. Sitemap sản phẩm có thêm URL trang chủ nên số mục sitemap không phải số sản phẩm. Hai URL đã trả 404 ngay trên website nguồn: `/pages/coming-soon` và ảnh `share_fb_home.png`. Chi tiết nằm trong `mirror-report.json`.

Server chỉ lắng nghe localhost và phục vụ dữ liệu đã lưu. Nó cung cấp adapter cục bộ cho API danh mục, tìm kiếm cơ bản, sản phẩm và giỏ hàng thử. Giỏ hàng tồn tại trong bộ nhớ theo cookie trình duyệt và được xóa khi tắt server. Một số bộ lọc phức tạp và chương trình khuyến mãi Haravan cần triển khai backend riêng. Script analytics và tác vụ tải CAPTCHA của nguồn được bỏ khỏi bản cục bộ.

Đăng nhập, đăng ký, gửi biểu mẫu, tài khoản khách hàng, tồn kho trực tiếp và thanh toán chưa được kết nối backend. Không có đơn hàng thật được tạo. Các liên kết ngoài như cửa hàng quốc tế và mạng xã hội vẫn dẫn ra website tương ứng.

Đây là mã frontend đã được máy chủ render, không phải bản export theme Haravan: không có mã Liquid gốc, schema cấu hình theme, SCSS nguồn, dữ liệu quản trị hay backend. Muốn chỉnh trong Haravan cần chủ cửa hàng xuất theme từ trang quản trị.

## Tải lại từ nguồn

Các script dùng thư viện chuẩn Python, yêu cầu mạng. **Chạy lại sẽ ghi đè các file đã chỉnh trong `dist/`; hãy sao lưu trước.**

```powershell
python scripts/capture_data.py
python scripts/mirror.py
python scripts/apply_feedback.py
python scripts/apply_autumn_images.py
python scripts/build_bow_comparison.py
```

`mirror.py` ưu tiên bộ nhớ đệm trong `source/`; để lấy HTML/CSS/JS mới, di chuyển bản cache tương ứng ra khỏi `source/` trước khi chạy. Danh sách sitemap ban đầu nằm tại `source/sitemap-urls.json`.
