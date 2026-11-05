WEBDS = {};
window.textMainVi = {
	text1: 'CHỌN SIZE',
	text2: 'Còn hàng',
	text3: 'Hết hàng',
	text4: 'Từ khóa của bạn có chứa mã độc hại! Vui lòng nhập lại từ khóa khác!',
	text5: 'Không tìm thấy kết quả cho tìm kiếm của bạn',
	text6: 'Xem thêm',
	text7: 'sản phẩm',
	text8: 'Thông báo',
	text9: 'Số lượng bạn mua vượt quá tồn kho!',
	text10: 'Chưa có sản phẩm nào trong danh mục này',
	text11: 'Không được để trống',
	text12: 'Email không hợp lệ',
	text13: 'Mã số thuế 10 chữ số hoặc 10 chữ số kèm theo "-xxx"',
	text14: 'Cập nhật thông tin hoá đơn thành công',
	text15: 'Chưa có thông tin xuất hoá đơn',
	text16: ' kết quả cho từ khoá: ', 
	text17: 'Vui lòng nhập từ khoá',
	text18: 'Đã được thêm vào danh sách yêu thích!',
	text19: 'Đã xoá khỏi danh sách',
  text20: 'THÊM VÀO GIỎ',
  text21: 'Vui lòng chọn Size',
  text22: 'Mục lục bài viết'
}

window.proInCartJS = {};
window.cartJS = {};
window.accountJS = {
	"email": null,
	"first_name": null,
	"last_name": null,
	"name": null,
	"phone": null,
	"logged": false,
	"id": ""
};
window.productCollect = [];

var template = window.shop.template;
var isText = window.textMainVi;
var isAccount = false;

