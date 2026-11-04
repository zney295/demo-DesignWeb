(() => {
  const money = n => (n / 100).toLocaleString('vi-VN') + '₫';
  fetch('/cart.js').then(r => r.json()).then(cart => {
    const host = document.querySelector('#items');
    if (!cart.items.length) host.textContent = 'Giỏ hàng của bạn đang trống.';
    cart.items.forEach(item => {
      const row = document.createElement('div'); row.className = 'item';
      const img = document.createElement('img'); img.src = item.image; img.alt = item.product_title;
      const name = document.createElement('div'); name.className = 'name'; name.textContent = item.product_title;
      const detail = document.createElement('small'); detail.textContent = item.variant_title + ' · Số lượng: ' + item.quantity; name.append(detail);
      const price = document.createElement('strong'); price.textContent = money(item.line_price);
      row.append(img, name, price); host.append(row);
    });
    document.querySelector('#subtotal').textContent = money(cart.total_price);
    document.querySelector('#total').textContent = money(cart.total_price);
  });
  document.querySelector('#shipping-form').addEventListener('submit', event => {
    event.preventDefault();
    document.querySelector('#checkout-status').textContent = 'Thông tin đã điền hợp lệ. Đây là bản xem trước; chưa có đơn hàng hay thanh toán nào được thực hiện.';
  });
})();
