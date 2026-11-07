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

Trang chủ, `/page-2` và 190 trang storefront dùng chung vùng nơ–ảnh biển–footer. Thanh trắng chỉ thay header điều hướng khi nơ chạm mép header; việc ảnh vừa xuất hiện ở cuối màn hình không làm header biến mất. Checkout và công cụ sửa ảnh giữ bố cục riêng.

Ảnh cuối trang dùng ảnh lá mùa thu trong khung ngang 16:9, căn giữa để loại mốc ngày ở góc dưới; không có chữ hay nút đè lên ảnh. About us không chèn ảnh trước footer. Thanh trắng có nơ cao bằng 75% header điều hướng (64,5px trên desktop / 48px trên điện thoại); footer cách ảnh 1px. Trên mobile, footer có đủ chiều cao để ảnh cuộn hẳn khỏi màn hình. Header điều hướng dùng lại logic gốc của theme; script nơ chỉ điều khiển vùng nơ–footer. Thanh nơ nằm dưới lớp giỏ hàng, tìm kiếm và menu. Nơ dùng CSS sticky qua ảnh và footer, dùng kích thước tăng 12% so với gốc: clamp(98.56px, 8.4vw, 156.8px), giữ đúng tỷ lệ ảnh và không thu nhỏ khi cuộn; mobile dùng nơ 88px. Với màn hình rộng từ 1440px, ảnh cuối trang cao tối đa 640px hoặc 75svh.

Banner ren hồng gốc nằm giữa New Arrivals và Make it yours. New Arrivals đưa đủ 37 ảnh sản phẩm khác nhau vào carousel để thử hiệu ứng. `/data/preview-media.json` cung cấp ảnh minh họa cho thẻ thiếu ảnh hoặc trùng ảnh trong cùng danh sách; thẻ này có nhãn **Ảnh minh họa**. Ảnh hover dùng ảnh khác trong kho để thử chuyển cảnh. JSON catalog, tên, giá và tồn kho không thay đổi; ảnh minh họa không phải ảnh xác thực của sản phẩm thiếu ảnh.

- `dist/index.html`: trang chủ.
- `dist/custom.css`: CSS tùy chỉnh, được nạp sau CSS gốc trên mọi trang.
- `dist/footer-reveal.css`, `dist/footer-reveal.js`: khung ảnh biển responsive, nơ ghim header và footer trượt lên trên ảnh. Ảnh gốc ở `dist/assets/custom/girlhood-seaside.jpg`.
- `scripts/apply_autumn_images.py`: dùng sáu ảnh mùa thu, các khung marketing và liên kết bộ sưu tập trong trang chủ.
- `dist/page-2/index.html`, `dist/bow-comparison.css`, `dist/bow-comparison.js`: bản đã chọn, nơ ghim trên thanh trắng riêng.
- `scripts/build_bow_comparison.py`: tạo lại bản đã chọn cho trang chủ và alias `/page-2`.
- `scripts/apply_visual_fixes.py`: khôi phục banner ren và dựng carousel từ các ảnh sản phẩm có sẵn; chạy sau `build_bow_comparison.py`.
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
python scripts/apply_visual_fixes.py
```

`mirror.py` ưu tiên bộ nhớ đệm trong `source/`; để lấy HTML/CSS/JS mới, di chuyển bản cache tương ứng ra khỏi `source/` trước khi chạy. Danh sách sitemap ban đầu nằm tại `source/sitemap-urls.json`.

## Website công khai và chỉnh sửa từ điện thoại

GitHub Pages: **https://zney295.github.io/demo-DesignWeb/**. Workflow `.github/workflows/pages.yml` tự xuất bản khi push vào `main`. `scripts/build_pages.py` tạo `_site/` từ `dist/`, điều chỉnh đường dẫn cho project Pages và giữ nguyên các file dùng khi chạy Python cục bộ.

Pages phục vụ bản frontend tĩnh. Service worker trong `scripts/pages/` cung cấp catalog, tìm kiếm và giỏ hàng demo; giỏ được lưu riêng trong trình duyệt và không tạo đơn hàng thật. Đăng nhập, gửi biểu mẫu và thanh toán chưa có backend. Công cụ upload ảnh `/__editor/` chỉ dùng trên server Python cục bộ, không được xuất bản trên Pages.

Kiểm tra bản xuất trước khi push:

```sh
python scripts/build_pages.py --base-path /demo-DesignWeb
node --test scripts/pages/pages.test.cjs
```

Trên điện thoại, đăng nhập cùng tài khoản ChatGPT, chọn **Codex → Cloud → demo-DesignWeb**, yêu cầu sửa code rồi commit/push vào `main`. Workflow Pages sẽ kiểm tra và triển khai bản mới; có thể theo dõi trong tab **Actions** của repo. Repo public cho phép mọi người đọc; quyền ghi vẫn thuộc tài khoản và kết nối GitHub được cấp quyền.