WEBDS.Helper = {
	formatDate: function(date) { // account pages
		var days = {
			'1': 'Thứ 2',
			'2': 'Thứ 3',
			'3': 'Thứ 4',
			'4': 'Thứ 5',
			'5': 'Thứ 6',
			'6': 'Thứ 7',
			'7': 'Chủ Nhật'
		}
		var day = days[date.getDay()];
		var time = (date.getHours() < 10 ? ('0' + date.getHours()): date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
		var _date = (date.getDate() < 10 ? ('0' + date.getDate()):date.getDate());
		var month = date.getMonth() + 1;
		month = month < 10 ? ('Thg 0' + month): month;
		var year = date.getFullYear();
		return /*day + ', ' +*/ time + ', ' + _date + '/' + month + '/' + year
	},
	delayTime:function (func, wait) {
		return function() {
			var that = this,
					args = [].slice(arguments);
			clearTimeout(func._throttleTimeout);
			func._throttleTimeout = setTimeout(function() {
				func.apply(that, args);
			}, wait);
		};
	},
	uniques: function(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	},
	change_alias: function(alias){
		var str = alias;
		str = str.toLowerCase();
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
		str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
		str = str.replace(/đ/g,"d");
		str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\•|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
		str = str.replace(/ /g,"-");
		str = str.trim(); 
		return str;
	},  
	inputTypeDate: function(){
		$('input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="time"], input[type="week"]').each(function() {
			var el = this, type = $(el).attr('type');
			if ($(el).val() == '') $(el).attr('type', 'text');
			$(el).focus(function() {
				$(el).attr('type', type);
				el.click();
			});
			$(el).blur(function() {
				if ($(el).val() == '') $(el).attr('type', 'text');
			});
		});
	},
	passwordVisibility: function(){
		$(".password-mask").on("click", (function() {
			var e = $(this).closest(".account-password-input").find("input");
			"password" === e.attr("type") ? e.attr("type", "text") : e.attr("type", "password"), $(this).closest(".account-password-input").find(".password-mask.hide").removeClass("hide"), $(this).toggleClass("hide");
		}))
	},
	checkemail: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	checkphone: function(phone){
		var re = /(^0[2-9]\d{8}$)|(^01\d{9}$)/;
		return re.test(phone); 
	},
	filterInput: function(event) {
		var keyCode = ('which' in event) ? event.which : event.keyCode;
		isNotWanted = (keyCode == 69 || keyCode == 190 || keyCode == 189);
		return !isNotWanted;
	},
	smoothScroll: function(a,b){
		$('body,html').animate({
			scrollTop : a
		}, b);
	},
	SwalWarning: function(title,content,icon,cancel,confirm,timeclose){
		Swal.fire({
			title: title,
			text: content,
			icon: icon,
			timer: timeclose != undefined ? timeclose : false,
			showCancelButton: cancel,
			showConfirmButton: confirm,
			confirmButtonText: 'Đồng ý',
			cancelButtonText: 'Không',
		}).then((result) => {
			if (result.isConfirmed) {
				//Swal.fire('Saved!', '', 'success')
			} else if (result.isDenied) {
				//Swal.fire('Changes are not saved', '', 'info')
			}
		})
	},
	plusQuantity: function() {
		if ( jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal)) {
				jQuery('input[name="quantity"]').val(currentVal + 1);
			} else {
				jQuery('input[name="quantity"]').val(1);
			}
		}
		else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	},
	minusQuantity: function() {
		if (jQuery('input[name="quantity"]').val() != undefined ) {
			var currentVal = parseInt(jQuery('input[name="quantity"]').val());
			if (!isNaN(currentVal) && currentVal > 1) {
				jQuery('input[name="quantity"]').val(currentVal - 1);
			}
		}else {
			console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
		}
	},	

	//NEW
	getSidebarCart: function(){
		var cart = null;
		jQuery.getJSON('/cart.js', function(cart, textStatus) {
			if(cart) {
				cartJS = cart;
				$('.main-header .main-header--icon.h-cart span.count').html(cartJS.item_count).toggleClass('is-empty', cartJS.item_count == 0);

				if(window.cartJS.items.length > 0){
					var handles = WEBDS.Helper.uniques(window.cartJS.items.map(item => {return item.handle}));
					var ids = WEBDS.Helper.uniques(window.cartJS.items.map(item => {return item.product_id}));
					$.get("/search.js?q=filter=(id:product in "+ids.join(',')+")").done(function(res){
						if(res.total > 0){
							res.products.map(prd => {
								window.proInCartJS[prd.id] = prd;
							}); 
							cartJS.items.map(x => {
								x.inAdmin = window.proInCartJS[x.product_id];
							});
						}
            
						$('#sidebar-cart .sidebar-foot').removeClass('d-none');
						$('#sidebar-cart .sidebar-body').removeClass('notitem');
						$('#sidebar-cart .ajaxSidebarcart').removeClass('sidebar-cart--empty');
						$('#sidebar-cart .ajaxSidebarcart').html('');
						$('#sidebar-cart .ajaxSidebarcart').html(WEBDS.Helper.checkItemSidebarCart(cartJS));
            $('#sidebar-cart #sidebar-cart--total div.text span').html('('+cartJS.item_count + ' món)');
						$('#sidebar-cart #sidebar-cart--total div.number').html(Haravan.formatMoney(cartJS.total_price, shop.moneyFormat).replaceAll(',','.'));
					});
				}
				else {
					$('#sidebar-cart .sidebar-foot').addClass('d-none');
					$('#sidebar-cart .sidebar-body').addClass('notitem');
					$('#sidebar-cart .ajaxSidebarcart').addClass('sidebar-cart--empty');
					$('#sidebar-cart .ajaxSidebarcart').html(`<div class="sidebar-cart--emptytext">Chưa có sản phẩm nào trong giỏ hàng</div>`);
				}
				
				$('#mainLoading').removeClass('active');	
				if (template.indexOf('cart') > -1){
					location.reload();
				}
				else {
					$('body, html').addClass('open-sidebar-cart lock-scroll');
				}
			}
		});
	},
	renderItemSidebarCart: function(resultItem, type, line) {
    var htmlLine = '';
    var titleLine = resultItem.title;
    var currentVariant = null;
    if (resultItem.inAdmin && resultItem.inAdmin.variants && resultItem.inAdmin.variants.length) {
      currentVariant = resultItem.inAdmin.variants.find(function(variant) {
        return String(variant.id) === String(resultItem.variant_id);
      });
    }
    
    // RENDER SELECTED OPTIONS
    var selectedOptions = '';
    if (currentVariant && Array.isArray(currentVariant.options) && resultItem.inAdmin && Array.isArray(resultItem.inAdmin.options) ) {  
        var optionHtml = [];
        resultItem.inAdmin.options.forEach(function(option, index) {
            // Có thể trả option dưới dạng string hoặc object
            var optionName = '';
            if (typeof option === 'string') {
                optionName = option;
            }
            else if (option && typeof option === 'object') {
                optionName = option.name || option.title || option.label || '';
            }
            // Value của variant vẫn lấy theo index
            var optionValue = currentVariant.options[index];
            if (!optionName || optionValue == null) { return; }    
            optionName = String(optionName).trim();
            optionValue = String(optionValue).trim();
            var optionNameLower = optionName.toLowerCase();
            var isColor = optionNameLower.indexOf('màu') > -1;
            var isSize =
                optionNameLower.indexOf('size') > -1 ||
                optionNameLower.indexOf('kích thước') > -1;
    
            if (!isColor && !isSize) { return; }
            optionHtml.push('<span class="selected-option">' + '<b>' + optionName + ':</b> ' + optionValue + '</span>' );
        });
        selectedOptions = optionHtml.join(' <span class="seperate"></span> ');
    }
    
    // PRICE
    var del_price = '';
    var precent_price = '0';
    var current_price = Haravan.formatMoney(resultItem.price,shop.moneyFormat).replaceAll(',', '.');
    if (resultItem.price_orginal > resultItem.price) {
        del_price = Haravan.formatMoney(resultItem.price_orginal,shop.moneyFormat).replaceAll(',', '.');
        precent_price = Math.round(((resultItem.price_orginal - resultItem.price) /resultItem.price_orginal) * 100);
    }
    else if (currentVariant) {
        current_price = Haravan.formatMoney( currentVariant.price, shop.moneyFormat).replaceAll(',', '.');
        if (currentVariant.compare_at_price > currentVariant.price) {
            del_price = Haravan.formatMoney( currentVariant.compare_at_price, shop.moneyFormat).replaceAll(',', '.');
            precent_price = Math.round(((currentVariant.compare_at_price - currentVariant.price) / currentVariant.compare_at_price ) * 100);
        }
    }

    // CART ITEM
    htmlLine +=
        '<div class="sidebar-cart--item ' + (type == 'giftApp' ? 'line-gift' : '') + '"' +
        ' data-line="' + (line + 1) + '"' +
        ' data-variant-id="' + resultItem.variant_id + '"' +
        ' data-pro-id="' + resultItem.product_id + '"' + '>';
    htmlLine +=
        '<div class="sidebar-cart--left">' +
            '<div class="item-img">' +
                '<a href="' + resultItem.url + '">';

    if (resultItem.image == null) {
        htmlLine += '<img src="/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg" alt="' + titleLine + '" />';
    }
    else {
        htmlLine += '<img src="' + resultItem.image + '" alt="' + titleLine + '" />';
    }
    htmlLine +=
                '</a>' +
            '</div>' +
        '</div>';
    htmlLine +=
        '<div class="sidebar-cart--right">' +
            '<div class="item-info">' +
                '<div class="item-info--top">' +
                    '<div class="item-desc">';
    if (resultItem.price == 0 || resultItem.price == 100) {
        htmlLine +=   '<span class="label-gift">Quà tặng</span>';
    }
    htmlLine +=       '<h3>' + '<a href="' + resultItem.url + '">' + titleLine + '</a>' + '</h3>' +

                    '</div>' +
                    '<div class="item-meta">' +
                        '<div class="selected-variant">';
    if (selectedOptions != '') {
        htmlLine += selectedOptions;
    }
    else if (resultItem.variant_title) {
        htmlLine += resultItem.variant_title;
    }
    htmlLine +=
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="item-info--bottom">';
    if (type == 'comboApp') {
        // 
    }
    else if ( type == 'giftApp' || type == 'giftOmni' ) {
        // 
    }
    else {
      if (resultItem.price > 0) {
          htmlLine += '<div class="item-price">' +
                  '<span class="hasSale">' + current_price + '</span>';
          if (del_price != '') {
              htmlLine += '<del>' + del_price + '</del>';
          }
          htmlLine += '</div>';
      }
      else {
          htmlLine += '<div class="item-price"></div>';
      }
    }
    
    if (resultItem.price > 0) {
        htmlLine +=
            '<div class="item-quan">' +
                '<div class="qty quantity-partent qty-click-mini">' +
                    '<button type="button" ' +
                        'class="qtyminus-mini qty-btn ' + (resultItem.quantity > 1 ? '' : 'disabled') + '"' + (resultItem.quantity > 1 ? '' : 'disabled') + '>' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 
                    '</button>' +
                    '<input readonly ' +
                        'data-vid="' + resultItem.variant_id + '" ' +
                        'data-quantity="' + resultItem.quantity + '" ' +
                        'data-product="' + resultItem.product_id + '" ' +
                        'type="text" ' +
                        'size="4" ' +
                        'name="updates[]" ' +
                        'min="1" ' +
                        'id="updates_' + resultItem.variant_id + '" ' +
                        'data-price="' + resultItem.price + '" ' +
                        'value="' + resultItem.quantity + '" ' +
                        'class="tc sidebar-cart--item-qty item-quantity-mini"' +
                    '>' +
                    '<button type="button" class="qtyplus-mini qty-btn">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                    '</button>' +
                '</div>' +
            '</div>';
    }
    else {
        htmlLine += '<div class="item-quan">' + '<span>' + resultItem.quantity + '</span>' + '</div>';
    }

    htmlLine +=
                '</div>' +
            '</div>' +
            '<div class="item-actions">';
    if (resultItem.price > 0) {
        htmlLine +=
            '<div class="item-remove">' +
                '<a href="javascript:void(0);" ' + 'onclick="WEBDS.Helper.deleteItemSidebarCartSingle(' + (line + 1) + ')" ' + 'class="glass">' +
                    '<span>' +
                        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6667 4.00016V3.46683C10.6667 2.72009 10.34672 2.34672 10.5213 2.06151C10.3935 1.81063 10.1895 1.60665 9.93865 1.47882C9.65344 1.3335 9.28007 1.3335 8.53333 1.3335H7.46667C6.71993 1.3335 6.34656 1.3335 6.06135 1.47882C5.81046 1.60665 5.60649 1.81063 5.47866 2.06151C5.33333 2.34672 5.33333 2.72009 5.33333 3.46683V4.00016M6.66667 7.66683V11.0002M9.33333 7.66683V11.0002M2 4.00016H14M12.6667 4.00016V11.4668C12.6667 12.5869 12.2569 13.9511 11.5746 14.4488C11.1468 14.6668 10.5868 14.6668 9.46667 14.6668H6.53333C5.41323 14.6668 4.85318 14.6668 4.42535 14.4488C4.04903 14.2571 3.74307 13.9511 3.55132 13.5748C3.33333 13.147 3.33333 12.5869 3.33333 11.4668V4.00016" stroke="#A4A7AE" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                    '</span>' +
                '</a>' +
            '</div>';
    }
    htmlLine +=
            '</div>' +
        '</div>' +
    '</div>';
    return htmlLine;
  },
	checkItemSidebarCart: function(cart) {
		var itemOjProperties = {}
		if(cart.item_count > 0) {
			var htmlHead = '';
      htmlHead += '<div class="cart-group single a"></div>';
      $('#sidebar-cart .ajaxSidebarcart').append(htmlHead);
			for(var i = 0; i < cart.items.length; i++) {
        var item = cart.items[i];
        var htmlNormal =	WEBDS.Helper.renderItemSidebarCart(item,'',i,);
        $('#sidebar-cart .ajaxSidebarcart .cart-group.single').append(htmlNormal);
			}
		}
	},
	UpdateChangeQtySidebarCart: function(comboCode,newQty,beforeQty,line) {
		var arrayUpdate = [];
		var comboItem = false;
		var listCart = document.querySelectorAll('[id^="updates_"]');
		$.each(window.cartJS.items,function(i,v){
			if(i == line){
				arrayUpdate.push(newQty);
			}
			else{
				arrayUpdate.push(v.quantity);
			}
		});
		arrayUpdate = 'updates[]='+arrayUpdate.join('&updates[]=');
		var params = {
			type: 'POST',
			url: '/cart/update.js',
			data: arrayUpdate,
			dataType: 'json',
			success: function(data) { 
				window.cartJS = data;
				WEBDS.Helper.getSidebarCart();
				$('.list-sidebar-cart').removeClass('js-loading');
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};
		jQuery.ajax(params);
	},
	changeQtyItemSidebarCart: function() {
		$(document).on('click','.qty-click-mini .qtyplus-mini',function(e){
			e.preventDefault();
			var input = $(this).parent('.quantity-partent').find('input');
			var currentVal = parseInt(input.val());
			if (!isNaN(currentVal)) {
				input.val(currentVal + 1);
			} else {
				input.val(1);
			}
		});
		$(document).on('click',".qty-click-mini .qtyminus-mini",function(e) {
			e.preventDefault();
			var input = $(this).parent('.quantity-partent').find('input');
			var currentVal = parseInt(input.val());
			if (!isNaN(currentVal) && currentVal > 1) {
				input.val(currentVal - 1);
			} else {
				input.val(1);
			}
		});
		$(document).on('click','.qty-click-mini button[class*="qty"]',WEBDS.Helper.delayTime(function(e){
			var beforeQty = parseInt($(this).parents('.item-quan').find('.txt-qty').html()),
					qtyChange = parseInt($(this).siblings('input').val());
			var line = parseInt($(this).parents('.sidebar-cart--item').attr('data-line')) - 1;
			$('.list-sidebar-cart').addClass('js-loading');
			WEBDS.Helper.UpdateChangeQtySidebarCart(null,qtyChange,beforeQty,line);
		},300));

	},
  changeOptionMiniCart: function(){
		$(document).on('change','.list-sidebar-cart .variant-option select',function(){
			var v_id = $(this).attr('name').split('_')[2];
			var p_id = $(this).attr('data-prd');
			var line = $(this).attr('data-line');
			var quantity = $(this).parents('.sidebar-cart--item').find('.sidebar-cart--item-qty').val();
			var value = $(this).val();
			var index = Number($(this).attr('name').split('_')[1]);
			var option_other = $(this).parents('.list-variant').find('select[name="option_'+(index == 1 ? 2 : 1)+'_'+v_id+'"]').val();

			var variant_new = window.proInCartJS[p_id].variants.filter(variant => variant.options.includes(value) && variant.options.includes(option_other));
			if(variant_new.length > 0 && variant_new[0].available){
				$.get("/cart/change.js",{line: line, quantity: 0}).done(function(){
					$.post("/cart/add.js",{id: variant_new[0].id,quantity: quantity}).done(function(){
						WEBDS.Helper.getSidebarCart();
					});
				});
			}
			else{}
		});
	},
	deleteItemSidebarCartSingle: function(line){
		var params = {
			type: 'POST',
			url: '/cart/change.js',
			data: 'quantity=0&line=' + line,
			dataType: 'json',
			success: function(cart) {				
				$('.main-header .main-header--icon.h-cart span.count').html(cartJS.item_count).toggleClass('is-empty', cartJS.item_count == 0);
				$('#sidebar-cart .ajaxSidebarcart').addClass('js-loading');
        $('#sidebar-cart #sidebar-cart--total div.text span').html('('+cartJS.item_count + ' món)');
				$('#sidebar-cart #sidebar-cart--total div.number').html('');
				WEBDS.Helper.getSidebarCart();	
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};

		jQuery.ajax(params);

	},
}
WEBDS.Global = {
	init: function(){
		var that = this;
		//that.cartAjax(function(cart){
		//WEBDS.Helper.getSidebarCart();
		//});
		that.cartAjax();
		that.headerJS.init();
		that.actionLoop();
		that.bannerThanksTrim();
		that.menuSidebar();
		WEBDS.Helper.changeQtyItemSidebarCart();
    WEBDS.Helper.changeOptionMiniCart();
    WEBDS.Quickview.init();
    WEBDS.Wishlist.init();
	},
	bannerThanksTrim: function(){},
	cartAjax: function(callback){
		var self = this;		
		$.ajax({
			type:'GET',
			url: '/cart.js',
			dataType: 'json',
			async: false,
			success: function(data){
				window.cartJS = data;   
				$('.main-header .main-header--icon.h-cart span.count').html(cartJS.item_count).toggleClass('is-empty', cartJS.item_count == 0);

				if(data.customer_id != null){
					window.accountJS.id = data.customer_id;
				}
				else {
					window.accountJS.id = window.account.id;
				}

				if(window.cartJS.items.length > 0){
					var handles = WEBDS.Helper.uniques(window.cartJS.items.map(item => {return item.handle}));
          var ids = WEBDS.Helper.uniques(window.cartJS.items.map(item => {return item.product_id}));          
          $.get("/search.js?q=filter=(id:product in "+ids.join(',')+")").done(function(res){
            if(res.total > 0){
              res.products.map(prd => {
                window.proInCartJS[prd.id] = prd;
              }); 
              cartJS.items.map(x => {
  							x.inAdmin = window.proInCartJS[x.product_id];
  						});
            }
            if(!isAccount){
							isAccount = true;
							self.accountJS();
						}

            $('#sidebar-cart .sidebar-foot').removeClass('d-none');
						$('#sidebar-cart .sidebar-body').removeClass('notitem');
						$('#sidebar-cart .ajaxSidebarcart').removeClass('sidebar-cart--empty');
						$('#sidebar-cart .ajaxSidebarcart').html('');
						$('#sidebar-cart .ajaxSidebarcart').html(WEBDS.Helper.checkItemSidebarCart(cartJS));
            $('#sidebar-cart #sidebar-cart--total div.text span').html('('+cartJS.item_count + ' món)');
						$('#sidebar-cart #sidebar-cart--total div.number').html(Haravan.formatMoney(cartJS.total_price, shop.moneyFormat).replaceAll(',','.'));
						if(callback != undefined) return callback();
          });
				}
				else {
					$('#sidebar-cart .sidebar-foot').addClass('d-none');
					$('#sidebar-cart .sidebar-body').addClass('notitem');
					$('#sidebar-cart .ajaxSidebarcart').addClass('sidebar-cart--empty');
					$('#sidebar-cart .ajaxSidebarcart').html(`<div class="sidebar-cart--emptytext">Chưa có sản phẩm nào trong giỏ hàng</div>`);
					if(!isAccount){
						isAccount = true;
						self.accountJS();
					}
					if(callback != undefined) return callback();
				}
			}
		});
	},	
	accountJS: function(){
		var self = this;
		$.ajax({
			type:'GET',
			async: false,
			url: '/account.js',
			dataType: 'json',
			success: function(account){
				var id = accountJS.id;
				var user_info = localStorage.getItem('user_info');
				if(account.email != '' && account.email != undefined){
					accountJS = account;
					accountJS['id'] = id;
					accountJS['logged'] = true;		
				}
				if(account.first_name != null && account.first_name != '') {
					accountJS['id'] = id;
					accountJS['logged'] = true;
				}
			}
		});
	},
	headerJS: {
		init: function(){
			var that = this;
			that.iconAction();
			that.searchAuto();
			that.scrollFixedHeader();
		},
		iconAction: function(){
			function closeSearch(){
				$('body').removeClass('open-search lock-scroll');
				$('.main-header--icon.h-search').removeClass('js-action-show');
				$('#ajaxSearchResults').hide();
			}
			function resetSidebarMenu(){
				$('#sidebar-menumobile .ajaxSearchResults').hide();
				closeSidebarSearch();
			}
			function closeSidebarSearch(){
				var $head = $('#sidebar-menumobile .sidebar-menu--head');
				$head.removeClass('is-search-open');
				$head.find('.js-sidebar-search-toggle').attr('aria-expanded', 'false');
				$head.find('.ajaxSearchResults').hide();
				$head.find('.input-search').blur();
			}
			$(document).on('click', '.js-sidebar-search-toggle', function(e){
				e.preventDefault();
				var $head = $(this).closest('.sidebar-menu--head');
				$head.addClass('is-search-open');
				$(this).attr('aria-expanded', 'true');
				$head.find('.input-search').trigger('focus');
			});
			$(document).on('click', '.js-close-search', function(e){
				e.preventDefault();
				closeSearch();
			});
			$(document).on('keydown', function(e){
				if (e.key !== 'Escape') return;
				if ($('body').hasClass('open-search')) closeSearch();
				if ($('body').hasClass('open-menumobile')) {
					$('body').removeClass('open-menumobile lock-scroll');
					resetSidebarMenu();
				}
			});
			$(document).on('click', '.js-sidebar-menu-toggle', function(e){
				e.preventDefault();
				var $li = $(this).closest('.has-sub');
				$li.toggleClass('is-open');
				$li.children('.sidebar-menu--child').stop(true, true).slideToggle(250);
			});
			$('body').on('click', '.main-header--icon > a', function(e){
				e.preventDefault();
				var id = $(this).attr('data-id');
				if (id == 'js-click-h-cart') {
					if (!(template.indexOf('cart') > -1)){
						$('html,body').addClass('open-sidebar-cart lock-scroll');
					}
					if (template.indexOf('product') > -1){
						$('.productdetail-fixed').removeClass('is-show');
					}
				}
				else if (id == 'js-click-menumobile') {
					$('body').addClass('open-menumobile lock-scroll');
				}
				else if (id == 'js-click-search') {
					if($('body').hasClass('open-search')){
						closeSearch();
					}
					else {
						$('body').addClass('open-search lock-scroll');
						$(this).parents('.main-header--icon').addClass('js-action-show');
						setTimeout(function(){ $('#inputSearchAuto').trigger('focus'); }, 400);
					}
				}	
				else {
					var href = $(this).attr('href');
					window.location = href;
				}
			});
			$(document).on('click', '.close-sidebar', function(e){
				e.preventDefault();
				var id = $(this).attr('data-id');
        $('.main-header--icon > a').removeClass('is-active');
				if (id == 'sidebar-cart') {
					$('html,body').removeClass('open-sidebar-cart lock-scroll');
				}
				else if (id == 'sidebar-menu') {
					if ($('#sidebar-menumobile .sidebar-menu--head').hasClass('is-search-open')) {
						closeSidebarSearch();
						return;
					}
					$('body').removeClass('open-menumobile lock-scroll');
					resetSidebarMenu();
				}
				else if (id == 'sidebar-filter') {
          $('html,body').removeClass('open-sidebar-filter lock-scroll');
					$('html,body').removeClass('open-filtermb lock-scroll');
					$('.collection-layout').removeClass('has-filter');
          $('.collection-filter--mb').removeClass('filter--mb-show');       
				}
        else if (id == 'sidebar-coupon') {
					$('html,body').removeClass('open-coupon lock-scroll');
				}
        else if (id == 'sidebar-quickview'){
          $('html,body').removeClass('open-sidebar-quickview lock-scroll');
        }
			});
			$(document).on('click', '.sidebar-overlay', function(e){
				e.preventDefault();
				$('html,body').removeClass('open-sidebar-cart open-sidebar-quickview open-menumobile open-search open-coupon open-filtermb open-sidebar-filter lock-scroll');
				resetSidebarMenu();
        $('.main-header--icon > a').removeClass('is-active');
				$('.main-header--icon').removeClass('js-action-show');
        $('.collection-layout').removeClass('has-filter');
        $('.collection-filter--mb').removeClass('filter--mb-show');
        $('.main-header--icon.h-search').removeClass('js-action-show');
			});
		},
		searchAuto: function(){
			$('.ultimate-search').submit(function(e) {
				e.preventDefault();
				var q = $(this).find('input[name=q]').val();
				if(q.indexOf('script') > -1 || q.indexOf('>') > -1){
					alert(isText.text4);
					$(this).find('input[name=q]').val('');
				}
				else {
					if( !q ) {
						window.location = '/search?q=*';
						return;
					}	else {
						window.location = '/search?q=' + q;
						return;
					}
				}
			});
			var $input = $('.ultimate-search input[type="text"]');
			$input.bind('keyup change paste propertychange', function() {
				var key = $(this).val(),
						$parent = $(this).parents('.wpo-wrapper-search'),
						$results = $(this).parents('.wpo-wrapper-search').find('.smart-search-wrapper');

				if(key.indexOf('script') > -1 || key.indexOf('>') > -1){
					alert(isText.text4);
					$(this).val('');
					$('.ultimate-search input[type="text"]').val('');
				}
				else{
					if(key.length > 0 ){
						$(this).attr('data-history', key);
						$('.ultimate-search input[type="text"]').val($(this).val());
						var url = '/search.js?q=filter=(title:product ** '+encodeURIComponent(key)+')&page=1&limit=8';
						$.ajax({
							url: url,
							type: 'GET',
							async: true,
							success: function(data){							
								var items = '';
								if (data.total == 0) {
									items += '<div class="dataEmpty">'+isText.text5+'</div>';
								}
								else {
									var index = 1;
									items += '<div class="list">'
									data.products.filter(x => {
										if(x.available){
											if(index <= 8) {
												index++;
												var href = x.url;
												var price = x.variants[0].price;
												var del = x.variants[0].compare_at_price;
												var img = '<img src="/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg" alt="'+title+'"/>';
												if (x.featured_image != ''){
													img = '<img src="'+Haravan.resizeImage(x.featured_image, 'grande')+'" alt="'+title+'"/>';	
												}
												var title = x.title;
												items += '<div class="item-ult ">';
												items += '<div class="thumbs"><a href="'+href+'" title="'+title+'">'+img+'</a></div>';
												items += '<div class="info">';
												items += '<div class="title"><a class="a-link" title="'+title+'" href="'+href+'">'+title+'</a></div>';
												items += '<div class="price">';
												items += '<span class="'+(del > price ? 'has-sale': '')+'">'+Haravan.formatMoney(price,shop.moneyFormat).replaceAll(',','.');+'</span>';
												if (del > price) {
													items += '<del>'+Haravan.formatMoney(del,shop.moneyFormat).replaceAll(',','.')+'</del>';
												}
												items += '</div>';
												items += '</div>';
												items += '</div>';			
											}
										}
									});
									items += '</div>';
									if (index > 8) {
										items += '<div class="dataMore">';
                    items += '<a href="/search?q='+encodeURIComponent(key)+'">Xem thêm <strong>'+Number(data.total - 8)+'</strong> sản phẩm</a>';
										items += '</div>';
									}
								}
								if(items != ''){
									$results.find('.resultsContent').html(items);
								}
							}
						})
						if(!$('.main-header--icon.h-search').hasClass('js-action-show') && !$('body').hasClass('open-menumobile')){
							$('body').removeClass("lock-scroll");
							$('.main-header--icon').removeClass('js-action-show');
						}
						$(".ultimate-search").addClass("expanded");
						$results.fadeIn();
					}
					else{
						$('.ultimate-search input[type="text"]').val($(this).val());
						$(".ultimate-search").removeClass("expanded");
						$results.fadeOut();
					}
				}

			})
			$('body').click(function(evt) {
				var target = evt.target;
				if (target.id !== 'ajaxSearchResults' && target.id !== 'inputSearchAuto') {
					$("#ajaxSearchResults").hide();
				}
				if (!$(target).closest('#sidebar-menumobile .sidebar-menu--head').length) {
					$('#sidebar-menumobile .ajaxSearchResults').hide();
				}
			});
			$('body').on('click', '.ultimate-search input[type="text"]', function() {
				if ($(this).is(":focus")) {
					if ($(this).val() != '') {
						$(this).parents('.wpo-wrapper-search').find('.ajaxSearchResults').show();
					}
				}
			})
			$('body').on('click', '.ultimate-search .search-close', function(e){
				e.preventDefault();
				$(".ajaxSearchResults").hide();
				$(".ultimate-search").removeClass("expanded");
				$(".ultimate-search").find('input[name=q]').val('');
			})
		},
		scrollFixedHeader: function(){
			if (document.body.dataset.bowVariant === 'header') return;
			var $parentHeader = $('.main-header');
			var parentHeight = $parentHeader.find('.main-header--inner').outerHeight();
			var $header = $('.main-header--inner');
			var offset_sticky_header = $header.outerHeight() + 200;
			var offset_sticky_down = 0;
			$parentHeader.css('min-height', parentHeight );	
			var resizeTimer = false, resizeWindow = $(window).prop("innerWidth");
			$(window).on("resize", function() {
				if (resizeTimer) {clearTimeout(resizeTimer)	}
				resizeTimer = setTimeout(function() {
					var newWidth = $(window).prop("innerWidth");
					if (resizeWindow != newWidth) {
						$header.removeClass('hSticky-up').removeClass('hSticky-nav').removeClass('hSticky');
						$parentHeader.css('min-height', '' );	
						resizeTimer = setTimeout(function() {
							parentHeight = $parentHeader.find('.main-header--inner').outerHeight();
							$parentHeader.css('min-height', parentHeight );	
						}, 50);
						resizeWindow = newWidth;
            if (template.indexOf('collection') > -1) $('.gridfilter-section').removeClass('hSticky-up');
					}
				}, 200)
			});
			setTimeout(function() {
				$parentHeader.css('min-height', '' );		
				parentHeight = $parentHeader.find('.main-header--inner').outerHeight();
				$parentHeader.css('min-height', parentHeight );	
				jQuery(window).scroll(function() {	
					/* scroll header */
					if(jQuery(window).scrollTop() > offset_sticky_header && jQuery(window).scrollTop() > offset_sticky_down) {		
						if(jQuery(window).width() > 991){		
							$('body').removeClass('lock-scroll');
							$('.main-header--icon').removeClass('js-action-show');
						}		
						$header.addClass('hSticky');	
						if(jQuery(window).scrollTop() > offset_sticky_header + 150){
							$header.removeClass('hSticky-up').addClass('hSticky-nav');	
							$('body').removeClass('scroll-body-up');
              if (template.indexOf('collection') > -1) $('.gridfilter-section').removeClass('hSticky-up');
						};
					} 
					else {
						if(jQuery(window).scrollTop() > offset_sticky_header && (jQuery(window).scrollTop() + 450) + jQuery(window).height()  < $(document).height()) {
							$header.addClass('hSticky-up');	
							$('body').addClass('scroll-body-up');
              if (template.indexOf('collection') > -1) $('.gridfilter-section').addClass('hSticky-up');
						}	
					}
					if (jQuery(window).scrollTop() <= offset_sticky_down && jQuery(window).scrollTop()   <= offset_sticky_header ) {
						$header.removeClass('hSticky-up').removeClass('hSticky-nav');
						$('body').removeClass('scroll-body-up');
						if(jQuery(window).scrollTop()  <= offset_sticky_header - 100){
							$header.removeClass('hSticky');
						}
            if (template.indexOf('collection') > -1) $('.gridfilter-section').removeClass('hSticky-up');
					}
					offset_sticky_down = jQuery(window).scrollTop();
				});	
			}, 300);
		},
	},
	renderLoop: function(data,ind){
		if(typeof data.tags == 'string'){
			data.tags = data.tags.split(',');
		}

    var no_image = '/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg';
		var img_desk_1 = '/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg';
		var img_mb_1 = '/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg';
		var img_desk_2 = '/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg';
		var img_mb_2 = '/assets/cdn.hstatic.net/files/200001179192/file/no-image.jpg';
		
		var titleProduct = data.title;
		var titleStatus = 'Hết hàng';
		var titleATC = 'Thêm vào giỏ hàng';
		var titleFrame = 'Chương trình khuyến mãi';
    var titleQV = 'Xem nhanh';
	
		//Image product
		if(data.featured_image != '' && data.featured_image != null){
			img_mb_1 = Haravan.resizeImage(data.featured_image,'grande');
			img_desk_1 = Haravan.resizeImage(data.featured_image,'1024x1024');
			if(data.images.length > 1) {
				img_mb_2 = Haravan.resizeImage(data.images[1],'grande');
				img_desk_2 = Haravan.resizeImage(data.images[1],'1024x1024');
			}
		}		
		if(data.image != '' && data.image != null){
			img_mb_1 = Haravan.resizeImage(data.image.src,'grande');
			img_desk_1 = Haravan.resizeImage(data.image.src,'1024x1024');
			if(data.images.length > 1) {
				img_mb_2 = Haravan.resizeImage(data.images[1].src,'grande');
				img_desk_2 = Haravan.resizeImage(data.images[1].src,'1024x1024');
			}
		}

		//Link product
		var url_prod = data.hasOwnProperty('url') ? data.url : '/products/'+data.handle;

		//Tag product
		var tag_frame = '';
		webds_tag.frame.tag.map((value3,index3) => {
			if(value3 != "null" && data.tags != null){
				if(data.tags.join(',').indexOf(value3) > -1 && tag_frame == ''){
					tag_frame  = webds_tag.frame.icon[index3];
					//return false;
				}
			}
		});

    var getTagBest = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('badge:Bestseller') > -1);
		var valTagBest	= 0;
		if(getTagBest.length > 0) valTagBest = getTagBest[0].split(':')[1];

    var getTagNew = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('New Drop') > -1); 
		var valTagNew	= 0;
		if(getTagNew.length > 0) valTagNew = getTagNew[0];

		//Check tag SKU
		var getTagSku = data.tags == null ? [] : data.tags.filter((value) => value.indexOf('ItemNumber') > -1);
		var valTagSku	= '';
		if(getTagSku.length > 0) valTagSku = getTagSku[0].split(':')[1];

    // Color Product 
    var html_swatchcolor = '';
    var count_color = 0;
    var colorOption = null;
    var colorOptionIndex = -1;    
    // 1. FIND COLOR OPTION
    // Không cố định Màu sắc ở option1 / option2 / option3
    $.each(data.options || [], function(index, option) {    
    	var optionName = '';  
    	if (option && option.name != null) {
    		optionName = String(option.name).trim().toLowerCase();
    	}    
    	if (
    		optionName.indexOf('màu sắc') > -1 ||
    		optionName.indexOf('mau sac') > -1 ||
    		optionName === 'màu' ||
    		optionName === 'mau' ||
    		optionName === 'color'
    	) {  
    		colorOption = option;
    		colorOptionIndex = index;   
    		return false;
    	}
    });   
    if (colorOption) {  
      // 2. COLOR OPTION FOUND
    	var colorValues = $.isArray(colorOption.values) ? colorOption.values : [];
    	count_color = colorValues.length; 
    	// Xác định variant option tương ứng
    	var colorVariantKey = 'option' + (colorOptionIndex + 1);
    	// 3. IMAGE SOURCE
    	var listImage = data.hasOwnProperty('url') ? data.media : data.images; 
    	listImage = $.isArray(listImage) ? listImage : []; 
    	// 4. LOOP COLOR
    	$.each(colorValues, function(index, color) {   
    		if (color == null) {
    			return;
    		}    
    		color = String(color).trim();    
    		if (!color) {
    			return;
    		}
    		var colorLower = color.toLowerCase();   
    		// 5. FIND VARIANT THEO COLOR
    		// Chỉ cần variant đầu tiên của mỗi màu
    		var variant = (data.variants || []).find(function(variant) {
    			if (!variant) {
    				return false;
    			}
    			var variantColor = variant[colorVariantKey];    
    			if (variantColor == null) {
    				return false;
    			}    
    			return String(variantColor).trim().toLowerCase() === colorLower;  
    		});    
    		// Không có variant của màu này
    		if (!variant) {
    			return;
    		}
        
    		// ====================================================
    		// 6. DEFAULT IMAGE
    		// ====================================================
    		var src_desk_1 = img_desk_1;
    		var src_desk_2 = img_desk_2;    
    		var src_mb_1 = img_mb_1;
    		var src_mb_2 = img_mb_2;
        
    		// FIND IMAGE THEO ALT
    		var matchedImages = listImage.filter(function(item) {    
    			if (!item || item.alt == null) {
    				return false;
    			}
    			var alt = String(item.alt).trim().toLowerCase();
    			return (
    				alt.indexOf('icon') > -1 &&
    				alt.indexOf(colorLower) > -1
    			);   
    		});
    
    		// ƯU TIÊN IMAGE THEO ALT
        // Nếu ALT chưa nhập / ALT = null
    		// thì lấy featured_image của variant
    		if (matchedImages.length > 0) { 
    			// Image 1
    			src_desk_1 = Haravan.resizeImage( matchedImages[0].src, '1024x1024' );
    			src_mb_1 = Haravan.resizeImage( matchedImages[0].src, 'grande' );
    			// Image 2
    			var secondImage = matchedImages[1] ? matchedImages[1].src : matchedImages[0].src;       
    			src_desk_2 = Haravan.resizeImage(secondImage, '1024x1024' );
    			src_mb_2 = Haravan.resizeImage(secondImage,'grande' );
    		}
    		else if (variant.featured_image && variant.featured_image.src ) {
    			src_desk_1 = Haravan.resizeImage(variant.featured_image.src,'1024x1024');    
    			src_mb_1 = Haravan.resizeImage( variant.featured_image.src, 'grande');    
    			// Không có ảnh thứ 2 theo ALT - giữ ảnh mặc định của product
    			src_desk_2 = img_desk_2;
    			src_mb_2 = img_mb_2;
    		}
        
    		// PRICE
    		var price = Number(variant.price) || 0;
    		var compare = Number(variant.compare_at_price) || 0;
    		if (!data.hasOwnProperty('url')) {    
    			price = price * 100;
    			compare = compare * 100;
    		}
        
    		// RENDER SWATCH
    		html_swatchcolor += `
    			<div data-color="${color}"
        			 data-index="${index}"
    				   data-variant-id="${variant.id}"
    				   class="swatch-item ${index == 0 ? 'selected' : ''}">
    				<span class="bg swatch-bg--color default"
        					data-color="${WEBDS.Helper.change_alias(color)}"
        					data-img-mb-1="${src_mb_1}"
        					data-img-desk-1="${src_desk_1}"
        					data-img-mb-2="${src_mb_2}"
        					data-img-desk-2="${src_desk_2}"
        					data-price="${price}"
        					data-compare="${compare}"></span>
    			</div>`;
    	});
    }
		
		//Price product
		var html_priceofsize = '';
		var sale = 0, del = 0;
		if(data.hasOwnProperty('url')){
			var compare_at_price = Number(data.variants[0].compare_at_price);
			var price = Number(data.variants[0].price);
		}
		else {
			var compare_at_price = Number(data.variants[0].compare_at_price)*100;
			var price = Number(data.variants[0].price)*100;
		}
		if(compare_at_price > price){
			del = Haravan.formatMoney(compare_at_price,shop.moneyFormat).replaceAll(',','.');
			sale = Math.round((compare_at_price - price)/compare_at_price * 100);
		}
		html_priceofsize += `<div class="price-current ${sale == 0?'normal':'hightlight'}"><span>${Haravan.formatMoney(price, shop.moneyFormat).replaceAll(',','.')}</span></div>
                         <div class="price-compare ${sale == 0?'d-none':''}"><del class="del">${del}</del></div>`;

		//Available product
		var available_prod = data.available;

		//Available variants product
		var sku_available = data.variants.filter(v => v.available );

		//Action product
		var plusBtnImg = (window.themeUI && window.themeUI.productPlusBtnImg) || '';
		var html_button_2 = plusBtnImg
			? `<a href="${url_prod}" class="product-btn product-btn--plus has-img" aria-label="${titleProduct}"><img src="${plusBtnImg}" width="32" height="32" alt=""></a>`
			: `<a href="${url_prod}" class="product-btn product-btn--plus" aria-label="${titleProduct}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 0h3v6.5H16v3H9.5V16h-3V9.5H0v-3h6.5z" fill="currentColor"/></svg></a>`;
		var html_button_1 = '';
		html_button_1 += `<button aria-label="${titleQV}" class="product-btn quick-view" data-handle="${url_prod}" data-id="${data.id}" data-variantid="${data.variants[0].id}" data-sku="${valTagSku}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M0.5 5.5C0.5 5.5 3 0.5 7.375 0.5C11.75 0.5 14.25 5.5 14.25 5.5C14.25 5.5 11.75 10.5 7.375 10.5C3 10.5 0.5 5.5 0.5 5.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.21875 7.6875C8.51317 7.6875 9.5625 6.63817 9.5625 5.34375C9.5625 4.04933 8.51317 3 7.21875 3C5.92433 3 4.875 4.04933 4.875 5.34375C4.875 6.63817 5.92433 7.6875 7.21875 7.6875Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>						
                      </button>`;
    
		var html_loop = `<div class="product-loop--wrap" data-prid="${data.id}">
          <div class="product-loop--head">
            <div class="product-loop--badges">
              ${valTagBest == 0?'':'<span class="badge-best">'+valTagBest+'</span>'}
              ${valTagNew == 0?'':'<span class="badge-new glass">'+valTagNew+'</span>'}
              ${sale == 0?'':'<span class="badge-percent-sale glass">-'+sale+'%</span>'}
              ${available_prod == false ? '<span class="badge-soldout">'+titleStatus+'</span>' : ''}
            </div>
            <div class="product-loop--img">
              <picture class="img-first">
                <source data-srcset="${img_desk_1}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
                <source data-srcset="${img_mb_1}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
                <img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${img_desk_1}" alt="${titleProduct}"> 
              </picture>
              <picture class="img-second">
                <source data-srcset="${img_desk_2}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(min-width: 768px)">
                <source data-srcset="${img_mb_2}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" media="(max-width: 767px)">
                <img class="lazyload img-default" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="${img_desk_2}" alt="${titleProduct}">
              </picture>
              ${tag_frame != '' ? '<div class="product-loop-frame"><img src="'+tag_frame+'" alt="'+titleFrame+'"></div>' : ''}
            </div>
            <a href="${url_prod}" class="product-loop--link"></a>
            <div class="product-loop--btn"><button class="product-btn glass js-wishlist" data-id="${data.id}" data-handle="${data.handle}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 15" fill="none"><path d="M11.666 0C10.9153 0.0116766 10.181 0.221235 9.53716 0.607514C8.89336 0.993793 8.3629 1.54311 7.99932 2.2C7.63575 1.54311 7.10528 0.993793 6.46148 0.607514C5.81768 0.221235 5.08335 0.0116766 4.33265 0C3.13595 0.0519938 2.00846 0.575503 1.19651 1.45616C0.384561 2.33681 -0.0458459 3.50302 -0.000678848 4.7C-0.000678848 7.73133 3.18999 11.042 5.86599 13.2867C6.46347 13.7888 7.21889 14.064 7.99932 14.064C8.77975 14.064 9.53518 13.7888 10.1327 13.2867C12.8087 11.042 15.9993 7.73133 15.9993 4.7C16.0445 3.50302 15.6141 2.33681 14.8021 1.45616C13.9902 0.575503 12.8627 0.0519938 11.666 0ZM9.27599 12.2667C8.91864 12.5676 8.46649 12.7326 7.99932 12.7326C7.53215 12.7326 7.08 12.5676 6.72265 12.2667C3.29732 9.39267 1.33265 6.63533 1.33265 4.7C1.28708 3.85648 1.5769 3.02915 2.1389 2.39847C2.70089 1.76778 3.48948 1.3849 4.33265 1.33333C5.17583 1.3849 5.96441 1.76778 6.52641 2.39847C7.08841 3.02915 7.37823 3.85648 7.33265 4.7C7.33265 4.87681 7.40289 5.04638 7.52792 5.1714C7.65294 5.29643 7.82251 5.36667 7.99932 5.36667C8.17613 5.36667 8.3457 5.29643 8.47073 5.1714C8.59575 5.04638 8.66599 4.87681 8.66599 4.7C8.62041 3.85648 8.91023 3.02915 9.47223 2.39847C10.0342 1.76778 10.8228 1.3849 11.666 1.33333C12.5092 1.3849 13.2977 1.76778 13.8597 2.39847C14.4217 3.02915 14.7116 3.85648 14.666 4.7C14.666 6.63533 12.7013 9.39267 9.27599 12.264V12.2667Z" fill="#333333"/></svg></button></div>
          </div>
          <div class="product-loop--body">
            <div class="product-loop--info">
              <div class="product-loop--detail">
                <h3 class="product-loop--name"><a href="${url_prod}" title="${titleProduct}">${titleProduct}</a></h3>
                <div class="product-loop--prices">${html_priceofsize}</div>
              </div>
              <div class="product-loop--btn plus">${html_button_2}</div>
            </div>
            <div class="product-loop--swatch">${html_swatchcolor}</div>
          </div>
        </div>`;
		return html_loop;
	},
	getItemSlide: function(id,title,url,type,page,limit,perview,sizedata,btnSwiper,target,callback){
		var url_get = url+'/products.json?page=1&limit='+limit;
		if(url != ''){
			$.get(url_get).done(function(data){
				if(data.products.length > 0){
					$(target+' .swiper-wrapper').html('');
					data.products.map((item,ind) => {
						var html_loop = `<div class="swiper-slide"><div class="product-loop ${type}">` + WEBDS.Global.renderLoop(item,limit*(page - 1) + (ind + 1)) + `</div></div>`;
						$(target+' .products-slide').append(html_loop);
					});
          if($(window).width() > 991 && sizedata > 0){
            setTimeout(function(){
              var swiper = new Swiper(target+" .swiper", {
                loop: false,
                slidesPerView: perview,
                spaceBetween: 8,
                speed: 800,
                mousewheel: {forceToAxis: true},
                freeMode: {enabled: true, sticky: true},
                grabCursor: (sizedata > perview ? true : false),
                //scrollbar: {
                  //el: target+" .swiper-scrollbar",
                  //draggable: true
                //},
                navigation: {
                  nextEl: target+' .swiper-next',
                  prevEl: target+' .swiper-prev'
                },
                breakpoints: {
                  992: {
                    slidesPerView: perview,
                    spaceBetween: 24,
                    navigation: {
                      enabled: (btnSwiper == 1 ? true : false)
                    }
                  }
                }
              });
              if (sizedata > 4 && btnSwiper == 1) {
                $(target+' .swiper-navcontrol').removeClass('d-none');
              }
            },350);
          }

          WEBDS.Wishlist.checkActiveWishlist($(target));
				}
				if(typeof callback === 'function') return callback();
			});
		}
	},
	getItemGrid: function(id,title,url,type,page,limit,target){ 
		var url_get = url+'/products.json?page=1&limit='+limit;
		$.get(url_get).done(function(data){
			if(data.products.length > 0){
				$(target+' .products-grid').html('');
				data.products.map((item,ind) => {
					var html_loop = `<div class="product-loop ${type}">` + WEBDS.Global.renderLoop(item,limit*(page - 1) + (ind + 1)) + `</div>`;
					$(target+' .products-grid').append(html_loop);
				});
        WEBDS.Wishlist.checkActiveWishlist($(target));
			}
		});
	},
	actionLoop: function(){ 
		$(document).on('click','.product-loop .add-to-cart:not([data-available="false"])', function(e){
			e.preventDefault();
			$(this).addClass('loading');
			var id =  $(this).attr('data-variantid');
			var quantity = 1;
			var btn = $(this);
			var param = {
				type: 'POST',
				url: '/cart/add.js',
				data:  { id: id, quantity: quantity },
				dataType: 'json',
				success: function(datacart) {
					btn.addClass('added');
					if (template.indexOf('cart') > -1){
						window.location.reload(); 
					}
					else {
						WEBDS.Global.cartAjax(function(){
              $('html,body').addClass('open-sidebar-cart lock-scroll');
							setTimeout(function(){
								btn.removeClass('added');
							},2000);
						},);
					}
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
					}
				}
			}
			$.ajax(param);
			btn.removeClass('loading');
      
		});
		$(document).on('click','.swatch-item',function(){
			$(this).siblings().removeClass('selected');
			$(this).addClass('selected');
			var img_desk_1 = $(this).find('.bg').attr('data-img-desk-1');
			var img_mb_1 = $(this).find('.bg').attr('data-img-mb-1');
      var img_desk_2 = $(this).find('.bg').attr('data-img-desk-2');
			var img_mb_2 = $(this).find('.bg').attr('data-img-mb-2');
      var price = Number($(this).find('.bg').attr('data-price'));
      var compare = Number($(this).find('.bg').attr('data-compare'));
      
			var dom_loop = $(this).parents('.product-loop--wrap');
			var dom_img = dom_loop.find('.product-loop--img');
			var dom_price = dom_loop.find('.product-loop--prices');
			
			dom_img.find('picture.img-first img').attr('src',img_desk_1);
      dom_img.find('picture.img-first source:eq(0)').attr('srcset',img_desk_1);
			dom_img.find('picture.img-first source:eq(1)').attr('srcset',img_mb_1);
      dom_img.find('picture.img-second img').attr('src',img_desk_2);
      dom_img.find('picture.img-second source:eq(0)').attr('srcset',img_desk_2);
			dom_img.find('picture.img-second source:eq(1)').attr('srcset',img_mb_2);
      dom_price.find('.price-current span').html(Haravan.formatMoney(price, shop.moneyFormat).replaceAll(',','.'));
      if (compare > price) {
        dom_price.find('.price-current').removeClass('normal').addClass('hightlight');
        dom_price.find('.price-compare del').html(Haravan.formatMoney(compare, shop.moneyFormat).replaceAll(',','.'));
        dom_price.find('.price-compare').removeClass('d-none');
      }
      else {
        dom_price.find('.price-current').removeClass('hightlight').addClass('normal');
        dom_price.find('.price-compare').addClass('d-none');
      }
      
		});	
	},
	menuSidebar: function(){
		$(document).on('click', '.plus-nClick1', function(e){
			e.preventDefault();
			$(this).parents('.level0').toggleClass('opened');
			$(this).parents('.level0').children('ul').slideToggle(200);
		});
		$(document).on('click', '.plus-nClick2', function(e){
			e.preventDefault();
			$(this).parents('.level1').toggleClass('opened');
			$(this).parents('.level1').children('ul').slideToggle(200);
		});
	},
}  
WEBDS.Quickview = {
	qv_data_main: {},
	qv_data_color: [],
	current_variant: null,
	init: function(){
		var that = this;
		that.actionQuickview();
	},
	actionQuickview: function(){
		$(document).on('click', '.product-loop .product-btn.quick-view', function(e){
			e.stopPropagation();
			e.preventDefault();
			WEBDS.Quickview.qv_data_main = {};
			WEBDS.Quickview.qv_data_color = []
			WEBDS.Quickview.current_variant = null;
			
			var sku = $(this).attr('data-sku');
			var handle = $(this).attr('data-handle');
			var id = $(this).attr('data-id');
			var vid = $(this).attr('data-variantid');
			var urlnew = handle+'.js';
			var html = '';

			$.ajax({
				type: 'GET',
				url: handle+(handle.indexOf('?') > -1?'&':'?')+"view=quickview",
				async: false,
				success: function(data){
					html = data;       
					$.get(urlnew).done(function(datanew){
						$('#sidebar-quickview .sidebar-foot a.btn-link').attr('href',handle);
						$('#sidebar-quickview .ajaxSidebarQv').html(html);
						$('body, html').addClass('open-sidebar-quickview lock-scroll');
						$('#quickview-select').val('');

            WEBDS.Quickview.qv_data_main = datanew;
            WEBDS.Quickview.current_variant = null;
            WEBDS.Quickview.ProductDetail.init();
						
					});
        
				}
			});

		});			
		$(document).on('click','#qv-btn-addtocart:not(.loading):not(.disabled)', function(e){
			e.preventDefault();
			var item = {
				'img': $(this).parents('.sidebar-quickview').find('.qv-gallery--item:first-child img').attr('src'),
				'title': $(this).parents('.sidebar-quickview').find('.qv-infos--heading').html(),
				'price': $(this).parents('.sidebar-quickview').find('.qv-infos--prices .price-current').html(),
				'compare_price': $(this).parents('.sidebar-quickview').find('.qv-infos--prices .price-compare').html()
			}
			var quantity = 1;
			var id =  $('#quickview-select').val();
      var btn = $(this);
			var param = {
				type: 'POST',
				url: '/cart/add.js',
				data:  { id: id, quantity: quantity },
				dataType: 'json',
				success: function(datacart) {
          btn.addClass('added');
					if (template.indexOf('cart') > -1){
						window.location.reload(); 
					}
					else {
						WEBDS.Global.cartAjax(function(){
							$('#mainLoading').removeClass('active');	
							$('body, html').removeClass('open-sidebar-quickview lock-scroll');
              setTimeout(function(){
                $('html,body').addClass('open-sidebar-cart lock-scroll');
                btn.removeClass('added');
              },1000);
						});
					}
				},
				error: function(XMLHttpRequest, textStatus) {
					if ( XMLHttpRequest.status == 422 ){
						WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
					}
				}
			}
					
			var isValid = true;
			var soldoutAllSize = false;
			var lenghtSize = $('.qv-select-swatch .qv-swatch.qv-swatch-size .qv-select-swap label').length;
			var lenghtSoldoutSize = $('.qv-select-swatch .qv-swatch.qv-swatch-size .qv-select-swap label.soldout').length;
			$('.qv-select-swatch .qv-swatch.qv-swatch-size').each(function(){
				if($(this).find('.qv-select-swap').html() != '' && $(this).find('.qv-select-swap .sd').length == 0){
					isValid = false;
				}
			});
			if (lenghtSize == lenghtSoldoutSize) soldoutAllSize = true;	
			
			if(isValid){
				if (template.indexOf('cart') == -1){
					$('#mainLoading').addClass('active');
					$('#qv-btn-addtocart').addClass('loading');
				}
				$.ajax(param);
				$('#qv-btn-addtocart').removeClass('loading');
			}
			else {
				$('.qv-variant-selector-error').removeClass('d-none');
			}
		});
	},
  /*
	renderProductDetail: {
		init: function(){
			var that = this;
			that.renderInfo(WEBDS.Quickview.qv_data_main.variants[0]);
			that.renderColor();
			that.renderSize();
			that.selectCall();
			that.changeImage();
		},
		renderInfo: function(current) {
			var variant = current;
			if(variant.price < variant.compare_at_price){
				var pro_sold = variant.price;
				var pro_comp = variant.compare_at_price / 100;
				var sale = 100 - (pro_sold / pro_comp);
				var kq_sale = Math.round(sale);
				$('.quickviewdetail-info .qv-price del').html(Haravan.formatMoney(variant.compare_at_price, window.shop.moneyFormat).replaceAll(',','.')).removeClass('d-none');
				$('.quickviewdetail-info .qv-price del').removeClass('d-none');
				$('.quickviewdetail-info .qv-price span').html(Haravan.formatMoney(variant.price,window.shop.moneyFormat).replaceAll(',','.'));
				$('.quickviewdetail-info .qv-price span').addClass('reduced').attr('content',variant.price / 100);
			} 
			else {
				$('.quickviewdetail-info .qv-price span.price').html(Haravan.formatMoney(variant.price, window.shop.moneyFormat).replaceAll(',','.'));
				$('.quickviewdetail-info .qv-price span.price').removeClass('reduced').attr('content',variant.price / 100);
				$('.quickviewdetail-info .qv-price del').addClass('d-none');
			}

			if(variant.price > 0){
				$('.sidebar-quickview #qv-btn-addtocart').removeClass('d-none');
				if(WEBDS.Quickview.qv_data_main.available && variant.price > 0){
					if(variant.available){
						$('.quickviewdetail-info').removeClass('isSoldout');
						$('.sidebar-quickview #qv-btn-addtocart').removeClass('disabled').prop('disabled', false); 
					}
					else {}
				}
				else{
					$('.quickviewdetail-info').addClass('isSoldout');
					$('.sidebar-quickview #qv-btn-addtocart').addClass('disabled').prop('disabled', true);
				}
			}
			else {
				$('.sidebar-quickview #qv-btn-addtocart').addClass('d-none');
			}		
		},
		renderColor: function(){		
      var ind_color = -1;
			var option_index = WEBDS.Quickview.qv_data_main.options.map(opt => { return opt.name });
			if(option_index.indexOf('Màu sắc') > -1 ) ind_color = option_index.indexOf('Màu sắc');
            
			if(ind_color > -1){
				var unique_color = [];
				var html_color = '';
				var cout_color = 0;
				WEBDS.Quickview.qv_data_main.variants.map((vr) => {
					var key_opt = 'option'+(ind_color+1);
					var color = vr[key_opt];
					if(!unique_color.includes(color)){
						unique_color.push(color);
						var bg_color = '#f6f6f6', bg_img = '';

						if(vr.featured_image != null){
							bg_img = Haravan.resizeImage(vr.featured_image.src,'medium');
						}
						else {
							bg_img = Haravan.resizeImage(WEBDS.Quickview.qv_data_main.featured_image,'medium');
						}

						var class_soldout = '';
						if(WEBDS.Quickview.qv_data_main.options.length == 1 && !vr.available) class_soldout = 'unavai';
						else{
							if(WEBDS.Quickview.qv_data_main.options.length > 1){
								var check_available = WEBDS.Quickview.qv_data_main.variants.filter(vr1 => vr1[key_opt] == color && vr1.available);
								if(check_available.length == 0) class_soldout = 'unavai';
							}
						}

						html_color += `<div class="qv-swatch-element"><label class="aspect-ratio ${class_soldout}" ${bg_img != '' ? 'style="background: url('+bg_img+') no-repeat; background-size: cover;background-position: bottom center;"' : ''} data-value="${color}"><span class="swatch-bg--color" data-color="${WEBDS.Helper.change_alias(color)}">${color}</span></label></div>`;
						cout_color++;
					}
				});
				$('.qv-select-swap--color').html(html_color);
			}
			else{
				$('.qv-swatch-color').remove();
			}
		},
		renderSize: function(){
      var ind_size = -1;
			var option_index = WEBDS.Quickview.qv_data_main.options.map(opt => { return opt.name });
			if(option_index.indexOf('Kích thước') > -1 ) ind_size = option_index.indexOf('Kích thước');

			if(ind_size > -1){
				var unique_size = [];
				var html_size = '';
				WEBDS.Quickview.qv_data_main.variants.map((vr) => {
					var key_opt = 'option'+(ind_size + 1);
					var size = vr[key_opt];
					var class_soldout = '';
					if(WEBDS.Quickview.qv_data_main.options.length == 1 && !vr.available) class_soldout = 'soldout';

					if(!unique_size.includes(size)){
						unique_size.push(size);
						html_size += `<div class="qv-swatch-element"><label class="aspect-ratio ${class_soldout}" data-value="${size}">${size}</label></div>`;
					}
				});
				$('.qv-select-swap--size').html(html_size);
			}
			else{
				$('.qv-swatch-size').remove();
			}
		},
    selectCall: function(){
      var self = this;
      var target_color = $(document).find('.qv-select-swap--color label:not(.soldout)');
      target_color.hover(function(){
        var color = $(this).attr('data-value');
        $('.qv-swatch-header.color .title span:eq(1)').html(color);
      },function(){
        var color = $('.qv-select-swap--color label.sd').attr('data-value');
        $('.qv-swatch-header.color .title span:eq(1)').html(color);
      });
      
      $(document).on('click','.qv-select-swap--color label:not(.soldout)',function(){
        var color = $(this).attr('data-value');
        $('.qv-swatch-header.color .title span:eq(1)').html(color);
        $('.qv-select-swap--color label').removeClass('sd');
        $(this).addClass('sd');
        
        var first_id = '', size_first = '', first_sku = '';
        if($('.qv-select-swap--size').length > 0){
          $('.qv-select-swap--size label').each(function(){
            var size = $(this).attr('data-value');
            var available = WEBDS.Quickview.qv_data_main.variants.filter(variant => variant.options.includes(color) && variant.options.includes(size) );
            if(available.length > 0 && available[0].available){
              $(this).removeClass('soldout');
              if($('.qv-select-swap--size label.sd').length > 0){
                if($(this).hasClass('sd')){
                  first_id = available[0].id;
                  size_first = size;
                  first_sku = available[0].sku;
									self.renderInfo(available[0]);
                } 
              } 
              else if(first_id == ''){
                first_id = available[0].id;
                size_first = size;
                first_sku = available[0].sku;
								self.renderInfo(available[0]);
                $(this).removeClass('soldout').addClass('sd');
              }
            }
            else{
              $(this).addClass('soldout').removeClass('sd');
            }
          });
        }
        else {
          var available = WEBDS.Quickview.qv_data_main.variants.filter(variant => variant.options.includes(color) );
          if(available.length > 0 && available[0].available){
            first_id = available[0].id;
            first_sku = available[0].sku;
						self.renderInfo(available[0]);
          }
        }
        
				// Hide Function - Change color render size - trigger available variant 
        if(first_id != ''){
          if($('.qv-select-swap--size').length > 0 && $('.qv-select-swap--size label.sd').length == 0){
            $('.qv-select-swap--size label[data-value="'+size_first+'"]').addClass('sd');
          }
          $('#quickview-select').val(first_id);
          $('#quickview-select').attr('data-sku',first_sku);
          $('#qv-btn-addtocart').removeClass('disabled').removeAttr('disabled');
        }
        else{
          $('#qv-btn-addtocart').addClass('disabled').attr('disabled',true);
        }
												
      });
      if($('.qv-select-swap--color').length > 0) $('.qv-select-swap--color .qv-swatch-element:eq(0) label').click();
			
      $(document).on('click','.qv-select-swap--size label:not(.soldout)',function(){
        var size = $(this).attr('data-value');
        $('.qv-select-swap--size label').removeClass('sd');
        $(this).addClass('sd');
				
				if($('.qv-select-swap--size label.sd').length > 0){
					$("#qv-btn-addtocart").removeClass('req-size');
				}
        
        var first_id = '', first_sku = '', first_imgvrt = '';
        
        if($('.qv-select-swap--color').length > 0){
          var color = $('.qv-select-swap--color label.sd').attr('data-value');
          var available = WEBDS.Quickview.qv_data_main.variants.filter(variant => variant.options.includes(color) && variant.options.includes(size) );
          if(available.length > 0 && available[0].available){
            first_id = available[0].id;
            first_sku = available[0].sku;
            first_imgvrt = available[0].featured_image;
						self.renderInfo(available[0]);
          }
        }
        else{
          var available = WEBDS.Quickview.qv_data_main.variants.filter(variant => variant.options.includes(size) );
          if(available.length > 0 && available[0].available){
            first_id = available[0].id;
            first_sku = available[0].sku;
            first_imgvrt = available[0].featured_image;
						self.renderInfo(available[0]);
          }
        }
        
        if(first_id != ''){
          $('#quickview-select').val(first_id);
          $('#quickview-select').attr('data-sku',first_sku);
          $('#qv-btn-addtocart').removeClass('disabled').removeAttr('disabled');    
        }
        else{
          $('#qv-btn-addtocart').addClass('disabled').attr('disabled',true);
        }
				
      });
    },
		changeImage: function(color){
			WEBDS.Quickview.slideImage = new Swiper('#qv-main-slider', {
        direction: 'vertical',
        spaceBetween: 5,
        slidesPerView: 2,
        freeMode: true,
        autoHeight: true, 
        watchSlidesProgress: true,
        navigation: {
          nextEl: '.quickviewdetail-gallery .swiper-next', 
          prevEl: '.quickviewdetail-gallery .swiper-prev',
        },
        breakpoints: {
          0: {
            direction: 'horizontal',
            slidesPerView: 4
          },
          1200: {
            direction: 'vertical',
            slidesPerView: 'auto'
          }
        }
			});
      $("#qv-main-slider .qv-gallery--item").first().find('.quickviewdetail-img').addClass('current');
      $("#qv-main-slider .qv-gallery--item .quickviewdetail-img").click(function(){
    		var img_thumb = $(this).attr('data-image');
        $("#qv-main-slider .qv-gallery--item .quickviewdetail-img").removeClass('current');
        $(this).addClass('current');
        $(".quickviewdetail-mainfeature img").attr("src",$(this).attr("data-image"));
    	});
		},
	}
  */

  VariantEngine: {
    product: null,
    optionMap: {},
    variantMap: {},
    selected: {},
    init: function(product) {
      this.product = product || {};
      this.optionMap = {};
      this.variantMap = {};
      this.selected = {};
      this.buildOptionMap();
      this.buildVariantMap();
      return this;
    },
    normalize: function(value) {
      if (value == null) {
          return '';
      }
      return String(value)
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');
    },
    getOptionValue: function(variant, index) {
      if (!variant) {
          return '';
      }   
      return String(variant['option' + (Number(index) + 1)] || '').trim();  
    },
    getOptionStyle: function(optionName) {
      var alias = this.normalize(optionName);
      if (['mau','mausac','color','colour'].indexOf(alias) > -1) {
          return 'color';
      }
      if (['kichthuoc','kichco','size','sizes'].indexOf(alias) > -1) {
          return 'size';
      }
      if (['chatlieu','material'].indexOf(alias) > -1) {
          return 'material';
      }
      return 'default';
    },
    getColorImage: function(color) {
      var self = this;
      var product = self.product || {};
      var variants =
          Array.isArray(product.variants)
              ? product.variants
              : [];
    
      // Tìm index của option Màu
      var colorIndex = -1;  
      Object.keys(self.optionMap).some(function(index) {
        index = Number(index);  
        var option = self.optionMap[index];  
        var style = self.getOptionStyle( option.name );
        if (style === 'color') {
            colorIndex = index; 
            return true;
        }  
        return false;  
      });
      // Không có option màu
      if (colorIndex < 0) {
          return '';
      }  
      // Tìm variant có value màu tương ứng
      var variant = variants.find(function(item) {
          var variantColor = self.getOptionValue(item,colorIndex);
          return (
              String(variantColor) === String(color)
          );
      });
   
      var bgImage = '';  
      // Ưu tiên ảnh của variant
      if (variant && variant.featured_image ) {
        bgImage = Haravan.resizeImage(variant.featured_image.src, 'medium' );
      }
      // Không có ảnh variant => dùng ảnh product
      else if (product.featured_image) {
        if (typeof product.featured_image === 'object' && product.featured_image.src ) {
          bgImage = Haravan.resizeImage( product.featured_image.src, 'medium' );
        }
        else {
          bgImage = Haravan.resizeImage(product.featured_image, 'medium');
        }
      } 
      // Ưu tiên icon_color
      if (typeof icon_color !== 'undefined' && Array.isArray(icon_color) && icon_color.length ) {
        var icon = icon_color.find(function(item) {
          if (!item || !item.alt) {
            return false;
          }
          return (
            String(item.alt).toLowerCase().indexOf(String(color).toLowerCase()) > -1
          );
        });
        if (icon) {  
            bgImage = icon.src;
        }
      }

      return bgImage;
  },
    normalizeOptionName: function(option) {
      if (typeof option === 'string') {
          return option.trim();
      }
      if (option && typeof option === 'object') {
          return String(
              option.name ||
              option.title ||
              option.label ||
              ''
          ).trim();
      }
      return '';
    },
    buildOptionMap: function() {
      var self = this;
      self.optionMap = {};
    
      var options =
          Array.isArray(self.product.options)
              ? self.product.options
              : [];
    
      options.forEach(function(option, index) {
          var name = self.normalizeOptionName(option);
          if (!name) {
              return;
          }
          self.optionMap[index] = {
              index: index,
              name: name,
              values: []
          };
      });

      // Lấy toàn bộ value từ variants
      var variants =
          Array.isArray(self.product.variants)
              ? self.product.variants
              : [];

      variants.forEach(function(variant) {
        Object.keys(self.optionMap).forEach(
          function(index) {
            index = Number(index);
            var key = 'option' + (index + 1);
            var value = variant[key];
            if (value == null || value === '') {
                return;
            }
            value = String(value);
            if (self.optionMap[index].values.indexOf(value) === -1) {
                self.optionMap[index]
                    .values
                    .push(value);
            }
          }
        );
      });

      return self.optionMap;
    },   
    // BUILD VARIANT MAP
    buildVariantMap: function() {
      var self = this;
      self.variantMap = {};
    
      var variants =
          Array.isArray(self.product.variants)
              ? self.product.variants
              : [];

      variants.forEach(function(variant) {
        var options = [];
        Object.keys(self.optionMap).forEach(function(index) {
            index = Number(index);
            options.push(
                variant[
                    'option' + (index + 1)
                ] || ''
            );
        });
      
        var key = self.createVariantKey(options);
        self.variantMap[key] = variant;
      });
    
      return self.variantMap;
    },
    // CREATE VARIANT KEY
    createVariantKey: function(values) {
      return (values || [])
        .map(function(value) {
            return String(
                value == null
                    ? ''
                    : value
            ).trim();
        })
        .join('||');
    },
    // GET SELECTED
    getSelected: function() {
      return $.extend(
          {},
          this.selected
      );
    },
    /* -----------------------------------------------------
     * SET SELECTED
     * Chọn option index nào thì giữ lại các option trước đó.
     * Reset các option phía sau.
     * ----------------------------------------------------- */
    setSelected: function(index, value) {
        var self = this;
        index = Number(index);
        value = String(value);
        self.selected[index] = value;
        // Reset option phía sau
        Object.keys(self.selected).forEach(
          function(key) {
            if (Number(key) > index) {
                delete self.selected[key];
            }
          }
        );
        return self.getSelected();
    },
    // CLEAR SELECTED
    clearSelected: function() {
        this.selected = {};
        return this;
    },
    // FIND VARIANT - Chỉ tìm khi user đã chọn đủ option.
    findVariant: function() {
      var self = this;
      var optionIndexes = Object.keys(self.optionMap);
      // Chưa chọn đủ option
      for (var i = 0; i < optionIndexes.length; i++ ) {
          var index = Number(optionIndexes[i]);
          if (self.selected[index] == null) {
              return null;
          }
      }
      // Build key
      var values = [];
      for (var j = 0; j < optionIndexes.length; j++) {
          var selectedIndex = Number(optionIndexes[j]);
          values.push(self.selected[selectedIndex]);
      }
      var key = self.createVariantKey(values);
    
      return (
          self.variantMap[key] ||
          null
      );
    },
    /* -----------------------------------------------------
     * FIND AVAILABLE VARIANT
     *
     * Tìm variant phù hợp với những option
     * user đã chọn, nhưng không bắt buộc chọn đủ.
     * ----------------------------------------------------- */
    findAvailableVariant: function(extraIndex,extraValue) {
      var self = this;
      var variants =
          Array.isArray(self.product.variants)
              ? self.product.variants
              : [];
    
      return variants.find(function(variant) {
        if (!variant.available) {
            return false;
        }
        // Kiểm tra option hiện tại
        if (extraIndex != null) {
            var currentValue = variant[ 'option' + (Number(extraIndex) + 1) ];
            if ( String(currentValue) !== String(extraValue)) {
                return false;
            }
        }
        // Kiểm tra các option đã được chọn
        return self.isVariantMatch(
            variant,
            extraIndex
        );
      });
    },
    /* -----------------------------------------------------
     * CHECK VARIANT MATCH
     * ----------------------------------------------------- */
    isVariantMatch: function(variant,ignoreIndex) {
      var self = this;
      for (var index in self.selected) {
        if (!self.selected.hasOwnProperty(index)) {
            continue;
        }
        index = Number(index);
        // Bỏ qua option hiện tại
        if (ignoreIndex != null && index === Number(ignoreIndex)) {
            continue;
        }

        var selectedValue = self.selected[index];
        var variantValue =
            variant[
                'option' +
                (index + 1)
            ];

        if (String(variantValue) !== String(selectedValue) ) {
            return false;
        }
      }
      return true;
    },
    /* -----------------------------------------------------
     * CHECK AVAILABILITY
     *
     * Không cần biết đây là màu, size,
     * chất liệu hay bất kỳ option nào.
     * ----------------------------------------------------- */
    checkAvailability: function(optionIndex,value) {
        return !!this.findAvailableVariant(
            optionIndex,
            value
        );
    },
    /* -----------------------------------------------------
     * UPDATE AVAILABILITY
     * ----------------------------------------------------- */
    updateAvailability: function() {
      var self = this;
      $('[data-variant-option]').each(function() {
        var $item = $(this);
        var index = Number($item.attr('data-option-index'));
        var value = $item.attr('data-value');
        var available = self.checkAvailability(index,value);
        $item.toggleClass('soldout',!available).toggleClass('unavai',!available);
  
        /*
         * Nếu option đang selected
         * nhưng không còn available
         * thì bỏ selected.
         */
        if (!available && String(self.selected[index]) === String(value)) {
            delete self.selected[index];
            $item.removeClass('sd');
        }
      });
    },
    /* -----------------------------------------------------
     * UPDATE SELECTED UI
     * ----------------------------------------------------- */
    updateSelectedUI: function() {
      var self = this;
      $('[data-variant-option]').each(function() {
          var $item = $(this);
          var index = Number($item.attr('data-option-index'));
          var value = $item.attr('data-value');
          var selected = self.selected[index] != null && String(self.selected[index]) === String(value);
          $item.toggleClass('sd',selected);
      });
    },
    /* -----------------------------------------------------
     * UPDATE UI
     * ----------------------------------------------------- */
    updateUI: function() {
      var self = this;
      // Availability
      self.updateAvailability();
      // Selected state
      self.updateSelectedUI();
      // Find variant
      var variant = self.findVariant();
      // Có variant hoàn chỉnh
      if (variant) {
          WEBDS.Quickview.ProductDetail.renderInfo(variant);
          $('#quickview-select').val(variant.id).attr('data-sku',variant.sku || '');
          $('#qv-btn-addtocart').removeClass('disabled').prop('disabled',false);
          WEBDS.Quickview.ProductDetail.updateGallery(variant);
      }
      // Chưa chọn đủ option
      else {
        $('#quickview-select').val('').attr('data-sku','');
        // Chưa đủ variant  => không cho add cart
        $('#qv-btn-addtocart').addClass('disabled').prop('disabled',true);
      }
      // Update label
      self.updateOptionLabels();
    },
    /* -----------------------------------------------------
     * UPDATE OPTION LABEL
     * ----------------------------------------------------- */
    updateOptionLabels: function() {
      var self = this;
      $('[data-option-header]').each(function() {
          var $header = $(this);
          var index = Number($header.attr('data-option-header'));
          var value = self.selected[index];
          $header.find('[data-option-value]').html(value || '');
      });
    }
  },
  ProductDetail: {
    init: function() {
      var self = this;
      var product = WEBDS.Quickview.qv_data_main;
      if (!product || !Array.isArray(product.variants)) {
          return;
      }
      // INIT ENGINE
      WEBDS.Quickview.VariantEngine.init(product);
      // RENDER OPTIONS
      self.renderOptions();
      // RENDER GALLERY
      self.renderGallery();
      // DEFAULT VARIANT
      self.initDefaultVariant();
      // EVENTS
      self.bindEvents();
    },
    /* -----------------------------------------------------
     * DEFAULT VARIANT
     * ----------------------------------------------------- */
    initDefaultVariant: function() {
      var engine = WEBDS.Quickview.VariantEngine;
      var product = WEBDS.Quickview.qv_data_main;
      // Ưu tiên variant đang current
      var variant = WEBDS.Quickview.current_variant;
      // Nếu không có thì lấy variant available đầu tiên
      if (!variant) {
          variant = product.variants.find(function(item) {
            return (
                item.available &&
                Number(item.price) > 0
            );
          });
      }
      // Fallback variant đầu tiên
      if (!variant) {
          variant = product.variants[0];
      }
      if (!variant) {
          return;
      }
      // Set selected
      (variant.options || []).forEach(function(value, index) {
          engine.selected[index] = String(value);
      });
      // Update
      engine.updateUI();
    },
    /* -----------------------------------------------------
     * RENDER ALL OPTIONS
     * ----------------------------------------------------- */
    renderOptions: function() {
      var self = this;
      var engine = WEBDS.Quickview.VariantEngine;
      // Xóa HTML cũ
      $('.qv-variant-options').empty();
      Object.keys(engine.optionMap).forEach(
        function(index) {
            index = Number(index);
            var option = engine.optionMap[index];
            var html = self.renderOption(option);
            $('.qv-variant-options').append(html);
        }
      );
    },
    /* -----------------------------------------------------
     * RENDER ONE OPTION
     * ----------------------------------------------------- */
    renderOption: function(option) {
      var self = this;
      var engine = WEBDS.Quickview.VariantEngine;
      // Xác định style của option
      var optionStyle = engine.getOptionStyle(option.name); 
      var html = ''; 
      html += '<div class="qv-variant-group qv-option--' + optionStyle + '" data-option-group="' + option.index + '" data-option-style="' + optionStyle + '">';
      html += '<div class="qv-swatch-header" data-option-header="' + option.index + '"><span class="title"><span>' + self.escapeHtml(option.name) + '</span><span data-option-value></span></span></div>';
      html += '<div class="qv-variant-values qv-variant-values--' + optionStyle + '" data-option-values="' + option.index + '">';        
      option.values.forEach(function(value) {
        html += self.renderOptionItem(
            option,
            value,
            optionStyle
        );
      });
      html += '</div>';
      html += '</div>';
      return html;
    },
    renderOptionItem: function(option,value,optionStyle) {
      var self = this;
      var engine = WEBDS.Quickview.VariantEngine;
      var html = '';
      var bgImage = ''; 
      if (optionStyle === 'color') {
        bgImage = engine.getColorImage(value);
      }
      var styleAttr = '';
      if (bgImage) {    
        styleAttr = 'style="background-image:url(\'' + bgImage + '\');background-repeat:no-repeat;background-size:cover;background-position:center;"';
      }
      var content = '';
      if (optionStyle === 'color') { 
        content = '<span class="swatch-bg--color" data-color="' + WEBDS.Helper.change_alias(value) + '">' + self.escapeHtml(value) +'</span>';
      }
      else {    
        content = '<span>' + self.escapeHtml(value) + '</span>';
      }
      
      html += '<div class="qv-swatch-element">';
      html +=  '<label class="aspect-ratio qv-option-item qv-option-item--' + optionStyle + '" data-variant-option data-option-index="' + option.index + '" data-option-style="' + optionStyle + '" data-value="' + self.escapeHtml(value) + '" ' + styleAttr + '>' + content + '</label>';
      html += '</div>';
      
      return html
    },
    /* -----------------------------------------------------
     * ESCAPE HTML
     * ----------------------------------------------------- */
    escapeHtml: function(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    /* -----------------------------------------------------
     * BIND EVENTS
     * ----------------------------------------------------- */
    bindEvents: function() {
        var self = this;
        // Remove event cũ
        $(document).off('click.qvVariant', '[data-variant-option]');
        // CLICK OPTION
        $(document).on('click.qvVariant', '[data-variant-option]:not(.soldout):not(.unavai)', function() {debugger;
          var $item = $(this);
          var index = Number($item.attr('data-option-index'));
          var value = $item.attr('data-value');
          var engine = WEBDS.Quickview.VariantEngine;
          // Set option
          engine.setSelected(index,value);
          // Update toàn bộ variant UI
          engine.updateUI();
        });
    },
    /* -----------------------------------------------------
     * RENDER INFO
     * ----------------------------------------------------- */
    renderInfo: function(variant) {
      if (!variant) {
          return;
      }
      var product = WEBDS.Quickview.qv_data_main;
      var price = Number(variant.price) || 0;
      var comparePrice = Number(variant.compare_at_price) || 0;
      // PRICE
      if (comparePrice > price && price > 0) {
          var sale = Math.round((comparePrice - price) / comparePrice *100);
          $('.quickviewdetail-info .qv-price del').html(Haravan.formatMoney(comparePrice,window.shop.moneyFormat).replaceAll(',', '.'));
          $('.quickviewdetail-info .qv-price span.price').html(Haravan.formatMoney(price,window.shop.moneyFormat).replaceAll(',', '.')).addClass('reduced').attr('content',price / 100);
          $('.quickviewdetail-info .qv-price span.price-percent').html('-' + sale + '%');
          $('.quickviewdetail-info .qv-price span.price-compare').removeClass('d-none');
      }
      else {
          $('.quickviewdetail-info .qv-price span.price-compare').addClass('d-none');
          $('.quickviewdetail-info .qv-price span.price').html(Haravan.formatMoney(price,window.shop.moneyFormat).replaceAll(',', '.')).removeClass('reduced').attr('content',price / 100);
      }
      // SOLD OUT
      var available = !!(product.available && variant.available && price > 0);
      if (!available) {
          $('.quickviewdetail-info').addClass('isSoldout');
          $('#qv-btn-addtocart').addClass('disabled').prop('disabled',true);
      }
      else {
          $('.quickviewdetail-info').removeClass('isSoldout');
          $('#qv-btn-addtocart').removeClass('disabled').prop('disabled',false);
      }
      this.updateGallery(variant);
    },
    /* -----------------------------------------------------
     * UPDATE GALLERY
     * ----------------------------------------------------- */
    updateGallery: function (variant) {
      if (!variant || !variant.featured_image || !variant.featured_image.src) {
          return;
      } 
      var swiper = window.qvGalleryMain;  
      if (!swiper || typeof swiper.slideTo !== 'function') {
          return;
      }
      //Normalize image URL
      var normalizeImage = function (url) {
          if (!url) {
              return '';
          }
          return String(url).replace(/^https?:/, '').split('?')[0];
      };  
      var imageSrc = normalizeImage(Haravan.resizeImage(variant.featured_image.src,'master'));
      var index = -1; 
      //Find gallery slide
      $('.qv-gallery[data-image]').each(function () {
        var currentSrc = normalizeImage($(this).attr('data-image'));  
        if (currentSrc === imageSrc) {
            index = $(this).closest('.swiper-slide').index();
            return false;
        }
      });
      //Không tìm thấy slide
      if (index < 0) {
          return;
      }  
      //Slide tới variant image
      swiper.slideTo(index,300);  
    },
    /* -----------------------------------------------------
     * RENDER GALLERY
     * ----------------------------------------------------- */
    renderGallery: function () {
      //* Destroy swiper cũ nếu tồn tại
      if (window.qvGalleryThumbs && typeof window.qvGalleryThumbs.destroy === 'function') {
          window.qvGalleryThumbs.destroy(true,true);
          window.qvGalleryThumbs = null;
      }
      if (window.qvGalleryMain && typeof window.qvGalleryMain.destroy === 'function') {
          window.qvGalleryMain.destroy(true,true);
          window.qvGalleryMain = null;
      }
      
      function syncThumbHeight() {
        var mainHeight = document.querySelector('.quickviewdetail-gallery').offsetHeight;
        $(".quickviewdetail-media").attr(`style`,`--height-gallery-main: ${mainHeight}px`)
        if ($('.qv-gallery-thumbs').length > 0) {
          document.querySelector('.qv-gallery-thumbs').style.height = mainHeight + 'px';
        }
      }
      window.addEventListener('load', syncThumbHeight);
      window.addEventListener('resize', syncThumbHeight);
      
      if ($('.qv-gallery-thumbs .swiper-slide').length > 0) { 
        var countImg = Number($('.qv-gallery-thumbs').attr('data-size'));
        /* =================================================
         * THUMB
         * ================================================= */
        window.qvGalleryThumbs =
          new Swiper('.qv-gallery-thumbs', {
            autoHeight: true,
            direction: 'vertical',
            slidesPerView: 'auto',
            mousewheel: true,
            spaceBetween: 8,
            freeMode: true,
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            slideToClickedSlide: true,
            observer: true,
            observeParents: true,
            breakpoints: {
              0: {
                direction: 'horizontal',
                slidesPerView: 4,
                spaceBetween: 8
              },
              768: {
                direction: 'vertical',
                slidesPerView: 'auto',
                spaceBetween: 8
              },
              1200: {
                direction: 'vertical',
                slidesPerView: 5,
                spaceBetween: (countImg <= 5 ? 0 : 8)
              }
            }
          });
  
        /* =================================================
         * MAIN
         * ================================================= */
        window.qvGalleryMain =
          new Swiper('.qv-gallery-main', {
            slidesPerView: 1,
            loop: false,
            thumbs: {
                swiper: window.qvGalleryThumbs
            },
            navigation: {
                nextEl: '.qv-gallery-main .swiper-next',
                prevEl: '.qv-gallery-main .swiper-prev'
            }
          });

        /* =================================================
         * Change
         * ================================================= */
        window.qvGalleryMain.on('slideChange', function () {
          const activeIndex = window.qvGalleryMain.activeIndex;
          window.qvGalleryThumbs.slideTo(activeIndex, 300);
        });
      }      
    },
  }
}
WEBDS.Wishlist = {
  cookieName: 'wishlist_products',
  cookieDays: 30,
  init: function() {
    var that = this;
    that.bindEvents();
    if(template.indexOf('page.wishlist') > -1){
      that.getWishlistProducts();
    }
  },
  get: function() {
    var that = this;
    var cookies = document.cookie.split('; ');
    var cookie = null;
    $.each(cookies, function(index, item) {
        if (item.indexOf(that.cookieName + '=') === 0) {
            cookie = item;
            return false;
        }
    });
    if (!cookie) {
        return [];
    }
    try {
        var value = cookie.substring(
            (that.cookieName + '=').length
        );
        return JSON.parse(decodeURIComponent(value)) || [];
    } catch (e) {
        return [];
    }
  },
  set: function(list) {
    var that = this;
    document.cookie =
        that.cookieName + '=' +
        encodeURIComponent(JSON.stringify(list)) +
        '; path=/' +
        '; max-age=' + (that.cookieDays * 24 * 60 * 60);
  },
  has: function(handle) {
    var list = this.get();
    return list.indexOf(handle) !== -1;
  },
  add: function(handle) {
    var that = this;
    var list = that.get();
    if (!handle) {
        return;
    }
    if (list.indexOf(handle) === -1) {
        list.push(handle);
        that.set(list);
    }
    return list;
  },
  remove: function(handle) {
    var that = this;
    var list = that.get();
    list = list.filter(function(item) {
        return item !== handle;
    });
    that.set(list);
    return list;
  },
  toggle: function(handle) {
    var that = this;
    if (!handle) {
        return;
    }
    if (that.has(handle)) {
        return that.remove(handle);
    }
    return that.add(handle);
  },
  bindEvents: function() {
    var that = this;
    $(document).on('click', '.js-wishlist', function(e) {
      e.preventDefault();
      var $button = $(this);
      var handle = $button.attr('data-handle');
      if (!handle) {
          return;
      }
      handle = String(handle).trim();
      that.toggle(handle);
      $button.toggleClass(
        'is-active',
        that.has(handle)
      );
      if(template.indexOf('page.wishlist') > -1){
        location.reload();
      }
      console.log('Wishlist:', that.get());
    });
  },
  /**
   * Render trạng thái wishlist
   * Gọi hàm này SAU KHI API render product
   */
  checkActiveWishlist: function($container) {
    var that = this;
    var list = that.get();
    $container = $container || $(document);
    $container.find('.js-wishlist').each(function() {
      var $button = $(this);
      var handle = $button.attr('data-handle');
      if (!handle) {
          return;
      }
      handle = String(handle).trim();
      $button.toggleClass(
          'is-active',
          list.indexOf(handle) !== -1
      );
    });
  },
  getHandles: function() {
    var cookieName = this.cookieName + '=';
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf(cookieName) === 0) {
            try {
                var value = cookies[i].substring(cookieName.length);
                var handles = JSON.parse(decodeURIComponent(value));
  
                return Array.isArray(handles) ? handles : [];
            } catch (e) {
                return [];
            }
        }
    }
    return [];
  },
  getWishlistProducts: function() {
    var that = this;
    var handles = that.getHandles();
    // Không có wishlist
    $('.wishlist-product-list').html('');
    if (!handles.length) {
       $('.wishlist-product-list').html('<div class="wishlist-empty">Chưa có sản phẩm nào được lưu vào danh sách!</div>');
       return;
    }
    $.get("/search.js?q=filter=(handle:product in " + handles.join(',') + ")&page=1&limit=8").done(function(res) {
        if (!res || !res.products || !res.products.length) {
           $('.wishlist-product-list').html('<div class="wishlist-empty">Chưa có sản phẩm nào được lưu vào danh sách!</div>');
           return;
        }       
        var html = '';
        $.each(res.products, function(ind, product) {
          html += `<div class="product-loop normal">` + WEBDS.Global.renderLoop(product, ind) + `</div>`;
          console.log(product);
        });
        $('.wishlist-product-list').html(html);

        setTimeout(function() {
          $('.wishlist-product-list').find('.js-wishlist').each(function() {
            $(this).addClass('is-active');
          });
        },300);
      
    }).fail(function(xhr) {
        console.error('Wishlist API error:', xhr );
        $('.wishlist-product-list').html('<div class="wishlist-empty">Chưa có sản phẩm nào được lưu vào danh sách!</div>');
    });
  },
};
WEBDS.RegionPopup = {
  cookieName: 'region_popup_choice',
  sessionCookieName: 'region_popup_closed',
  cookieDays: 7,
  init: function() {
    var that = this;
    var $popup = $('#popup-region');
    if (!$popup.length || that.getCookie(that.cookieName) || that.getCookie(that.sessionCookieName)) return;
    that.$popup = $popup;
    that.bindEvents();
    that.open();
  },
  open: function() {  
    this.$popup.removeAttr('hidden').addClass('is-open');
    $('body').addClass('popup-region-open');
  },
  close: function() {
    this.$popup.removeClass('is-open').attr('hidden', true);
    $('body').removeClass('popup-region-open');
  },
  remember: function(value) {
    document.cookie = this.cookieName + '=' + value + '; path=/; max-age=' + (this.cookieDays * 24 * 60 * 60);
  },
  dismissSession: function() {
    document.cookie = this.sessionCookieName + '=1; path=/';
  },
  getCookie: function(name) {
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
      if (cookies[i].indexOf(name + '=') === 0) return cookies[i].substring(name.length + 1);
    }
    return null;
  },
  bindEvents: function() {
    var that = this;
    that.$popup.on('click', '.js-popup-region-vn', function() {
      that.remember('vn');
      that.close();
    });
    that.$popup.on('click', '.js-popup-region-intl', function() {
      var $btn = $(this);
      var isOpen = $btn.attr('aria-expanded') !== 'true';
      $btn.attr('aria-expanded', isOpen).closest('.popup-region--group').toggleClass('is-open', isOpen);
      $('#' + $btn.attr('aria-controls')).stop(true, true).slideToggle(250);
    });
    that.$popup.on('click', '.js-popup-region-link', function() {
      if (that.$popup.find('.js-popup-region-remember').is(':checked')) {
        that.remember('intl'); 
      } else {
        that.dismissSession();
      }
      that.close();
    });
    that.$popup.on('click', '.js-popup-region-close', function() {
      that.dismissSession();
      that.close();
    });
    $(document).on('keydown', function(e) {
      if (e.key === 'Escape' && that.$popup.hasClass('is-open')) {
        that.dismissSession();
        that.close();
      }
    });
  }
};
WEBDS.Init = function(){
	WEBDS.RegionPopup.init();
	WEBDS.Global.init();
}
$(document).ready(function(){
	WEBDS.Init();
})



