WEBDS.Index = {
	init: function(){
		var that = this;
		that.sliderBanner();
    that.sliderNewArrival();
    that.sliderCollection();
    that.gridCollection();
    that.lookbookPopup.init();
	},
  lookbookPopup: {
    cache: {},
    requests: {},
    slides: [],
    swiper: null,
    limit: 24,
    currentUrl: '',
    init: function(){
      var that = this;
      that.$popup = $('#lookbook-popup');
      if (!that.$popup.length) return;
      that.$grid = that.$popup.find('.lookbook-popup--products');
      $(document).on('click', '.js-lookbook-open', function(e){ 
        e.preventDefault();
        that.open($(this));
      });
      $(document).on('keydown', '.js-lookbook-open', function(e){
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          that.open($(this));
        }
      });
      that.$popup.on('click', '.js-lookbook-close', function(e){
        e.preventDefault();
        that.close();
      });
      that.$popup.on('click', function(e){
        if (e.target === this) that.close();
      });
      $(document).on('keydown', function(e){
        if (e.key !== 'Escape' || !that.$popup.hasClass('is-open')) return;
        if ($('html').is('.open-sidebar-cart, .open-sidebar-quickview')) return;
        that.close();
      });
    },
    open: function($card){
      var that = this;
      var images = String($card.attr('data-images') || '').split('|');
      var colls = String($card.attr('data-collections') || '').split('|');
      var slides = [];
      $.each(images, function(i, src){
        if (src) slides.push({img: src, coll: colls[i] || ''});
      });
      that.$trigger = $card;
      that.slides = slides;
      that.currentUrl = null;
      that.$popup.removeAttr('hidden').addClass('is-open');
      $('html, body').addClass('lookbook-popup-open');
      that.$popup.find('.lookbook-popup--inner').scrollTop(0);
      $.each(slides, function(i, slide){
        if (slide.coll) that.fetchProducts(slide.coll);
      });
      that.renderSlider(slides);
      that.renderProducts(slides.length ? slides[0].coll : '');
      that.$popup.find('.js-lookbook-close').trigger('focus');
    },
    close: function(){
      var that = this;
      that.$popup.removeClass('is-open').attr('hidden', '');
      $('html, body').removeClass('lookbook-popup-open');
      if (that.$trigger) that.$trigger.trigger('focus');
    },
    renderSlider: function(slides){
      var that = this;
      var $slider = that.$popup.find('.lookbook-popup--slider');
      if (that.swiper) {
        that.swiper.destroy(true, true);
        that.swiper = null;
      }
      $slider.find('.swiper-wrapper').html(slides.map(function(slide){
        return '<div class="swiper-slide"><img src="' + slide.img + '" alt=""></div>';
      }).join(''));
      that.$popup.find('.lookbook-popup--nav').toggleClass('d-none', slides.length < 2);
      if (slides.length < 2) return;
      that.swiper = new Swiper($slider[0], {
        loop: true,
        speed: 600,
        navigation: {
          nextEl: that.$popup.find('.lookbook-popup--next')[0],
          prevEl: that.$popup.find('.lookbook-popup--prev')[0]
        },
        on: {
          realIndexChange: function(swiper){
            var slide = that.slides[swiper.realIndex];
            if (slide) that.renderProducts(slide.coll);
          }
        }
      });
    },
    renderProducts: function(url){
      var that = this;
      if (that.currentUrl === url && that.$grid.children().length) return;
      that.currentUrl = url;
      that.$popup.find('.lookbook-popup--scroll').scrollTop(0);
      var render = function(products){
        if (that.currentUrl !== url) return;
        if (!products.length) {
          that.$grid.html('<p class="lookbook-popup--empty">' + window.textMainVi.text10 + '</p>');
          return;
        }
        that.$grid.html(products.map(function(item){
          return '<div class="product-tile product-loop">' + that.renderItem(item) + '</div>';
        }).join(''));
        WEBDS.Wishlist.checkActiveWishlist(that.$popup);
      };
      if (!url) return render([]);
      if (that.cache[url]) return render(that.cache[url]);
      that.$grid.html($('#lookbook-popup-loading').html());
      that.fetchProducts(url).then(render);
    },
    renderItem: function(data){
      var blank = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      var noImage = 'https://cdn.hstatic.net/files/200001179192/file/no-image.jpg';
      var tags = typeof data.tags == 'string' ? data.tags.split(',') : (data.tags || []);
      var images = (data.images || []).map(function(img){ return typeof img == 'string' ? img : (img && img.src); }).filter(Boolean);
      var first = data.featured_image || (data.image && data.image.src) || images[0];
      var second = images[1] || first;
      var img = function(src, size){ return src ? Haravan.resizeImage(src, size) : noImage; };
      var url = data.hasOwnProperty('url') ? data.url : '/products/' + data.handle;
      var variant = data.variants[0];
      var unit = data.hasOwnProperty('url') ? 1 : 100;
      var price = Number(variant.price) * unit;
      var compare = Number(variant.compare_at_price) * unit;
      var sale = compare > price ? Math.round((compare - price) / compare * 100) : 0;
      var money = function(value){ return Haravan.formatMoney(value, shop.moneyFormat).replaceAll(',', '.'); };
      var tagBest = tags.filter(function(t){ return t.indexOf('badge:Bestseller') > -1; })[0];
      var tagNew = tags.filter(function(t){ return t.indexOf('New Drop') > -1; })[0];
      var picture = function(cls, src){
        return '<picture class="' + cls + '">'
          + '<source data-srcset="' + img(src, '1024x1024') + '" srcset="' + blank + '" media="(min-width: 768px)">'
          + '<source data-srcset="' + img(src, 'grande') + '" srcset="' + blank + '" media="(max-width: 767px)">'
          + '<img class="lazyload img-default" src="' + blank + '" data-src="' + img(src, '1024x1024') + '" alt="' + data.title + '">'
          + '</picture>';
      };
      return '<div class="product-loop--wrap" data-prid="' + data.id + '">'
        + '<div class="product-loop--head">'
          + '<div class="product-loop--badges">'
            + (tagBest ? '<span class="badge-best">' + tagBest.split(':')[1] + '</span>' : '')
            + (tagNew ? '<span class="badge-new glass">' + tagNew + '</span>' : '')
            + (sale ? '<span class="badge-percent-sale glass">-' + sale + '%</span>' : '')
            + (data.available === false ? '<span class="badge-soldout">Hết hàng</span>' : '')
          + '</div>'
          + '<div class="product-loop--img">' + picture('img-first', first) + picture('img-second', second) + '</div>'
          + '<a href="' + url + '" class="product-loop--link" aria-label="' + data.title + '"></a>'
          + '<div class="product-loop--btn"><button class="product-btn glass js-wishlist" data-id="' + data.id + '" data-handle="' + data.handle + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 15" fill="none"><path d="M11.666 0C10.9153 0.0116766 10.181 0.221235 9.53716 0.607514C8.89336 0.993793 8.3629 1.54311 7.99932 2.2C7.63575 1.54311 7.10528 0.993793 6.46148 0.607514C5.81768 0.221235 5.08335 0.0116766 4.33265 0C3.13595 0.0519938 2.00846 0.575503 1.19651 1.45616C0.384561 2.33681 -0.0458459 3.50302 -0.000678848 4.7C-0.000678848 7.73133 3.18999 11.042 5.86599 13.2867C6.46347 13.7888 7.21889 14.064 7.99932 14.064C8.77975 14.064 9.53518 13.7888 10.1327 13.2867C12.8087 11.042 15.9993 7.73133 15.9993 4.7C16.0445 3.50302 15.6141 2.33681 14.8021 1.45616C13.9902 0.575503 12.8627 0.0519938 11.666 0ZM9.27599 12.2667C8.91864 12.5676 8.46649 12.7326 7.99932 12.7326C7.53215 12.7326 7.08 12.5676 6.72265 12.2667C3.29732 9.39267 1.33265 6.63533 1.33265 4.7C1.28708 3.85648 1.5769 3.02915 2.1389 2.39847C2.70089 1.76778 3.48948 1.3849 4.33265 1.33333C5.17583 1.3849 5.96441 1.76778 6.52641 2.39847C7.08841 3.02915 7.37823 3.85648 7.33265 4.7C7.33265 4.87681 7.40289 5.04638 7.52792 5.1714C7.65294 5.29643 7.82251 5.36667 7.99932 5.36667C8.17613 5.36667 8.3457 5.29643 8.47073 5.1714C8.59575 5.04638 8.66599 4.87681 8.66599 4.7C8.62041 3.85648 8.91023 3.02915 9.47223 2.39847C10.0342 1.76778 10.8228 1.3849 11.666 1.33333C12.5092 1.3849 13.2977 1.76778 13.8597 2.39847C14.4217 3.02915 14.7116 3.85648 14.666 4.7C14.666 6.63533 12.7013 9.39267 9.27599 12.264V12.2667Z" fill="#333333"/></svg></button></div>'
        + '</div>'
        + '<div class="product-loop--body">'
          + '<div class="product-loop--info">'
          + '<div class="product-loop--detail">'
            + '<h3 class="product-loop--name"><a href="' + url + '" title="' + data.title + '">' + data.title + '</a></h3>'
            + '<div class="product-loop--prices">'
              + '<div class="price-current ' + (sale ? 'hightlight' : 'normal') + '"><span>' + money(price) + '</span></div>'
              + (sale ? '<div class="price-compare"><del class="del">' + money(compare) + '</del></div>' : '')
            + '</div>'
          + '</div>'
          + '<div class="product-loop--btn plus">' + (function(){
              var plusBtnImg = (window.themeUI && window.themeUI.productPlusBtnImg) || '';
              if (plusBtnImg) {
                return '<a href="' + url + '" class="product-btn product-btn--plus has-img" aria-label="' + data.title + '"><img src="' + plusBtnImg + '" width="32" height="32" alt=""></a>';
              }
              return '<a href="' + url + '" class="product-btn product-btn--plus" aria-label="' + data.title + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 0h3v6.5H16v3H9.5V16h-3V9.5H0v-3h6.5z" fill="currentColor"/></svg></a>';
            })() + '</div>'
          + '</div>'
        + '</div>'
      + '</div>';
    },
    fetchProducts: function(url){
      var that = this;
      if (!that.requests[url]) {
        var deferred = $.Deferred();
        that.requests[url] = deferred.promise();
        $.get(url + '/products.json?page=1&limit=' + that.limit).done(function(data){
          that.cache[url] = (data && data.products) || [];
          deferred.resolve(that.cache[url]);
        }).fail(function(){
          delete that.requests[url];
          deferred.resolve([]);
        });
      }
      return that.requests[url];
    }
  },
	sliderBanner: function(){
		var swiper = new Swiper("#homepage-slider", {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 0,
			speed: 800,
			effect: "fade",
			fadeEffect: {
				crossFade: !0
			},
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '#homepage-slider .swiper-pagination',
				type: 'bullets',
				clickable: true
			},
      navigation: {
        nextEl: '#homepage-slider .swiper-next',
        prevEl: '#homepage-slider .swiper-prev'
      }
		});
	},
  sliderNewArrival: function(){
    var target = '#slider-newarrival';
    var $section = $(target);
    if (!$section.length) return;
    var size = $section.find('.products-slide .swiper-slide').length;
    var perview = Number($section.find('.swiper').attr('data-perview')) || 3.3;
    if (size === 0) return;
    if ($(window).width() > 991) {
      new Swiper(target + ' .swiper', {
        loop: false,
        slidesPerView: perview,
        spaceBetween: 24,
        speed: 800,
        mousewheel: {forceToAxis: true},
        freeMode: {enabled: true, sticky: true},
        grabCursor: size > perview,
        navigation: {
          nextEl: target + ' .swiper-next',
          prevEl: target + ' .swiper-prev'
        }
      });
      if (size > perview) $section.find('.swiper-navcontrol').removeClass('d-none');
    }
    WEBDS.Wishlist.checkActiveWishlist($section);
  },
  sliderCollection: function(){		
    $('.section-collection-slider').each(function(index){     
      var currentTarget = '#'+$(this).attr('id');
      var currentId = $(this).find('.swiper').attr('data-id');
  		var currentTitle = $(this).find('.swiper').attr('data-title');
  		var currentHandle  = $(this).find('.swiper').attr('data-handle');
      var currentLimit =  Number($(this).find('.swiper').attr('data-limit'));
      var currentPerview =  Number($(this).find('.swiper').attr('data-perview'));
      var currentSize = Number($(this).find('.swiper').attr('data-size'));
      var currentType = $(this).find('.swiper').attr('data-type');    
      var checkBtnSwiper = Number($(this).find('.swiper').attr('data-btn-swiper'));
      WEBDS.Global.getItemSlide(currentId,currentTitle,currentHandle,currentType,1,currentLimit,currentPerview,currentSize,checkBtnSwiper,currentTarget);  		
    });		    
  },
  gridCollection: function(){		
    $('.section-collection-grid').each(function(index){     
      var currentTarget = '#'+$(this).attr('id');
      var currentId = $(this).find('.products-grid').attr('data-id');
  		var currentTitle = $(this).find('.products-grid').attr('data-title');
  		var currentHandle  = $(this).find('.products-grid').attr('data-handle');
      var currentLimit =  Number($(this).find('.products-grid').attr('data-limit'));
      var currentSize = Number($(this).find('.products-grid').attr('data-size'));
      var currentType = $(this).find('.products-grid').attr('data-type');  
      WEBDS.Global.getItemGrid(currentId,currentTitle,currentHandle,currentType,1,currentLimit,currentTarget);  
    });
  },
}
WEBDS.Product = {
  current_variant: null,
  init: function () {
      var that = this;
      that.ProductDetail.init();
      that.fancyboxGallery();
      that.similarStyles();
      that.productAction();
      that.productTab();
  },
  /* =========================================================
   * VARIANT ENGINE
   * - option
   * - selected option
   * - variant
   * - availability
   * ========================================================= */
  VariantEngine: {
    state: {
      options: [],
      variants: [],
      optionMap: {},
      variantMap: {},
      selected: {},
      currentVariant: null
    },
    init: function () {
        var self = this;
        //* Reset state
        self.state.options = productInfo.options || [];
        self.state.variants = productInfo.variants || [];
        self.state.optionMap = {};
        self.state.variantMap = {};
        self.state.selected = {};
        self.state.currentVariant = null;
        //* Build data
        self.buildOptionMap();
        self.buildVariantMap();
      
        //* Kiểm tra current variant ** Có thể WEBDS.Product.current_variant là variant của product trước đó
        var current = WEBDS.Product.current_variant;
        var currentExists =
            current &&
            self.state.variants.some(function (variant) {
              return String(variant.id) === String(current.id);
            });
      
        // * Nếu current variant tồn tại => dùng current // Nếu không => lấy variant available đầu tiên
        var initialVariant = currentExists ? current : self.findFirstAvailable();
      
        //* Nếu không có available -> lấy variant đầu tiên
        if (!initialVariant) {
            initialVariant = self.state.variants[0] || null;
        }
        self.state.currentVariant = initialVariant;
      
        //* Set selected
        if (initialVariant) {
            self.setSelectedFromVariant(initialVariant);
            WEBDS.Product.current_variant = initialVariant;
        }

        return self;
    },
    normalize: function (value) {
      if (value === undefined || value === null ) {
          return '';
      }
      return String(value)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '');
    },
    escapeHtml: function (value) {
        if (value === undefined || value === null ) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    getOptionValue: function (variant,optionIndex) {
      if (!variant || optionIndex < 0) {
        return '';
      }
      return ( variant[ 'option' + (optionIndex + 1) ] || '' );
    },
    getVariantKey: function (variant) {
      var self = this;
      return self.state.options
        .map(function (_, index) {
            return self.normalize(
                self.getOptionValue(
                    variant,
                    index
                )
            );
        })
        .join('__');
    },
    buildOptionMap: function () {
      var self = this;
      self.state.optionMap = {};
      self.state.options.forEach(
        function (optionName,index ) {
          self.state.optionMap[
              self.normalize(optionName)
          ] = index;
        }
      );
      return self.state.optionMap;
    },
    buildVariantMap: function () {
        var self = this;
        self.state.variantMap = {};
        self.state.variants.forEach(function (variant) {
          var key = self.getVariantKey(variant);
          if (key) {
              self.state.variantMap[key] = variant;
          }
        });
        return self.state.variantMap;
    },
    getSelected: function () {
      var result = {};
      Object.keys(this.state.selected).forEach(
          function (index) {
              var value = this.state.selected[index];
              if (value !== undefined && value !== null && value !== '' ) {
                  result[index] = value;
              }
          },
          this
      );
      return result;
    },
    setSelected: function (optionIndex,value) {
      if (optionIndex === undefined ||optionIndex === null) {
          return;
      }
      if (value === undefined ||value === null ||value === '') {
          delete this.state.selected[optionIndex];
      } 
      else {
          this.state.selected[optionIndex] = value;
      }
    },
    setSelectedFromVariant: function (variant) {
        var self = this;
        self.state.selected = {};
        if (!variant) {
            return;
        }
        self.state.options.forEach(
          function (_, index) {
            var value = self.getOptionValue(variant,index);
            if (value) {
              self.state.selected[index] = value;
            }
          }
        );
    },
    findFirstAvailable: function () {
        var self = this;
        return (
            self.state.variants.find(function (variant) {
              return variant.available;
            }) ||
            self.state.variants[0] ||
            null
        );
    },
    /* =====================================================
     * MATCH VARIANT
     *
     * Kiểm tra variant có match selected hay không.
     * ===================================================== */
    matchVariant: function (variant,selected) {
      var self = this;
      return Object.keys(selected).every(
        function (index) {
            return (self.getOptionValue(variant,Number(index)) === selected[index]);
        }
      );
    },
    /* =====================================================
     * FIND VARIANT
     *
     * Nếu chọn đủ option:
     * => tìm exact variant
     *
     * Nếu chưa đủ:
     * => tìm variant available phù hợp
     * ===================================================== */
    findVariant: function (selected,options) {
        var self = this;
        selected = selected || self.getSelected();
        options = options || {};
        var requireAvailable = options.requireAvailable !== false;
        var selectedKeys = Object.keys(selected);
        // * Không chọn gì
        if (!selectedKeys.length) {
          return self.findFirstAvailable();
        }
        // * Nếu chọn đủ option * => dùng variantMap
        if (selectedKeys.length === self.state.options.length ) {
            var key = self.state.options.map(function (_, index) {
                          return self.normalize(selected[index] || '');
                      }).join('__');
            var exact = self.state.variantMap[key] || null;
            if (!exact) {
                return null;
            }
            if (requireAvailable && !exact.available) {
                return null;
            }
            return exact;
        }
        //* Chưa chọn đủ option * Tìm variant phù hợp
        return (
            self.state.variants.find(function (variant) {
                if (requireAvailable &&!variant.available) {
                    return false;
                }
                return self.matchVariant(variant,selected);
            }) || null
        );
    },
    /* =====================================================
     * CHECK AVAILABILITY
     * ===================================================== */
    checkAvailability: function (optionIndex,value,selected) {
        var self = this;
        selected =selected || self.getSelected();
        //* Tạo selected tạm -- Ví dụ: selected: {0: "Đỏ"}, kiểm tra: index 1 = "M"  =>{0: "Đỏ",1: "M"}
        var tempSelected = Object.assign({}, selected);
        tempSelected[optionIndex] = value;
        // * Chỉ cần có 1 variant available, match => available
        return self.state.variants.some(
          function (variant) {
            if (!variant.available) {
              return false;
            }
            return self.matchVariant( variant, tempSelected );
          }
        );
    },
    /* =====================================================
     * UPDATE AVAILABILITY
     * ===================================================== */
    updateAvailability: function () {
      var self = this;
      var selected = self.getSelected();
      $('#prd-variants ' + 'label[data-option-index]').each(
        function () {
          var $label = $(this);
          var optionIndex = Number($label.attr('data-option-index'));
          var value = $label.attr('data-value');
          var available = self.checkAvailability(optionIndex,value, selected );
          $label.toggleClass('soldout', !available );
          // * Nếu label đang selected nhưng combination không tồn tại => bỏ selected
          if (!available && $label.hasClass('sd') ) {
            $label.removeClass('sd');
          }
        }
      );
    },
    /* =====================================================
     * UPDATE SELECTED UI
     * ===================================================== */
    updateSelectedUI: function () {
      var self = this;
      //* Remove selected 
      $('#prd-variants ' + 'label[data-option-index]').removeClass('sd');
      //* Add selected
      Object.keys(self.state.selected).forEach(function (index) {
        var value = self.state.selected[index];
        var $label = $('#prd-variants ' + 'label[data-option-index="' + index + '"]').filter(function () {
                        return ( $(this).attr('data-value') === value );
                    }).first();
        if (!$label.length) {return;}
        $label.addClass('sd');
        //* Update header
        var $swatch = $label.closest('.swatch');
        $swatch.find('.swatch-header ' + '.title span:last').html(value);
      });
    },
    /* =====================================================
     * UPDATE CURRENT VARIANT
     * ===================================================== */
    updateVariant: function () {
      var self = this;
      var selected = self.getSelected();
      var variant = self.findVariant(selected, { requireAvailable: false });
      //* Nếu variant tồn tại
      if (variant) {
          self.state.currentVariant = variant;
          WEBDS.Product.current_variant = variant;
          return variant;
      }
      //* Không tìm thấy variant
      self.state.currentVariant = null;
      WEBDS.Product.current_variant = null;
      return null;
    },
    /* =====================================================
     * UPDATE UI
     * ===================================================== */
    updateUI: function () {
      var self = this;
      //* 1. Update availability
      self.updateAvailability();
      //* 2. Update selected UI
      self.updateSelectedUI();
      //* 3. Find current variant
      var variant = self.updateVariant();
      //* 4. Render product
      if (variant) {
          WEBDS.Product.ProductDetail.renderInfo(variant);
          WEBDS.Product.ProductDetail.updateProductSelect(variant);
          //* Có variant available
          if (variant.available) {
              WEBDS.Product.ProductDetail.enableBuyButtons();
          } 
          else {
              WEBDS.Product.ProductDetail.disableBuyButtons();
          }
      } 
      else {
          WEBDS.Product.ProductDetail.disableBuyButtons();
      }
      return variant;
    }
  },
  ProductDetail: {
    init: function () {
      var self = this;
      //* 1. Init Variant Engine
      WEBDS.Product.VariantEngine.init();
      //* 2. Render options
      self.renderOptions();
      //* 3. Render gallery
      self.renderGallery();
      //* 4. Update UI
      WEBDS.Product.VariantEngine.updateUI();
      //* 5. Bind events
      self.bindEvents();
    },
    /* =====================================================
     * GET OPTION TYPE
     *
     * Không phụ thuộc vị trí option.
     *
     * Ví dụ:["Chất liệu","Màu sắc", "Kích thước"]
     *
     * vẫn nhận đúng:
     * 0 => material
     * 1 => color
     * 2 => size
     * ===================================================== */
    getOptionType: function (optionName) {
      var engine = WEBDS.Product.VariantEngine;
      var alias = engine.normalize(optionName);
      // * COLOR
      if (['mau','mausac','color','colour'].indexOf(alias) > -1) {
          return 'color';
      }
      // * SIZE
      if (['kichthuoc','kichco','size','sizes'].indexOf(alias) > -1) {
          return 'size';
      }
      //* MATERIAL
      if (['chatlieu','material'].indexOf(alias) > -1) {
          return 'material';
      }
      //* DEFAULT
      return 'default';
    },
    /* =====================================================
     * RENDER OPTIONS
     * ===================================================== */
    renderOptions: function () {
        var self = this;
        var engine = WEBDS.Product.VariantEngine;
        var options = engine.state.options;
        var html = '';
        //* Render từng option
        options.forEach(function (optionName,optionIndex) {
          var type = self.getOptionType(optionName);
          var safeName = engine.escapeHtml(optionName);
          html += `
              <div class="swatch swatch--option swatch--${type}" data-option-index="${optionIndex}">
                  <div class="swatch-header ${type}"><span class="title"><span>${safeName}</span><span></span></span></div>
                  <div class=" select-swap select-swap--${type}" data-option-index="${optionIndex}"></div>
              </div>`;
        });
        //* Render vào DOM
        $('#prd-variants .prd-options').html(html);
        //* Render value
        options.forEach(function (optionName,optionIndex) {
          self.renderOptionValues(
            optionIndex,
            optionName
          );
        });
    },
    /* =====================================================
     * RENDER OPTION VALUES
     * ===================================================== */
    renderOptionValues: function (optionIndex, optionName) {
        var self = this;
        var engine = WEBDS.Product.VariantEngine;
        var type = self.getOptionType(optionName);
        var key = 'option' + (optionIndex + 1);
        var values = [];
        /*
         * Lấy unique values
         *
         * Giữ nguyên thứ tự
         * của productInfo.variants
         */
        engine.state.variants.forEach(function (variant) {
          var value = variant[key];
          if (value && values.indexOf(value) === -1) {
              values.push(value);
          }
        });

        var html = '';
        values.forEach(function (value) {
          //* Initial availability - Không dựa vào selected hiện tại
          var available = engine.checkAvailability( optionIndex, value, {} );
          var bgImage = '';
          //* COLOR
          if (type === 'color') {
              bgImage = self.getColorImage(value);
          }
          html += self.renderOptionItem(
                    optionIndex,
                    value,
                    available,
                    type,
                    bgImage
                  );
        });
      
        //* Render
        $('#prd-variants ' + '.select-swap[data-option-index="' + optionIndex + '"]').html(html);
    },
    /* =====================================================
     * RENDER OPTION ITEM
     * ===================================================== */
    renderOptionItem: function (optionIndex, value, available, type, bgImage ) {
      var engine = WEBDS.Product.VariantEngine;
      var safeValue = engine.escapeHtml(value);
      var style = '';
      //* Background image cho color
      if (type === 'color' &&bgImage) {
          style = `
              style="
                  background-image:url('${bgImage}');
                  background-repeat:no-repeat;
                  background-size:cover;
                  background-position:center;
              "
          `;
      }
      //* Class soldout
      var soldoutClass = available ? '' : 'soldout';
      //* COLOR
      if (type === 'color') {
          return `
            <div class="swatch-element">
                <label class=" aspect-ratio ${soldoutClass}"
                    data-value="${safeValue}"
                    data-option-index="${optionIndex}"
                    ${style}>
                    <span class="swatch-bg--color" data-color="${WEBDS.Helper.change_alias(value)}">${safeValue}</span>
                </label>
            </div>`;
      }
      //* DEFAULT / SIZE / MATERIAL /...
      return `
          <div class="swatch-element">
              <label class=" aspect-ratio ${soldoutClass}"
                  data-value="${safeValue}"
                  data-option-index="${optionIndex}">
                  ${safeValue}
              </label>
          </div>
      `;
    },
    /* =====================================================
     * GET COLOR IMAGE
     * ===================================================== */
    getColorImage: function (color) {
        var engine = WEBDS.Product.VariantEngine;
        //* Tìm index của color
        var colorIndex = engine.state.options.findIndex(function (optionName) {
            var alias = engine.normalize(optionName);
            return (
                alias === 'mau' ||
                alias === 'mausac' ||
                alias === 'color' ||
                alias === 'colour'
            );
        });
        if (colorIndex < 0) {
            return '';
        }
        //* Tìm variant tương ứng
        var variant = engine.state.variants.find(function (variant) {
            return (engine.getOptionValue(variant, colorIndex ) === color );
        });
        var bgImage = '';
        //* Variant image
        if (variant && variant.featured_image) {
            bgImage = Haravan.resizeImage(variant.featured_image.src, 'medium');
        }
        //* Product image
        else if (productInfo.featured_image) {
            bgImage = Haravan.resizeImage(productInfo.featured_image,'medium');
        }
        //* icon_color
        if (typeof icon_color !== 'undefined' && Array.isArray(icon_color) && icon_color.length) {
            var icon = icon_color.find(function (item) {
                return (item.alt && item.alt.indexOf(color) > -1 );
            });
            if (icon) {
                bgImage = icon.src;
            }
        }
        return bgImage;
    },
    /* =====================================================
     * BIND EVENTS
     * ===================================================== */
    bindEvents: function () {
      var self = this;
      /* =================================================
       * OPTION CLICK
       * ================================================= */
      $(document).off('click.productVariant', '#prd-variants ' + 'label[data-option-index]');
      $(document).on('click.productVariant', '#prd-variants ' + 'label[data-option-index]:not(.soldout)',function () {
          var $label = $(this);
          var optionIndex = Number($label.attr('data-option-index'));
          var value = $label.attr('data-value');
          var engine = WEBDS.Product.VariantEngine;
          //* Set selected
          engine.setSelected(optionIndex,value);
          //* Remove selected * trong cùng option
          $label.closest('.select-swap').find('label').removeClass('sd');
          //* Add selected
          $label.addClass('sd');
          //* Update
          engine.updateUI();
      });

      /* =================================================
       * COLOR HOVER
       * ================================================= */
      $(document).off('mouseenter.productVariant', '#prd-variants ' + '.swatch--color ' + 'label');
      $(document).on('mouseenter.productVariant', '#prd-variants ' + '.swatch--color ' + 'label',function () {
          var value = $(this).attr( 'data-value' );
          $(this).closest('.swatch').find('.swatch-header ' + '.title span:last').html(value);
      });

      /* =================================================
       * COLOR MOUSE LEAVE
       * ================================================= */
      $(document).off('mouseleave.productVariant','#prd-variants ' + '.swatch--color');
      $(document).on('mouseleave.productVariant', '#prd-variants ' + '.swatch--color', function () {
          var optionIndex = Number($(this).attr('data-option-index'));
          var value = WEBDS.Product.VariantEngine.state.selected[optionIndex] || '';
          $(this).find('.swatch-header ' + '.title span:last').html(value);
      });
    },
    /* =====================================================
     * RENDER INFO
     * ===================================================== */
    renderInfo: function (variant) {
      if (!variant) { return; }
      var $price = $('.prd-price span.price');
      var $compare = $('.prd-price del');
      var $compareWrap = $('.prd-price .price-compare');
      var $percent = $('.prd-price span.price-percent');
      var $addCart = $('.prd-controls #btn-addtocart');
      var $quantity = $('.prd-quantity');
      var $quantityBtn = $('.prd-quantity button');
      var $quantityInput = $('.prd-quantity input');
      var $productInfo = $('.productdetail-info');
      $('.productdetail-info h1').html(productInfo.title);
      var price = Number(variant.price) || 0;
      var comparePrice = Number(variant.compare_at_price) || 0;
      $price.html(Haravan.formatMoney(price,window.shop.moneyFormat).replaceAll(',', '.')).attr( 'content', price / 100);
      if (comparePrice > price && price > 0 ) {
          var sale = Math.round(100 - ( price / comparePrice * 100 ));
          $compare.html(Haravan.formatMoney(comparePrice, window.shop.moneyFormat).replaceAll(',', '.'));
          $compareWrap.removeClass('d-none');
          $price.addClass('reduced');
          $percent.html('-' + sale + '%').removeClass('d-none');
      } 
      else {
          $compareWrap.addClass('d-none');
          $price.removeClass('reduced');
          $percent.addClass('d-none');
      }
      if (price <= 0) {
          $addCart.addClass('d-none');
          $quantity.addClass('d-none');
          this.disableBuyButtons();
          return;
      }
      $addCart.removeClass('d-none');
      $quantity.removeClass('d-none');
      /* =================================================
       * AVAILABLE
       * ================================================= */
      if (productInfo.available &&variant.available) {
          $productInfo.removeClass('isSoldout');
          $addCart.removeClass('disabled').prop('disabled',false).find('span.text').html('ADD TO CART');
          $quantityBtn.removeClass('disabled').prop('disabled',false);
          $quantityInput.prop('readonly',false);
      } 
      else {
          $productInfo.addClass('isSoldout');
          $addCart.addClass('disabled').prop('disabled',true).find('span.text').html('SOLD OUT');
          $quantityBtn.addClass('disabled').prop('disabled',true);
          $quantityInput.prop('readonly',true);
      }   
      /* =================================================
       * GALLERY
       * ================================================= */
      this.updateGallery(variant);
    },
    /* =====================================================
     * UPDATE PRODUCT SELECT
     * ===================================================== */
    updateProductSelect: function (variant) {
        if (!variant) {return;}
        $('#product-select').val(variant.id).attr('data-sku', variant.sku || '' );
    },
    /* =====================================================
     * UPDATE GALLERY
     * ===================================================== */
    updateGallery: function (variant) {
        if (!variant || !variant.featured_image ) {return;}
        if (typeof window.galleryMain === 'undefined') { return; }
        if (!window.galleryMain || typeof window.galleryMain.slideTo !== 'function') { return;}
        var imageSrc = Haravan.resizeImage(variant.featured_image.src,'master').replace('https:','');
        var $image = $('.product-gallery[data-image="' + imageSrc + '"]');
        if ($image.length) {
            var index =$image.parent().index();
            window.galleryMain.slideTo(index,300);
        }
    },
    /* =====================================================
     * RENDER GALLERY
     * ===================================================== */
    renderGallery: function () {
      //* Destroy swiper cũ nếu tồn tại
      if (window.galleryThumbs && typeof window.galleryThumbs.destroy === 'function') {
          window.galleryThumbs.destroy(true,true);
          window.galleryThumbs = null;
      }
      if (window.galleryMain && typeof window.galleryMain.destroy === 'function') {
          window.galleryMain.destroy(true,true);
          window.galleryMain = null;
      }
      
      function syncThumbHeight() {
        var main = document.querySelector('.gallery-main');
        if (!main) return;
        var mainHeight = main.offsetHeight;
        $(".productdetail-media").attr(`style`,`--height-gallery-main: ${mainHeight}px`)
        if ($('.gallery-thumbs').length > 0) {
          document.querySelector('.gallery-thumbs').style.height = window.innerWidth >= 992 ? mainHeight + 'px' : '';
        }
      }
      window.addEventListener('load', syncThumbHeight);
      window.addEventListener('resize', syncThumbHeight);
      
      if ($('.gallery-thumbs .swiper-slide').length > 0) { 
        var countImg = Number($('.gallery-thumbs').attr('data-size'));
        /* =================================================
         * THUMB
         * ================================================= */
        window.galleryThumbs = new Swiper('.gallery-thumbs', {
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
                slidesPerView: 'auto',
                spaceBetween: 8
              },
              992: {
                direction: 'vertical',
                slidesPerView: 'auto',
                spaceBetween: 10
              }
            }
          });
  
        /* =================================================
         * MAIN
         * ================================================= */
        window.galleryMain = new Swiper('.gallery-main', {
            slidesPerView: 1,
            loop: true,
            thumbs: {
                swiper: window.galleryThumbs
            },
            navigation: {
                nextEl: '.gallery-main .swiper-next',
                prevEl: '.gallery-main .swiper-prev'
            }
          });
          if ($('.gallery-main .swiper-slide').length > 1) {
            $('.gallery-main .swiper-control').removeClass('d-none');
          }
        /* =================================================
         * Change
         * ================================================= */
        window.galleryMain.on('slideChange', function () {
          const activeIndex = window.galleryMain.activeIndex;
          window.galleryThumbs.slideTo(activeIndex, 300);
        });
      }      
    },
    /* =====================================================
     * ENABLE BUY BUTTON
     * ===================================================== */
    enableBuyButtons: function () {
      $('#btn-addtocart').removeClass('disabled').prop('disabled',false);
      $('#btn-buynow').removeClass('disabled d-none').prop('disabled',false);
    },
    /* =====================================================
     * DISABLE BUY BUTTON
     * ===================================================== */
    disableBuyButtons: function () {
      $('#btn-addtocart').addClass('disabled').prop('disabled',true);
      $('#btn-buynow').addClass('disabled d-none').prop('disabled',true);
    },
    /* =====================================================
     * PUSH URL
     * ===================================================== */
    pushUrl: function (url) {
      history.replaceState(null, '', url );
    }
  },
  fancyboxGallery: function(){
    Fancybox.bind('[data-fancybox="gallery"]', {
      Carousel: {
        Navigation: false,
      },
      Toolbar: {
        items: {
          close: {
            tpl: `<button class="f-button" title="Close" data-fancybox-close=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="#8C8C8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
          },
          prev: {
            tpl: `<button class="f-button" title="prev" data-fancybox-prev><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6668 10H3.3335M3.3335 10L8.3335 15M3.3335 10L8.3335 5" stroke="#262626" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
          },
          next: {
            tpl: `<button class="f-button" title="next" data-fancybox-next><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.3335 10H16.6668M16.6668 10L11.6668 5M16.6668 10L11.6668 15" stroke="#262626" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
          },
        },
        display: {
          left: ["prev","next"],
          middle: [
            "fullscreen",
            "zoomOut",
            "zoomIn",
          ],
          right: ["slideshow", "thumbs", "close"],
        },
      },
    });
	},
	productAction: function(){
		// Click Modal Size
		$('.btn-sizeguide').on('click',function(e){
      e.preventDefault();
  		$('#sizechartModal').modal('show');
		});		
		// Click ATC
		$(document).on('click', '#btn-addtocart:not(.loading):not(.disabled):not(.added)', function(e){
			e.preventDefault();
			//Check request select size
			var isValid = true;
			var soldoutAllSize = false;
			var lenghtSize = $('.select-swatch .swatch.swatch-size .select-swap label').length;
			var lenghtSoldoutSize = $('.select-swatch .swatch.swatch-size .select-swap label.soldout').length;
			$('.select-swatch .swatch.swatch-size').each(function(){
				if($(this).find('.select-swap').html() != '' && $(this).find('.select-swap .sd').length == 0){
					isValid = false;
				}
			});
			if (lenghtSize == lenghtSoldoutSize) soldoutAllSize = true;	
			
			if(isValid){
				$('#btn-addtocart').addClass('loading');
				var id =  $('#product-select').val();
				let sku = $('#product-select').attr('data-sku');
				var quantity = parseInt($('#productdetail-page .input-quantity').val());

				var param = {
					type: 'POST',
					url: '/cart/add.js',
					data:  { id: id, quantity: quantity },
					dataType: 'json',
					success: function(datacart) {
						WEBDS.Global.cartAjax(function(){
							$('#btn-addtocart').addClass('added');
							$('#btn-addtocart').removeClass('loading');
							$('.productdetail-fixed').removeClass('is-show');
							$('html,body').addClass('open-sidebar-cart lock-scroll');
							setTimeout(function(){
								$('#btn-addtocart').removeClass('added'); 
							},5000);

						},);
					},
					error: function(XMLHttpRequest, textStatus) {
						if ( XMLHttpRequest.status == 422 ){
							WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
							$('#btn-addtocart').removeClass('loading');
						}
					}
				}
				$.ajax(param);
			}
			else {
				WEBDS.Helper.SwalWarning(isText.text8,isText.text21,'warning',false,false,2000);
			}
		});
    // Click BNow
    $(document).on('click', '#btn-buynow:not(.loading):not(.disabled):not(.added)', function(e){
			e.preventDefault();
			//Check request select size
			var isValid = true;
			var soldoutAllSize = false;
			var lenghtSize = $('.select-swatch .swatch.swatch-size .select-swap label').length;
			var lenghtSoldoutSize = $('.select-swatch .swatch.swatch-size .select-swap label.soldout').length;
			$('.select-swatch .swatch.swatch-size').each(function(){
				if($(this).find('.select-swap').html() != '' && $(this).find('.select-swap .sd').length == 0){
					isValid = false;
				}
			});
			if (lenghtSize == lenghtSoldoutSize) soldoutAllSize = true;	
			
			if(isValid){
				$('#btn-buynow').addClass('loading');
				var id =  $('#product-select').val();
				let sku = $('#product-select').attr('data-sku');
				var quantity = parseInt($('#productdetail-page .input-quantity').val());

				var param = {
					type: 'POST',
					url: '/cart/add.js',
					data:  { id: id, quantity: quantity },
					dataType: 'json',
					success: function(datacart) {
						WEBDS.Global.cartAjax(function(){
							
							$('#btn-buynow').addClass('added');
							$('#btn-buynow').removeClass('loading');
							
							window.location.href = '/cart';       
							setTimeout(function(){
								$('#btn-buynow').removeClass('added'); 
							},3000);

						},);
					},
					error: function(XMLHttpRequest, textStatus) {
						if ( XMLHttpRequest.status == 422 ){
							WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
							$('#btn-buynow').removeClass('loading');
						}
					}
				}
				$.ajax(param);
			}
			else {
				WEBDS.Helper.SwalWarning(isText.text8,isText.text21,'warning',false,false,2000);
			}
		});
    //Accordion
		$(document).on('click', '.accordion-header', function(){
			if(!$(this).hasClass('active')){ 
				$('.accordion-header').removeClass('active').parent().find('.accordion-body').stop().slideUp('medium');
				$(this).toggleClass('active').parent().find('.accordion-body').stop().slideToggle('medium');
			}else{
				$(this).toggleClass('active').parent().find('.accordion-body').stop().slideToggle('medium');
			}
		});
	},  
  similarStyles: function(){
		var type = productInfo.type;
		var url = '/search.js?q=filter=(' + encodeURIComponent('(product_type:product='+type+')') + ')&page=1&limit=8';
		$.get(url).done(function(data){
			if(data.total > 0){
				$('.section-similar').removeClass('d-none');
				$('.section-similar .products-slide').html('');
        data.products.map((item,ind) => {
          var html_loop = `<div class="swiper-slide"><div class="product-loop pr${ind}">` + WEBDS.Global.renderLoop(item,(ind + 1)) + `</div></div>`;
          if(ind < 9){
            $('.section-similar .products-slide').append(html_loop);
            if($(window).width() > 991){
              var swiper = new Swiper("#collection-slider-ppd .swiper", {
    						loop: false,
    						slidesPerView: 4,
    						spaceBetween: 16,
    						//mousewheel: true,
    						//grabCursor: true,
    						freeMode: true,
                navigation: {
                  nextEl: '#collection-slider-ppd .swiper-next',
                  prevEl: '#collection-slider-ppd .swiper-prev'
                },
    						breakpoints: {
    							992: {
    								slidesPerView: 4,
    								spaceBetween: 24
    							}
    						}
    					});
              if (ind > 3) {
                $('#collection-slider-ppd .swiper-navcontrol').removeClass('d-none');
              }
            }
          }
        });
			}
			else{
				$('.section-similar').addClass('d-none');
			}
		});		
	},
  productTab: function(){
    //Tab Desc
    $(".productdetail-tab .tabnav a").on("click", function(event) {
      event.preventDefault();
      $(".productdetail-tab .tabnav a").removeClass("active");
      $(this).addClass("active");
      $(".productdetail-tab .tabcontents > div").removeClass('active show');
      $($(this).attr("href")).addClass('active show');
    });

    //Expandable Desc
    $('.productdetail-tab .tabpand').each(function(index){ 
      var currentTarget = '#'+$(this).attr('id');
      if($(currentTarget + ' .expandable--inner').height() > 200){ 
  			$(currentTarget + ' .expandable--inner').addClass('opened'); 
  			$(currentTarget + ' .expandable--trigger .btn-toggle').addClass('btn-viewmore').find('span').html('Xem thêm');
  		}
  		else{
  			$(currentTarget + ' .expandable--trigger .btn-toggle').addClass('btn-hidemore');
  		}
  		$(currentTarget + ' .expandable--inner').data("orig-height", $(currentTarget + ' .expandable--inner').height());	
    });
    
		$('body').on('click', '.tabpand.active .expandable--trigger .btn-toggle', function (e) {
			var $languagesList = $('.tabpand.active .expandable--inner');
			if (!$languagesList.hasClass('opened')) {		
				$('.tabpand.active .expandable--trigger .btn-toggle').removeClass('btn-closemore').addClass('btn-viewmore').find('span').html('Xem thêm');
				var curHeight = $languagesList.height();
				orig_height = $('.tabpand.active .expandable--inner').data("orig-height");
				$languagesList.height(curHeight).animate({
					height: orig_height
				}, 300,  function () {
					$(this).addClass('opened');
				});
			} 
			else {
				var curHeight = $languagesList.height();
				$languagesList.css('height', 'auto');
				var autoHeight = $languagesList.height();
				$languagesList.height(curHeight).animate({
					height: autoHeight
				}, 1, function () {
					$(this).removeClass('opened');
					$('.tabpand.active .expandable--trigger .btn-toggle').removeClass('btn-viewmore').addClass('btn-closemore').find('span').html('Rút gọn');
				});
			}
			return false;
		});
  }
};
WEBDS.Collection = {
	picked: {},
  strFilter: '',
	origin: {
		total_product: 0,
		total_page: 0
	},
	paramTracking: [],
	init: function() {	
		var that = this;
		var paramSearch = window.location.search.replace('?','');
		if(!$.isEmptyObject(paramUrl)){
			var count_param = Object.keys(paramUrl).length;
			if(paramUrl.hasOwnProperty('sort_by')){
				if(count_param == 1){
					$('.sortBy li input[value="'+paramUrl.sort_by+'"]').prop('checked',true);
					that.getCollectionItem(1,true);
					//that.backUpSidebar();
				}
				else{
					//that.backUpSidebar();
					WEBDS.Collection.stringFilter();
				}
			}
			else{
				//that.backUpSidebar();
				if(paramUrl.hasOwnProperty('page')){
					if(count_param - that.paramTracking.length == 1){
						that.getCollectionItem(Number(paramUrl.page));
					}
					else {
						WEBDS.Collection.stringFilter(paramUrl.page);
					}
				}
				else{
					WEBDS.Collection.stringFilter();
				}
			}
		}
		else{
			that.getCollectionItem(1);
		}
		
		that.renderCollectionInfo();
		that.actionStyle();
		that.actionFilter();
    that.pagination();
    that.colorBar();
	},
  cateNav: function(){
    var $nav = $('.collection-cate .cate-nav');
    if (!$nav.length || $nav.data('ready')) return;
    $nav.data('ready', true);
    var menu = $nav.find('.cate-menu')[0];
    var $prev = $nav.find('.cate-nav--prev');
    var $next = $nav.find('.cate-nav--next');
    var update = function(){
      var max = menu.scrollWidth - menu.clientWidth;
      $prev.toggleClass('is-visible', menu.scrollLeft > 1);
      $next.toggleClass('is-visible', menu.scrollLeft < max - 1);
    };
    $prev.on('click', function(){ menu.scrollBy({left: -menu.clientWidth * 0.7, behavior: 'smooth'}); });
    $next.on('click', function(){ menu.scrollBy({left: menu.clientWidth * 0.7, behavior: 'smooth'}); });
    menu.addEventListener('scroll', update, {passive: true});
    $(window).on('resize', update);
    var active = $nav.find('.cate-menu--item.active')[0];
    if (active) menu.scrollLeft = active.offsetLeft - (menu.clientWidth - active.offsetWidth) / 2;
    update();
  },
  colorBar: function(){
    var $wrap = $('.collection-colorbar');
    if (!$wrap.length) return;
    var $bar = $wrap.find('.colorbar');
    var $btn = $wrap.find('.js-colorbar-toggle');
    var $body = $('.collection-body');
    var fixed = false;
    var update = function(){
      var top = $('body').hasClass('scroll-body-up') ? $('.main-header--inner').outerHeight() : 0;
      var wrapTop = $wrap[0].getBoundingClientRect().top;
      if (!fixed && wrapTop <= top) {
        $wrap.css('height', $wrap.outerHeight());
        $bar.addClass('is-fixed');
        fixed = true;
      }
      else if (fixed && wrapTop > top) {
        $bar.removeClass('is-fixed').css('transform', '');
        $wrap.css('height', '');
        fixed = false;
      }
      if (fixed && $body.length) {
        var shift = Math.min(0, $body[0].getBoundingClientRect().bottom - top - $bar.outerHeight());
        $bar.css('transform', shift ? 'translateY(' + shift + 'px)' : '');
      }
    };
    $btn.on('click', function(){
      var open = !$bar.hasClass('is-open');
      $bar.toggleClass('is-open', open);
      $btn.attr('aria-expanded', open ? 'true' : 'false');
    });
    $(window).on('scroll resize', update);
    update();
  },
  renderCollectionInfo: function(){
		var idColl = $('#collection-page').attr('data-id');
		//Render Cate Menu  
    if ($('.collection-cate .cate-menu').length > 0) {
  		if (idColl != '0'){}
      if(data_menucate.length > 0){
        $('.collection-cate').removeClass('d-none');
        var htmlCate = '';
        var exist = data_menucate.filter(item => item.current);
        if (exist.length > 0 ){
          exist = exist[0];
          if (exist.subcate.length > 0) {
            $.each(exist.subcate,function(j,k){		
              htmlCate +='<div class="cate-menu--item sub-'+j+(k.current ? ' active' : '')+'">';
              htmlCate +='	<div class="box">';
              htmlCate +='		<a href="'+k.link+'" class="">';
              htmlCate +='			<span>'+k.title+'</span>';
              htmlCate +='		</a>';
              htmlCate +='	</div>';
              htmlCate +='</div>';						
            });
          }
          else {
            $.each(data_menucate,function(i,v){
              htmlCate +='<div class="cate-menu--item '+(v.current ? 'active' : '')+'">';
              htmlCate +='	<div class="box">';
              htmlCate +='		<a href="'+v.link+'" class="">';
              htmlCate +='			<span>'+v.title+'</span>';
              htmlCate +='		</a>';
              htmlCate +='	</div>';
              htmlCate +='</div>';		
            });
          }
          $('.cate-menu.render-ajax .cate-menu--list').html('');
          $('.cate-menu.render-ajax .cate-menu--list').html(htmlCate);
        }
        else {
          $.each(data_menucate,function(i,v){
            htmlCate +='<div class="cate-menu--item '+(v.current ? 'active' : '')+'">';
            htmlCate +='	<div class="box">';
            htmlCate +='		<a href="'+v.link+'" class="">';
            htmlCate +='			<span>'+v.title+'</span>';
            htmlCate +='		</a>';
            htmlCate +='	</div>';
            htmlCate +='</div>';		
          });
          $('.cate-menu.render-ajax .cate-menu--list').html('');
          $('.cate-menu.render-ajax .cate-menu--list').html(htmlCate);
        }
        $('.cate-menu.render-ajax').removeClass('d-none');
        WEBDS.Collection.cateNav();
      }
      else {
        $('.cate-menu.render-ajax').addClass('d-none');
      }			
    }
    
		//Render Color		
		var indexColor = 0;
		//$.each(color_filter,function(i,v){//
		$.each(color_code,function(i,v){
			var style_bg = 'style="background-color: '+color_code[i]+'"';
			if( i == 'Nhiều màu' || i == 'Hoạ tiết'){
				style_bg = 'style="background: url('+color_code[i]+') no-repeat; background-size: 150% 150%; background-position: center;"';
			}
			var html_color =  '';
					html_color += '<li class="">';
					//html_color += 		'<input type="checkbox" id="data-color-p' + indexColor + '" value="' + i + '" name="color-filter" data-color="'+ WEBDS.Helper.change_alias(i) + '" />';
					html_color += 		'<input type="checkbox" id="data-color-p' + indexColor + '" value="' + i + '" name="color-filter" data-color="(variant:product='+i+')" />';
					html_color += 		'<label for="data-color-p'+ indexColor +'" title="'+i+'">'+ '<span class="bg" '+style_bg+'></span><span>' +i+'</span></label>';
					html_color += '</li>';
			indexColor ++;
			$('.filter-color ul').append(html_color);
			$('.filter-color').addClass('has-data');
		});
		
		//Render Size	
		$.each(data_size,function(i,v){
			var html_size =  '';
					html_size += '<li class="">';
					html_size += 		'<input type="checkbox" id="data-size-p' + i + '" value="'+v+'" name="size-filter" data-size="(variant:product='+v+')" />';
					html_size += 		'<label for="data-size-p'+ i +'"><span>'+v+'</span></label>';
					html_size += '</li>';
			$('.filter-size ul').append(html_size);
			$('.filter-size').addClass('has-data');
		});
		
		//Check show/hide
		$(".wrapper-filter .filter-group .checkbox-list" ).each(function(){
			var lenght_li	= $(this).find('li').length;
			if(lenght_li > 0) {
				$(this).parents('.filter-group').removeClass('d-none');
			}
		});
		
		//Render Mobile Filter
		if($(window).width() < 992) {
      $('.sidebar-box[data-mb="sidebar-box--mb-vendor"] .sidebar-box--block').appendTo($('#sidebar-box--mb-vendor'));
      $('.sidebar-box[data-mb="sidebar-box--mb-size"] .sidebar-box--block').appendTo($('#sidebar-box--mb-size'));
			$('.sidebar-box[data-mb="sidebar-box--mb-color"] .sidebar-box--block').appendTo($('#sidebar-box--mb-color'));
      $('.sidebar-box[data-mb="sidebar-box--mb-price"] .sidebar-box--block').appendTo($('#sidebar-box--mb-price'));
			$('.dropdown-sort[data-mb="sidebar-box--mb-sort"]').appendTo($('#sidebar-box--mb-sort .filter-sort'));	
		}
    
	},
	getCollectionItem: function(page,filter){
		var handleColl = $('#collection-page').attr('data-handle');
		var idColl = $('#collection-page').attr('data-id');
		var sortby = default_sort != 'manual' ? $('.sortBy input[value="'+default_sort+'"]').attr('data-filter') : '(price:product=asc)';
		if($('.sortBy li.active').length > 0) sortby = $('.sortBy li.active input').attr('data-filter');

		// Init Default
		var url_get = '/search.js?q=filter=((collectionid:product'+(idColl == '0'?'>=':'=')+idColl+'))&sortby='+sortby+'&page='+(page != undefined?page:1)+'&limit='+num_per_page;
		
		// Init Load no filter
		if((WEBDS.Collection.strFilter == '' && filter == undefined) || (filter != undefined && filter == false)){
			WEBDS.Collection.strFilter = '';
			var check_pathname = window.location.pathname.split('/').reverse();
			if(check_pathname[0] == ''){
				check_pathname.splice(0,1);
			}

			check_pathname = check_pathname.reverse().join('/');
			url_get = check_pathname+'/products.json?limit='+num_per_page+'&page='+(page != undefined?page:1);
		}

		// Init Load has filter
		if(filter != undefined && filter && WEBDS.Collection.strFilter != ''){
			url_get = '/search.js?q=filter='+WEBDS.Collection.strFilter+'&page='+(page != undefined?page:1)+'&limit='+num_per_page;
			$(".collection-pagi").addClass("filter");
			$(".collection-pagi").html('');
		}
		$('.js-ResultCount').html(default_products+' Sản phẩm');

		$.get(url_get).done(function(data){
			
			if(WEBDS.Collection.strFilter == '' && url_get.indexOf('search') > -1) {
				WEBDS.Collection.strFilter = '(collectionid:product'+(idColl == '0'?'>=':'=')+idColl+')&sortby='+sortby;
			}
      
			if(data.total > 0 || (data.hasOwnProperty('products') && data.products.length > 0)){
				
				if($('#collection-page .product-item:not(.product-loading)').length == 0){
					$('#collection-page .grid-products').html('');
				}

				if((page != undefined && page == 1 || page == undefined) && url_get.indexOf('search') > -1){
					$('.js-ResultCount').html(data.total+' Sản phẩm');
				}

				/* Phân trang */
				if(url_get.indexOf('search') > -1){
					$('.collection-pagi').attr('data-current',page).attr('data-pages',Math.ceil(data.total / num_per_page));
					
					if(WEBDS.Collection.origin.total_product == 0 && WEBDS.Collection.origin.total_page == 0){
						WEBDS.Collection.origin.total_product = data.total;
						WEBDS.Collection.origin.total_page = Math.ceil(data.total / num_per_page);
						if(WEBDS.Collection.origin.total_page > 1){
							$.ajax({ 
								url: '/search?q=filter='+WEBDS.Collection.strFilter+'&view=pagination&page='+page,
								async: false,
								success:function(data){
									$(".collection-pagi").html(data); // in phân trang
								}
							});
							$('.collection-pagi').removeClass('d-none');
						}
						else if (WEBDS.Collection.origin.total_page == 1) {
							$('.collection-pagi').addClass('d-none');
						}
					}
					else {
						if(WEBDS.Collection.origin.total_page > 1){
							$.ajax({ 
								url: '/search?q=filter='+WEBDS.Collection.strFilter+'&view=pagination&page='+page,
								async: false,
								success:function(data){
									$(".collection-pagi").html(data); // in phân trang
								}
							});
							$('.collection-pagi').removeClass('d-none');
						}
						else if (WEBDS.Collection.origin.total_page == 1){
							$('.collection-pagi').addClass('d-none');
						}
					}
				}
				else {
					$('.collection-pagi').attr('data-current',page).attr('data-pages',default_total);
					if(WEBDS.Collection.origin.total_product == 0 && WEBDS.Collection.origin.total_page == 0){
						WEBDS.Collection.origin.total_product = default_products;
						WEBDS.Collection.origin.total_page = default_total;
						if(WEBDS.Collection.origin.total_page > 1){
							$.ajax({ 
								url: handleColl+'?view=pagination&page='+page,
								async: false,
								success:function(data){
									$(".collection-pagi").html(data); // in phân trang
								}
							});
							$('.collection-pagi').removeClass('d-none');
						}
						else {
							$('.collection-pagi').addClass('d-none');
						}
					}	
					else {
						if(WEBDS.Collection.origin.total_page > 1){
							$.ajax({ 
								url: handleColl+'?view=pagination&page='+page,
								async: false,
								success:function(data){
									$(".collection-pagi").html(data); // in phân trang
								}
							});
							$('.collection-pagi').removeClass('d-none');
						}
						else {
							$('.collection-pagi').addClass('d-none');
						}
					}
				}
        /* End Phân trang */

				var html_loop = '';
				data.products.map((item,ind) => {
					var number_loop = num_per_page*(page - 1) + (ind + 1);
          html_loop += `<div class="product-tile product-loop pr${number_loop}">` + WEBDS.Global.renderLoop(item,number_loop) + `</div>`;
				});
				
				if(page == 1) $('#collection-page .grid-products').html(html_loop);
				else $('#collection-page .grid-products').append(html_loop);
			}
			else{
				$('.gridcount-section .ajax-render .grid-products').html('<div class="grid-empty alert-info">Chưa có sản phẩm nào trong danh mục này</div>');
				$('.collection-pagi').attr('data-current',0).attr('data-pages',0).addClass('d-none');
				$('.js-ResultCount').html('0 Sản phẩm');
			}
			
			WEBDS.Collection.pagination();
			$('.js-ResultCount').removeClass('d-none');
		});
	},
	stringFilter: function(){	
		var $this = this;
		var idColl = $('#collection-page').attr('data-id');
		var query = [];
		var change_url = [];

    /* Filter Badge*/
    if($('#filter-badge input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-badge input:checked').each(function(){
				var badge = $(this).attr('data-badge');
				temp.push(badge);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-badge').parents('.filter-group').index();
			$('.filter-tag:eq('+index_group+') b').text(picked.join(','));
			$('.filter-tag:eq('+index_group+')').addClass('opened');
			change_url.push('badge='+picked.join(','));
      WEBDS.Collection.picked.badge = picked;
		}	
    
    /* Filter Vendor */
		if($('#filter-vendor input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-vendor input:checked').each(function(){
				var vendor = $(this).attr('data-vendor');
				temp.push(vendor);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-vendor').parents('.filter-group').index();
			$('.filter-tag:eq('+index_group+') b').text(picked.join(','));
			$('.filter-tag:eq('+index_group+')').addClass('opened');
			change_url.push('vendor='+picked.join(','));
      WEBDS.Collection.picked.vendor = picked;
		}	

    /* Filter Size */
		if($('#filter-size input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-size input:checked').each(function(){
				var size = $(this).attr('data-size');
				temp.push(size);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-size').parents('.filter-group').index();
			$('.filter-tag:eq('+index_group+') b').text(picked.join(','));
			$('.filter-tag:eq('+index_group+')').addClass('opened');
			change_url.push('size='+picked.join(','));
      WEBDS.Collection.picked.size = picked;
		}
    
    /* Filter Color */
		if($('#filter-color input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-color input:checked').each(function(){
				/*var aliasColor = $(this).val();
				var valueColor = '(variantonhand_p1:product ** '+ aliasColor +')';
				temp.push(valueColor);
				picked.push(aliasColor);
				*/
				var color = $(this).attr('data-color');
				temp.push(color);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-color').parents('.filter-group').index();
			$('.filter-tag:eq('+index_group+') b').text(picked.join(','));
			$('.filter-tag:eq('+index_group+')').addClass('opened');
			change_url.push('color='+picked.join(','));
      WEBDS.Collection.picked.color = picked;
		}	
    		
		/* Filter Price */
		if($('#filter-price input:checked').length > 0){
			var temp = [];
			var picked = [];
			$('#filter-price input:checked').each(function(){
				var size = $(this).attr('data-price');
				temp.push(size);
				picked.push($(this).val());
			});
			query.push('('+temp.join('||')+')');
			var index_group = $('#filter-price').parents('.filter-group').index();
			$('.filter-tag:eq('+index_group+') b').text(picked.join(','));
			$('.filter-tag:eq('+index_group+')').addClass('opened');
			change_url.push('price='+picked.join(','));
      WEBDS.Collection.picked.price = picked;
		}
    
		if(query.length > 0){
			query = '(collectionid:product'+(idColl == '0'?'>=':'=')+idColl+')&&'+ query.join('&&');
			WEBDS.Collection.strFilter = '(' + encodeURIComponent( query ) + ')';
		}
    else{
      $('.layered-filter--tags-wrapper').addClass('d-none');
    }

		/* Sort */
		if($('.sortBy li.active').length > 0){
			var idColl = $('#collection-page').attr('data-id');
			var sort = $('.sortBy li.active input').attr('data-filter');
			sort = 'sortby=' + sort;
			if (idColl == '0'){
				if(query.length == 0) WEBDS.Collection.strFilter = '(collectionid:product>='+idColl+')';
			}
			else {
				if(query.length == 0) WEBDS.Collection.strFilter = '(collectionid:product='+idColl+')';
			}
			WEBDS.Collection.strFilter += '&' + sort;
			change_url.push('sort_by='+$('.sortBy li.active input').val());

			$('.sortbyfilter .sort-selected').text($('.sortBy li.active input').siblings('label').text());
			$('.filter-tag--sortby b').text($('.sortBy li.active input').siblings('label').text());
			$('.filter-tag--sortby').addClass('opened');
		}

		if($('.layered-filter--tags .filter-tag.opened').length > 0) $('.layered-filter--tags-wrapper').removeClass('d-none');
		else $('.layered-filter--tags-wrapper').addClass('d-none');

		//$('#collection-page .products-grid').html('');
		WEBDS.Collection.getCollectionItem(1,query.length > 0 || $('.sortBy li.active').length > 0?true:false);

		//history.pushState(null, "", window.location.pathname+( change_url.length > 0 || $this.paramTracking.length > 0 ? '?'+change_url.join('&')+$this.paramTracking.join('&') : '') );

		/* Save query string with key is string replace on URL. Target: After refresh with url can quick load result then backup options picked. */
		//var logFilter = sessionStorage.getItem('query');
		//logFilter = logFilter == null?{}:JSON.parse(logFilter);
		//logFilter[change_url.join('&')] = WEBDS.Collection.strFilter;
		//sessionStorage.setItem('query',JSON.stringify(logFilter));
		
		var x = $('.collection-wrapper .collection-head').offset().top;
		WEBDS.Helper.smoothScroll(x-140, 500);
	},
	backUpSidebar: function(){
		var $this = this;
		$.each(paramUrl,function(key,value){
			if(key == 'badge'){
        var badges = paramUrl.badge.split(',');
				badges.map(badge => {
					$('#filter-badge input[value="'+decodeURIComponent(badge)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-badge').parents('.filter-group').index();
				$('.filter-tag:eq('+index_group+') b').text(decodeURIComponent(paramUrl.badge));
				$('.filter-tag:eq('+index_group+')').addClass('opened');
      }
      else if(key == 'vendor'){
				var vendors = paramUrl.vendor.split(',');
				vendors.map(vendor => {
					$('#filter-vendor input[value="'+decodeURIComponent(vendor)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-vendor').parents('.filter-group').index();
				$('.filter-tag:eq('+index_group+') b').text(decodeURIComponent(paramUrl.vendor));
				$('.filter-tag:eq('+index_group+')').addClass('opened');
			}
      else if(key == 'size'){
				var sizes = paramUrl.size.split(',');
				sizes.map(size => {
					$('#filter-size input[value="'+decodeURIComponent(size)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-size').parents('.filter-group').index();
				$('.filter-tag:eq('+index_group+') b').text(decodeURIComponent(paramUrl.size));
				$('.filter-tag:eq('+index_group+')').addClass('opened');
			}
      else if(key == 'color'){
				var colors = paramUrl.color.split(',');
				colors.map(color => {
					$('#filter-color input[value="'+decodeURIComponent(color)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-color').parents('.filter-group').index();
				$('.filter-tag:eq('+index_group+') b').text(decodeURIComponent(paramUrl.color));
				$('.filter-tag:eq('+index_group+')').addClass('opened');
			}	
			else if(key == 'price'){
				var prices = paramUrl.price.split(',');
				prices.map(price => {
					$('#filter-price input[value="'+decodeURIComponent(price)+'"]').prop('checked',true);
				});
				var index_group = $('#filter-price').parents('.filter-group').index();
				$('.filter_tag:eq('+index_group+') b').text(decodeURIComponent(paramUrl.price));
				$('.filter_tag:eq('+index_group+')').addClass('opened');
			}
			else if(key == 'sort_by'){
				$('.sortBy li').removeClass('default');
				$('.sortBy li').removeClass('active');
				$('.sortBy input[value="'+paramUrl.sort_by+'"]').parent().addClass('active');
				var sort = $('.sortBy input[value="'+paramUrl.sort_by+'"] + label').text();
				$('.sortbyfilter .sort-selected').text(sort);				
				$('.filter-tag--sortby b').text(sort);
				$('.filter-tag--sortby').addClass('opened');
			}
			else {
				$this.paramTracking.push(key+'='+value);
			}
		});

		if($('.layered-filter--tags .filter-tag.opened').length > 0) $('.layered-filter--tags-wrapper').removeClass('d-none');
	},
	actionFilter: function(){    
		/* Apply Filter Picked At Sidebar */
		$('.filter-controls .btn-apply-filter-js').on('click',function(){
  		WEBDS.Collection.stringFilter();
		});
    
    /* Clear All Filter Picked At Sidebar */
		$('.filter-controls .btn-clear-filter-js').on('click',function(){
  		$('.filter-group input[type="checkbox"]').prop('checked',false);
			$('.layered-filter--tags .filter-tag').removeClass('opened');

			$('.sortBy input').prop('checked',false);
			$('.sortBy li').removeClass('active');
			$('.sortbyfilter .sort-selected').text('Sản phẩm nổi bật');
			$('.sortBy li input[value="manual"]').parents('li').addClass('default');

			WEBDS.Collection.stringFilter();
			$('body').removeClass('open-overlay open-noscroll open-sidebar-filter');
		});

		/* Checklist */
		$(document).on('click','.checkbox-list li > input',function() {
			$(this).parent().toggleClass('active');
			if ($(window).width() >= 992) {}
			WEBDS.Collection.stringFilter();
      
			var indexTitle = $(this).parents('.filter-group').index();
			if ($(this).parents('.filter-group').find('input:checked').length > 0) {
				var textFilter = [];
				$(this).parents('.filter-group').find('input:checked').each(function() {
					var textVal = $(this).siblings('label').html();
					textFilter.push(textVal);
				});
				$('.filter-tag:eq(' + indexTitle + ') b').html(textFilter.join(', ')).parent().addClass('opened');
			} 
			else {
				$('.filter-tag:eq(' + indexTitle + ') b').html('').parent().removeClass('opened');
			}

			if ($('.checkbox-list li.active').length == 0) {
				$('.layered-filter--tags-wrapper').addClass('d-none');
			}
			else {
				$('.layered-filter--tags-wrapper').removeClass('d-none');
			}
		
		});
		
		/* Sort */
		$('input[name="cfb-sort-input"]').on('change',function(){
			$('.sortBy li').removeClass('default');
			$('.sortBy li').removeClass('active');
			$(this).parent().addClass('active');
			WEBDS.Collection.stringFilter();
		});

		/* Clear filter item */
		$(document).on('click','.filter-tag--remove',function() {
			var ind_tag = $(this).parents('.filter-tag').index();
			var type_filter = $(this).parents('.filter-tag').attr('data-title');
			if($(this).parent().hasClass('filter-tag--sortby')){
				$('.sortBy li').removeClass('active');
				$('.sortBy li input').prop('checked',false);
				$('.sortbyfilter .sort-selected').text('Sản phẩm nổi bật');
				$('.sortBy li input[value="manual"]').parents('li').addClass('default');
			}
      else{ 
        if ($(window).width() >= 992) {
          $('.wrapper-filter .filter-group:eq('+ind_tag+') input:checked').click();
        }
        else {
          $('.collection-filter--mb .filter-group:eq('+ind_tag+') input:checked').click();
        }    
      } 

			$(this).parents('.filter-tag').removeClass('opened');
			$('.filter-group:eq('+ind_tag+') .action-list .js-btn-clear').attr('data-picked','');
			$('.filter-group:eq('+ind_tag+') .action-list .js-btn-clear').addClass('disabled').attr('disabled',true);
			WEBDS.Collection.stringFilter();
		});
		
		/* Clear all filter item */
		$(document).on('click','.filter-tag--remove-all',function() {
			$('.filter-group input[type="checkbox"]').prop('checked',false);
			$('.layered-filter--tags .filter-tag').removeClass('opened');

			//$('.sortBy input').prop('checked',false);
			//$('.sortBy li').removeClass('active');
			//$('.sortbyfilter .sort-selected').text('Sản phẩm nổi bật');
			//$('.sortBy li input[value="manual"]').parents('li').addClass('default');
			
			WEBDS.Collection.stringFilter();
			$('body').removeClass('open-overlay open-noscroll open-sidebar-filter');
		});
	},
	actionStyle: function(){
		// Click dropdown
    $('.sidebar-box--subtitle').click(function(e){
      e.preventDefault();
			if($(this).parents('.sidebar-box').hasClass('sidebar-box--show')){
				$(this).parents('.sidebar-box').removeClass('sidebar-box--show');
			}
			else {
				$(this).parents('.sidebar-box').addClass('sidebar-box--show');
			}
    })
		
    // Event open filter
		$(document).on("click", '.collection-layout .button-wrapper a', function(e){
      e.preventDefault();
      var target = $(this).attr('data-filter');
      if($(window).width() < 992) {
        $('.collection-filter--mb .sidebar-tabnav h4').removeClass('active');
        $('.collection-filter--mb .sidebar-tablist .sidebar-boxscrol').removeClass('active');
        $('.collection-filter--mb .sidebar-tabnav h4[data-filter="'+target+'"]').addClass('active');
        $('.collection-filter--mb .sidebar-tablist .sidebar-boxscrol[data-filter="'+target+'"]').addClass('active');
                
        $('body,html').addClass('lock-scroll open-filtermb');
        $('.collection-filter--mb').addClass('filter--mb-show');
        $('.collection-filter--mb').css('height','70vh');
      }
      else {
        if($(this).parents('.button-wrapper').hasClass('is-active')){
  				$(this).parents('.button-wrapper').removeClass('is-active');
  			}
  			else {
  				$(this).parents('.button-wrapper').addClass('is-active');
  			}
      }
      $('.collection-wrapper').addClass('has-filter');
    });
	},
	pagination: function(){
		$(document).on('click','.collection-pagi #pagination a',function(e){
      var link = $(this).attr("data-link");
      if(link != '' && link != undefined){
  			var total = Number($(".collection-pagi").attr('data-pages'));
  			var cur_page = Number($(".collection-pagi").attr('data-current'));
        var picked = [];
        
  			if(link == 'm') link = cur_page - 1;
  			if(link == 'p') link = cur_page + 1;
  			link = parseInt(link);
				WEBDS.Collection.picked.page = link;
				
				/*
        $.each(WEBDS.Collection.picked,function(key,value){
          picked.push(key+'='+value);
        });
				history.pushState(null, "", window.location.pathname + '?' + picked.join('&') );
				*/
				
				history.pushState(null, "", window.location.pathname );
				
  			WEBDS.Collection.getCollectionItem(link,true);
  			var x = $('.collection-wrapper .collection-head').offset().top;
  			WEBDS.Helper.smoothScroll(x-140, 500);
      }
      else{
        window.location.href = $(this).attr('href');
      }
		});
	},
}
WEBDS.Cart = {
	checkout: null,
	init: function(){
		var that = this; 
		that.cartRender.init();
		that.submitCheckout();
    that.sliderCollection();
    if (window.milestoneGifts && window.milestoneGifts.enabled) {
      that.milestoneGift.init();
    }
	},
	cartRender: {
		init: function(){
			var that = this;
			WEBDS.Global.cartAjax(function(cart){
				that.cartOrder();
			});
			that.changeItemQty();
			that.changeItemSelect();
		},
		renderLineItem: function (item,line) {
			var htmlLine = '';
      var titleLine = item.title;
      var currentVariant = null;
      if (item.inAdmin && item.inAdmin.variants && item.inAdmin.variants.length) {
        currentVariant = item.inAdmin.variants.find(function(variant) {
          return String(variant.id) === String(item.variant_id);
        });
      }
      // RENDER SELECTED OPTIONS
      var selectedOptions = '';
      if (currentVariant && Array.isArray(currentVariant.options) && item.inAdmin && Array.isArray(item.inAdmin.options) ) {  
          var optionHtml = [];
          item.inAdmin.options.forEach(function(option, index) {
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
          selectedOptions = optionHtml.join('<span class="seperate d-none"></span>');
      }
  		
      //Unit
      var del_price = '', precent_price = '0', current_price = Haravan.formatMoney(item.price,shop.moneyFormat).replaceAll(',','.');
      if(item.price_orginal > item.price ){
				del_price = Haravan.formatMoney(item.price_orginal,shop.moneyFormat).replaceAll(',','.');
				precent_price = Math.round((item.price_orginal - item.price)/item.price_orginal * 100);
			}
			else {
				var find_variant = item.inAdmin.variants.filter(variant => variant.id == item.variant_id);
        current_price = Haravan.formatMoney(find_variant[0].price,shop.moneyFormat).replaceAll(',','.');
				if(find_variant[0].compare_at_price > find_variant[0].price ) {
					del_price = Haravan.formatMoney(find_variant[0].compare_at_price,shop.moneyFormat).replaceAll(',','.');
					precent_price = Math.round((find_variant[0].compare_at_price - find_variant[0].price)/find_variant[0].compare_at_price * 100);
				}
			}
      
			var optionImg = 'https://cdn.hstatic.net/files/200001179192/file/no-image.jpg' ;		
      if (item.image != null) optionImg = item.image;
			var variantCheck = item.inAdmin.variants.filter( variant => {
				if (JSON.stringify(variant.options) == JSON.stringify(item.variant_options)) {
					return true;
				}
			});	
      
			//console.log(variantCheck);
			if (variantCheck[0].length > 0) {
				if (variantCheck[0].featured_image != null){
					optionImg = variantCheck[0].featured_image.src;
				}
			}
								
			htmlLine += 	'<div class="line-item" data-item-id="'+item.id+'" data-product-id="'+item.product_id+'" data-variant-id="'+item.variant_id+'" data-url="'+item.url+'" data-sku="'+item.sku+'" data-quantity="'+item.quantity+'" data-line="'+(line+1)+'">';
			htmlLine +=			'<div class="line-item--media">';
			htmlLine +=				'<div class="img">';
			htmlLine +=					'<a href="'+item.url+'" aria-label="'+titleLine+'" title="'+titleLine+'">';
			htmlLine +=						'<img alt="'+titleLine+'" src="'+Haravan.resizeImage(optionImg,'large')+'">';
			htmlLine +=					'</a>';
			htmlLine +=				'</div>';
			htmlLine +=			'</div>';
			htmlLine +=			'<div class="line-item--info">';
			htmlLine +=				'<div class="detail">';
			htmlLine +=					 '<div class="title">';
      htmlLine +=           '<a href="'+item.url+'">'+titleLine+'</a>';
      if (selectedOptions != '') {
        htmlLine +=         '<div class="selected-list">' + selectedOptions + '</div>';
      }
      else if (item.variant_title) {
        htmlLine +=         '<div class="selected-list">' + item.variant_title + '</div>';
      }
      htmlLine +=       '</div>';
			htmlLine +=					 '<div class="desc">';
			if (item.price > 100) { 
        htmlLine +=					  '<div class="price">';
        htmlLine +=						  '<div class="price-current"><span>'+current_price+'</span></div>';
        if (del_price != '') {
  				htmlLine +=						'<div class="price-compare"><del>'+del_price+'</del></div>';
  			}
  			htmlLine +=					  '</div>';          
    	}
			else {
  			htmlLine +=					'<div class="price">';
  			htmlLine +=						'<div class="price-current"><span>'+(Haravan.formatMoney(item.price,shop.moneyFormat).replaceAll(',','.'))+'</span></div>';
  			htmlLine +=					'</div>';
			}
      htmlLine +=					 '<div class="quantity">';
      htmlLine +=					  '<div class="qty-box">';
			htmlLine +=						  '<button class="qty-btn minus '+(item.quantity > 1 ? '' : 'disabled' )+'" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none"><path d="M5 12.582H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
			htmlLine +=						  '<input data-line="'+(line+1)+'" readonly="" data-vid="'+item.variant_id+'" id="updates_'+item.variant_id+'" data-price="'+item.price+'" name="updates[]" class="quantity qty-input" data-current="'+item.quantity+'"  pattern="[0-9]" data-min="1" type="text" value="'+item.quantity+'">';
			htmlLine +=						  '<button class="qty-btn plus" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none"><path d="M12 5.58203V19.582M5 12.582H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
			htmlLine +=					  '</div>';
      htmlLine +=				   '</div>';
      htmlLine +=				  '</div>';
      
			htmlLine +=				'</div>';
			htmlLine +=				'<div class="action">';
			if (item.price > 100) { 
        htmlLine +=					'<div class="delete">';
  			htmlLine +=						'<a class="remove-product glass" href="javascript:void(0);" onclick="WEBDS.Cart.cartRender.deleteItemCart(' + (line+1) + ')"><span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.3333 5.00008V4.33341C13.3333 3.39999 13.3333 2.93328 13.1517 2.57676C12.9919 2.26316 12.7369 2.00819 12.4233 1.8484C12.0668 1.66675 11.6001 1.66675 10.6667 1.66675H9.33333C8.39991 1.66675 7.9332 1.66675 7.57668 1.8484C7.26308 2.00819 7.00811 2.26316 6.84832 2.57676C6.66667 2.93328 6.66667 3.39999 6.66667 4.33341V5.00008M8.33333 9.58341V13.7501M11.6667 9.58341V13.7501M2.5 5.00008H17.5M15.8333 5.00008V14.3334C15.8333 15.7335 15.8333 16.4336 15.5608 16.9684C15.3212 17.4388 14.9387 17.8212 14.4683 18.0609C13.9335 18.3334 13.2335 18.3334 11.8333 18.3334H8.16667C6.76654 18.3334 6.06647 18.3334 5.53169 18.0609C5.06129 17.8212 4.67883 17.4388 4.43915 16.9684C4.16667 16.4336 4.16667 15.7335 4.16667 14.3334V5.00008" stroke="#A4A7AE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>';
  			htmlLine +=					'</div>';
      }
			htmlLine +=				'</div>';
			htmlLine +=			'</div>';
			htmlLine +=		'</div>';

			return htmlLine;
		},
		cartOrder: function () {			
			$('.cart-summary .total-quanlity .js-total-quanlity').html('('+cartJS.item_count+' món)');
			$('.cart-summary .total-price .js-total-price').html(Haravan.formatMoney(cartJS.total_price,shop.moneyFormat).replaceAll(',','.'));
			
			if(window.cartJS.items.length > 0){
				var html = $('#cloned-item--2').html();
				$('#cart-page .js-render-itemcart').html(html);
				$('#cart-page .js-render-itemcart').removeClass('cart-order--loading');
				$('.mainLoading').removeClass('active');
				//$('#checkout').removeClass('disabled').attr('disabled',false);
				
				var content_cart = '';				
				cartJS.items.map((item,line) => {			
					content_cart += WEBDS.Cart.cartRender.renderLineItem(item,line);
					//console.log(item);
				});
				$('#cart-page .js-render-itemcart .table-cart').html(content_cart);
			}
			else {
				var html = $('#cloned-item--1').html();
				$('#cart-page .cart-left').addClass('cart-emty');
				$('#cart-page .cart-left').html(html);
				$('.mainLoading').removeClass('active');
				//$('#checkout').addClass('disabled').attr('disabled',true);
			}	
		},
		changeItemSelect: function() { 
			// Click dropdown
			$(document).on("click",'body', function(e){
				$('.box-option').not($('.box-option').has(e.target)).removeClass('box-option--show');
			});
      $(document).on('change','.line-item .variant-option select',function(){
        
  			var line = $(this).attr('data-line');
  			var quantity = $(this).parents('.line-item').find('.qty-input').val();
        var $parent = $(this).parents('.line-item');
        var data = [];
        var idNew = 0;
        var	vridCurrent = $parent.attr('data-variant-id');
        $parent.find('.variant-option select').each(function(){
					data.push($(this).find('option:selected').val());
				});
        var acceptChange = false;
				var variantCheck = cartJS.items[line - 1].inAdmin.variants.filter( variant => {
					if (JSON.stringify(variant.options) == JSON.stringify(data)) {
						return true;
					}					
				});	
				idNew = variantCheck[0].id;
				
				if(variantCheck[0].inventory_management == 'haravan'){
					if((variantCheck[0].inventory_policy == 'deny' && variantCheck[0].inventory_quantity >= quantity) || variantCheck[0].inventory_policy == 'continue'){
						if(variantCheck[0].inventory_quantity < quantity){
							acceptChange = false;
						}
						else {
							acceptChange = true;
						}
					}
				}
				else {
					acceptChange = true;
				}

        if(idNew != 0 && idNew != vridCurrent && acceptChange){
					$.post('/cart/change.js',{line: line, quantity: 0}).done(function(){
						$.post('/cart/add.js',{id: idNew, quantity: quantity}).done(function(data){
							if (data.error && data.status == 422 ){
								WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
								$parent.find('input[name="option"]').each(function(){
									var current = $(this).val();
									var index = $(this).attr('data-index');
									$(this).parents('select[data-option="'+index+'"]').find('option').prop("selected", false);
									$parent.find('select[data-option="'+index+'"] option[value="'+current+'"]').prop("selected", true);
								}); 
							}
							else {
								WEBDS.Global.cartAjax(function(cart){
									WEBDS.Cart.cartRender.cartOrder();
								});
							}
						});
					});
				}
				else {
					WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,3000);
					$parent.find('input[name="option"]').each(function(){
            var current = $(this).val();
            var index = $(this).attr('data-index');
            $(this).parents('select[data-option="'+index+'"]').find('option').prop("selected", false);
            $parent.find('select[data-option="'+index+'"] option[value="'+current+'"]').prop("selected", true);
          }); 
				}
        
  		});
      
		},
		changeItemQty: function () {
			var self = this;
			var handleQuantityClick = function() {
				$('.mainLoading').addClass('active');
				var $button = $(this);
				var $input = $button.siblings('.quantity');
				var inputVal = $($input).val()*1;
				var quantityMax = $input.data('max') || 999999;
				var quantityMin = $input.data('min') || 1;
				if($button.hasClass('plus')) {
					if(inputVal >= quantityMax) {
						$('.mainLoading').removeClass('active');
						WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,2000);
					}
					else {
						$input.val(inputVal + 1);
					}
				}
				else {
					if(inputVal == quantityMin) {
						$('.mainLoading').removeClass('active');
						return;
					}
					else {
						$input.val(inputVal - 1);
					}
				}
				$input.data('current', $input.val());
				self.updateCart(); 
			}
			var handleQuantityChange = function() {
				$('.mainLoading').addClass('active');
				var $input = $(this);
				var inputVal = $input.val()*1;
				var currentValue = $input.data('current');
				var quantityMax = $input.data('max') || 999999;
				var quantityMin = $input.data('min') || 1;
				var variantId = $input.parents('.line-item').data('data-variant-id');
				if(inputVal > quantityMax || inputVal < quantityMin) {
					$input.val(currentValue);
					$('.mainLoading').removeClass('active');
				}
				else {
					var newValue = $input.val();
					$input.data('current', newValue);
					self.updateCart(); 
				};
			}
			$(document).on('change', '.qty-box input[name="updates[]"]', handleQuantityChange);
			$(document).on('click', '.qty-box > button', handleQuantityClick);
		},
		deleteItemCart: function(line){
			$('.mainLoading').addClass('active');
			var params = {
				type: 'POST',
				url: '/cart/change.js',
				data: 'quantity=0&line=' + line,
				dataType: 'json',
				success: function(cart) {				
					WEBDS.Global.cartAjax(function(cart){
            /* Khuyến mãi quà tặng theo mốc đơn hàng (tối đa 4 mốc).*/
            if (window.milestoneGifts && window.milestoneGifts.enabled) {
               window.location.reload();
            }
            else {
  						WEBDS.Cart.cartRender.cartOrder();
            }
					});
					$('.mainLoading').removeClass('active');
				},
				error: function(XMLHttpRequest, textStatus) {
					Haravan.onError(XMLHttpRequest, textStatus);
				}
			};
			jQuery.ajax(params);
		},		
		updateCart: function(){
			$('.mainLoading').addClass('active');
			var params = {
				type: 'POST',
				url: '/cart/update.js',
				data: $('#cartformpage').serialize(),
				async: false,
				dataType: 'json',
				success: function(data) { 
					WEBDS.Global.cartAjax(function(cart){
						WEBDS.Cart.cartRender.cartOrder();
            /* Khuyến mãi quà tặng theo mốc đơn hàng (tối đa 4 mốc).*/
            if (window.milestoneGifts && window.milestoneGifts.enabled) {
              WEBDS.Cart.milestoneGift.sync(true);
            }
					});
					$('.mainLoading').removeClass('active');
				},
				error: function(XMLHttpRequest, textStatus) {
					WEBDS.Helper.SwalWarning(isText.text8,isText.text9,'error',false,false,3000);
				}
			};
			$.ajax(params);
		},
	},
	submitCheckout: function(){   
    var CHECKOUT_AGREEMENT_KEY = 'checkoutAgreementAccepted';
    function getCheckoutAgreement() {
      try {
        return sessionStorage.getItem(CHECKOUT_AGREEMENT_KEY) === '1';
      } catch (e) {
        return false;
      }
    }   
    function setCheckoutAgreement(checked) {
      try {
        if (checked) sessionStorage.setItem(CHECKOUT_AGREEMENT_KEY, '1');
        else sessionStorage.removeItem(CHECKOUT_AGREEMENT_KEY);
      } catch (e) {}
    }    
    function applyCheckoutAgreement() {
      var $checkbox = $('#checkout-agreement');
      var $checkout = $('#checkout');
      if (!$checkbox.length || !$checkout.length) return;
    
      var checked = getCheckoutAgreement();
      $checkbox.prop('checked', checked);
      $checkout
        .prop('disabled', !checked)
        .toggleClass('active', checked)
        .toggleClass('disabled', !checked);
    }  
    $(function () {
      applyCheckoutAgreement();
    });    
    $(window).on('pageshow', function () {
      applyCheckoutAgreement();
    });   
    $(document).on('change', '#checkout-agreement', function () {
      var checked = this.checked;
      setCheckoutAgreement(checked);
      $('#checkout')
        .prop('disabled', !checked)
        .toggleClass('active', checked)
        .toggleClass('disabled', !checked);
    });     

    //-------------------------------------------//
    $(document).on('click','#checkout',function(e){
			e.preventDefault();
			$('.cart-layout').addClass('js-loading');
      $(this).addClass('loading');
			var note = $('#note').val();
			var attributes = cartJS.attributes || {};	      
      var doCheckout = function() {
  			$.ajax({
  				type: 'post',
  				url: '/cart/update.js', 
  				data: {
  					attributes: attributes, 
  					note: (typeof note !== 'undefined' && note.length > 0) ? note : null
  				}, 
  				success: function(response){
            WEBDS.Global.cartAjax(function(){							
							$('#checkout').addClass('added');
							setTimeout(function(){
                $('#checkout').removeClass('loading');
                window.location = '/checkout';
								$('#btn-addtocart').removeClass('added'); 
							},300);
						},);
  				}
  			});			
      };

      /*
			if (window.milestoneGifts && window.milestoneGifts.enabled) {
        WEBDS.Cart.milestoneGift.validateBeforeCheckout().then(function(result) {
          if (!result.ok) {
            Swal.fire({
        			title: 'Thông báo',
        			text: result.message,
        			icon: 'info',
        			timer: false,
        			showCancelButton: true,
        			showConfirmButton: true,
        			confirmButtonText: 'Chọn quà',
        			cancelButtonText: 'Không',
        		}).then((rs) => {
        			if (rs.isConfirmed) {
        				WEBDS.Cart.milestoneGift.popup.open();
              }
              else if (rs.dismiss === Swal.DismissReason.cancel){
        				doCheckout();
        			}
        		})            
            return;
          }
          doCheckout();
        });
			} 
      else {
				doCheckout();
			}
      */
      doCheckout();
		});
	},
  sliderCollection: function(){		
    $('.section-collection-slider').each(function(index){     
      var currentTarget = '#'+$(this).attr('id');
      var currentId = $(this).find('.swiper').attr('data-id');
  		var currentTitle = $(this).find('.swiper').attr('data-title');
  		var currentHandle  = $(this).find('.swiper').attr('data-handle');
      var currentLimit =  Number($(this).find('.swiper').attr('data-limit'));
      var currentPerview =  Number($(this).find('.swiper').attr('data-perview'));
      var currentSize = Number($(this).find('.swiper').attr('data-size'));
      var currentType = $(this).find('.swiper').attr('data-type');    
      var checkBtnSwiper = Number($(this).find('.swiper').attr('data-btn-swiper'));
      WEBDS.Global.getItemSlide(currentId,currentTitle,currentHandle,currentType,1,currentLimit,currentPerview,currentSize,checkBtnSwiper,currentTarget);  		
    });		    
  },
  milestoneGift: {
    PROP: 'MilestoneGift',
    MAX: 4,
    cfg: null,
    productsByHandle: {},
    isBusy: false,
    SEL: {
      widget: '#milestone-gift-widget',
      barFill: '.milestone-bar-fill',
      markers: '.milestone-bar-markers',
      stepsWrap: '.milestone-progress-step',
      popup: '#milestone-gift-popup',
      popupBody: '#milestone-gift-popup-body'
    },
    init: function() {
      var that = this;
      if (!window.milestoneGifts || !window.milestoneGifts.enabled) return;
      if (!that.config.load()) return;
      that.config.validate();
      that.track.build();
      that.bindEvents();
      that.sync();
    },
    bindEvents: function() {
      var that = this;
      $(document).on('click', '.js-open-gift-popup', function(e) {
        e.preventDefault();
        that.popup.open();
      });
      $(document).on('click', '.js-close-gift-popup', function(e) {
        e.preventDefault();
        that.popup.close();
      });
      $(document).on('click', '.milestone-gift-card--select:not(.is-selected):not(:disabled)', function(e) {
        e.preventDefault();
        var $btn = $(this);
        that.selectGift($btn.data('variant-id'), $btn.data('milestone-id'));
      });
      $(document).on('keydown', function(e) {
        if (e.key === 'Escape') that.popup.close();
      });
    },
    reveal: function() {
      $(this.SEL.widget).removeAttr('style').show();
    },
    renderUI: function(cart) {
      var that = this;
      var totalVnd = that.cartApi.orderTotal(cart);
      var eligible = that.milestone.eligible(totalVnd);
      var existingGift = eligible ? that.cartApi.giftFor(cart, eligible.id) : null;

      $(that.SEL.barFill).css('width', that.milestone.progress(totalVnd) + '%');
      that.track.updateSteps(totalVnd, eligible);
      that.messages.render(totalVnd, eligible, existingGift);
      that.reveal();
      return that.popup.render(cart).then(function() { return cart; });
    },
    selectGift: function(variantId, milestoneId) {
      var that = this;
      if (that.isBusy) return;
      that.isBusy = true;
      $('body').addClass('add-loading');

      that.cartApi.fetch()
        .then(function(cart) { return that.cartApi.sync(cart); })
        .then(function(cart) {
          var totalVnd = that.cartApi.orderTotal(cart);
          var eligible = that.milestone.eligible(totalVnd);
          if (!eligible || eligible.id !== milestoneId) {
            return $.Deferred().reject({ message: 'Mốc này chưa đủ điều kiện chọn quà.' }).promise();
          }
          return that.cartApi.removeAllGifts(cart);
        })
        .then(function() {
          return that.cartApi.addGift(variantId, milestoneId);
        })
        .done(function() {
          window.location.reload();
        })
        .fail(function(xhr) {
          $('body').removeClass('add-loading');
          that.isBusy = false;
          that.popup.close();
          if (xhr && xhr.message) alert(xhr.message);
          else if (typeof Haravan !== 'undefined' && Haravan.onError) Haravan.onError(xhr);
          else alert('Không thể thêm quà tặng. Vui lòng thử lại.');
        });
    },
    sync: function(reloadOnGiftChange) {
      var that = this;
      if (that.isBusy) return $.Deferred().resolve().promise();
      var giftCountBefore = 0;
      return that.cartApi.fetch()
        .then(function(cart) {
          giftCountBefore = cart.items.filter(that.cartApi.isGift).length;
          return that.cartApi.sync(cart);
        })
        .then(function(cart) {
          var giftCountAfter = cart.items.filter(that.cartApi.isGift).length;
          if (reloadOnGiftChange && giftCountBefore !== giftCountAfter) {
            window.location.reload();
            return cart;
          }
          return that.renderUI(cart);
        });
    },
    validateBeforeCheckout: function() {
      var that = this;
      return that.cartApi.fetch()
        .then(function(cart) { return that.cartApi.sync(cart); })
        .then(function(cart) {
          var totalVnd = that.cartApi.orderTotal(cart);
          var eligible = that.milestone.eligible(totalVnd);
          if (!eligible) return { ok: true, cart: cart };
          var gift = that.cartApi.giftFor(cart, eligible.id);
          if (!gift) {
            return {
              ok: false,
              cart: cart,
              message: 'Bạn đạt mốc ' + eligible.label + ' nhưng chưa chọn quà tặng. Vui lòng chọn quà trước khi thanh toán.'
            };
          }
          return { ok: true, cart: cart };
        });
    },
    util: {
      escapeHtml: function(str) {
        return $('<div>').text(str || '').html();
      },
      money: function(vnd) {
        var cents = Math.max(0, Number(vnd) || 0) * 100;
        try {
          if (typeof Haravan !== 'undefined' && typeof Haravan.formatMoney === 'function') {
            return Haravan.formatMoney(cents, typeof formatMoney !== 'undefined' ? formatMoney : '₫');
          }
        } catch (e) {}
        return (cents / 100).toLocaleString('vi-VN') + '₫';
      },
      handles: function(milestone) {
        var h = milestone && milestone.handles;
        if (Array.isArray(h)) return h;
        if (typeof h === 'string' && h.length) {
          return h.split('|').map(function(s) { return s.trim(); }).filter(Boolean);
        }
        return [];
      },
      giftKey: function(id) {
        return 'milestone-' + id;
      },
      parseGiftId: function(item) {
        var that = WEBDS.Cart.milestoneGift;
        var raw = item.properties && item.properties[that.PROP];
        if (!raw) return null;
        var parts = (raw + '').split('-');
        return parseInt(parts[parts.length - 1], 10);
      },
      iconHtml: function() {
        var tpl = document.getElementById('milestone-icon-tpl');
        return tpl ? tpl.innerHTML : '';
      }
    },
    config: {
      load: function() {
        var that = WEBDS.Cart.milestoneGift;
        that.cfg = window.milestoneGifts || null;
        return !!(that.cfg && that.cfg.enabled && that.config.normalize());
      },
      normalize: function() {
        var that = WEBDS.Cart.milestoneGift;
        var list = (that.cfg.milestones || []).filter(function(m) {
          return m && m.enabled !== false && m.price > 0;
        });
        list.sort(function(a, b) { return a.price - b.price; });
        list.forEach(function(m) {
          m.handles = that.util.handles(m);
        });
        that.cfg.milestones = list.slice(0, that.MAX);
        that.cfg.count = that.cfg.milestones.length;
        return that.cfg.count;
      },
      validate: function() {
        var that = WEBDS.Cart.milestoneGift;
        var seen = {};
        that.cfg.milestones.forEach(function(m) {
          m.handles.forEach(function(h) {
            if (seen[h]) console.warn('[MilestoneGift] Handle trùng lặp: "' + h + '"');
            seen[h] = true;
          });
        });
      }
    },
    milestone: {
      list: function() {
        return WEBDS.Cart.milestoneGift.cfg.milestones;
      },
      eligible: function(totalVnd) {
        var result = null;
        this.list().forEach(function(m) {
          if (totalVnd >= m.price) result = m;
        });
        return result;
      },
      first: function() {
        var list = this.list();
        return list.length ? list[0] : null;
      },
      next: function(totalVnd) {
        var list = this.list();
        for (var i = 0; i < list.length; i++) {
          if (totalVnd < list[i].price) return list[i];
        }
        return null;
      },
      progress: function(totalVnd) {
        var list = this.list();
        var count = list.length;
        if (!count || totalVnd <= 0) return 0;
        if (totalVnd >= list[count - 1].price) return 100;
        var segmentWidth = 100 / count;
        for (var i = 0; i < count; i++) {
          var prevPrice = i === 0 ? 0 : list[i - 1].price;
          var currPrice = list[i].price;
          if (totalVnd < currPrice) {
            var range = currPrice - prevPrice;
            var segmentProgress = range > 0 ? (totalVnd - prevPrice) / range : 0;
            return Math.min(100, (i * segmentWidth) + (segmentProgress * segmentWidth));
          }
        }
        return 100;
      },
      positionPercent: function(index) {
        var count = this.list().length;
        return count ? ((index + 1) / count) * 100 : 0;
      },
      status: function(m, eligible) {
        if (!eligible) return 'locked';
        if (m.id === eligible.id) return 'active';
        if (m.price < eligible.price) return 'passed';
        return 'locked';
      }
    },
    cartApi: {
      fetch: function() {
        return $.getJSON('/cart.js');
      },
      isGift: function(item) {
        return !!(item.properties && item.properties[WEBDS.Cart.milestoneGift.PROP]);
      },
      orderTotal: function(cart) {
        var that = WEBDS.Cart.milestoneGift;
        var total = 0;
        (cart.items || []).forEach(function(item) {
          if (!that.cartApi.isGift(item)) total += item.line_price;
        });
        return total / 100;
      },
      giftFor: function(cart, milestoneId) {
        var that = WEBDS.Cart.milestoneGift;
        var key = that.util.giftKey(milestoneId);
        var items = cart.items || [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.properties && item.properties[that.PROP] === key) return item;
        }
        return null;
      },
      updateQty: function(updates) {
        return $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: { 'updates[]': updates },
          dataType: 'json'
        });
      },
      addGift: function(variantId, milestoneId) {
        var that = WEBDS.Cart.milestoneGift;
        var props = {};
        props[that.PROP] = that.util.giftKey(milestoneId);
        return $.ajax({
          type: 'POST',
          url: '/cart/add.js',
          data: { id: variantId, quantity: 1, properties: props },
          dataType: 'json'
        });
      },
      sync: function(cart) {
        var that = WEBDS.Cart.milestoneGift;
        var totalVnd = that.cartApi.orderTotal(cart);
        var eligible = that.milestone.eligible(totalVnd);
        var updates = [];
        var needsUpdate = false;

        cart.items.forEach(function(item, index) {
          if (that.cartApi.isGift(item)) {
            var milestoneId = that.util.parseGiftId(item);
            if (!eligible || milestoneId !== eligible.id) {
              updates[index] = 0;
              needsUpdate = true;
            } else if (item.quantity !== 1) {
              updates[index] = 1;
              needsUpdate = true;
            } else {
              updates[index] = 1;
            }
          } else {
            updates[index] = item.quantity;
          }
        });

        if (!needsUpdate) return $.Deferred().resolve(cart).promise();
        return that.cartApi.updateQty(updates);
      },
      removeAllGifts: function(cart) {
        var that = WEBDS.Cart.milestoneGift;
        var updates = [];
        var hasGift = false;
        cart.items.forEach(function(item, index) {
          if (that.cartApi.isGift(item)) {
            updates[index] = 0;
            hasGift = true;
          } else {
            updates[index] = item.quantity;
          }
        });
        if (!hasGift) return $.Deferred().resolve(cart).promise();
        return that.cartApi.updateQty(updates);
      }
    },
    product: {
      byHandle: function(handle) {
        var that = WEBDS.Cart.milestoneGift;
        if (that.productsByHandle[handle]) {
          return $.Deferred().resolve(that.productsByHandle[handle]).promise();
        }
        var dfd = $.Deferred();
        $.getJSON('/products/' + handle + '.js')
          .done(function(p) {
            that.productsByHandle[handle] = p;
            dfd.resolve(p);
          })
          .fail(function() {
            console.warn('[MilestoneGift] Không tải được sản phẩm: ' + handle);
            dfd.resolve(null);
          });
        return dfd.promise();
      },
      loadHandles: function(handles) {
        var that = WEBDS.Cart.milestoneGift;
        var dfd = $.Deferred();
        if (!handles.length) return dfd.resolve([]).promise();
        var products = new Array(handles.length);
        var loaded = 0;
        handles.forEach(function(handle, index) {
          that.product.byHandle(handle).done(function(product) {
            products[index] = product;
            loaded++;
            if (loaded === handles.length) dfd.resolve(products);
          });
        });
        return dfd.promise();
      }
    },
    popup: {
      open: function() {
        $(WEBDS.Cart.milestoneGift.SEL.popup).addClass('is-open').removeAttr('hidden');
        $('body').addClass('milestone-popup-open');
      },
      close: function() {
        $(WEBDS.Cart.milestoneGift.SEL.popup).removeClass('is-open').attr('hidden', 'hidden');
        $('body').removeClass('milestone-popup-open');
      },
      cardHtml: function(product, milestone, selectedVariantId, status) {
        var util = WEBDS.Cart.milestoneGift.util;
        if (!product || !product.variants || !product.variants.length) return '';
        var variant = product.variants[0];
        var available = variant.available !== false;
        var img = product.featured_image || '';
        var isActive = status === 'active';
        var isSelected = isActive && selectedVariantId === variant.id;
        var disabled = !isActive || !available || isSelected;
        var btnText = !isActive
          ? (status === 'passed' ? 'Mốc đã qua' : 'Chưa đạt mốc')
          : (isSelected ? 'Đã chọn' : (available ? 'Chọn quà' : 'Hết hàng'));
        var cardClass = 'milestone-gift-card' +
          (isSelected ? ' is-selected' : '') +
          (!isActive ? ' is-disabled' : '');
        var btnClass = 'milestone-gift-card--select button' + (isSelected ? ' is-selected' : '');
        return (
          '<div class="' + cardClass + '">' +
            '<div class="milestone-gift-card--inner">' +
              '<div class="milestone-gift-card--img">' +
                (img ? '<img src="' + img + '" alt="' + util.escapeHtml(product.title) + '">' : '') +
              '</div>' +
              '<div class="milestone-gift-card--title">' + util.escapeHtml(product.title) + '</div>' +
              '<button type="button" class="' + btnClass + '"' +
                ' data-variant-id="' + variant.id + '"' +
                ' data-milestone-id="' + milestone.id + '"' +
                (disabled ? ' disabled' : '') + '>' +
                btnText +
              '</button>' +
            '</div>' +
          '</div>'
        );
      },
      render: function(cart) {
        var that = WEBDS.Cart.milestoneGift;
        var totalVnd = that.cartApi.orderTotal(cart);
        var eligible = that.milestone.eligible(totalVnd);
        var selectedId = eligible ? (that.cartApi.giftFor(cart, eligible.id) || {}).variant_id : null;
        var $body = $(that.SEL.popupBody).empty();
        var chain = $.Deferred().resolve().promise();

        that.milestone.list().forEach(function(m) {
          //console.log(m);
          chain = chain.then(function() {
            return that.product.loadHandles(m.handles).then(function(products) {
              var status = that.milestone.status(m, eligible);
              var $group = $(
                '<section class="milestone-gift-group is-' + status + '" data-milestone-id="' + m.id + '">' +
                  '<h5 class="milestone-gift-group--title">' + that.util.escapeHtml(m.text || m.label) + '</h5>' +
                  '<div class="milestone-gift-group--list"></div>' +
                '</section>'
              );
              var $list = $group.find('.milestone-gift-group--list');
              (products || []).forEach(function(p) {
                if (p) $list.append(that.popup.cardHtml(p, m, selectedId, status));
              });
              $body.append($group);
            });
          });
        });
        return chain;
      }
    },
    messages: {
      needMore: function(totalVnd) {
        var that = WEBDS.Cart.milestoneGift;
        var next = that.milestone.next(totalVnd);
        if (!next) {
          //$('#milestone-msg-1').hide();
          $('#milestone-msg-1').html('Quà tặng theo mốc đơn hàng');
          return false;
        }
        var need = Math.max(0, next.price - totalVnd);
        $('#giftnoti1').html(
          'Bạn cần mua thêm <strong>' + that.util.money(need) +
          '</strong> để nhận quà tặng mốc <strong>' + that.util.escapeHtml(next.label) + '</strong>'
        );
        $('#milestone-msg-1').show();
        return true;
      },
      qualified: function(eligible) {
        var that = WEBDS.Cart.milestoneGift;
        //console.log(eligible);
        $('#giftnoti2').html(
          'Chúc mừng bạn đã đủ điều kiện nhận quà tại mốc số '+eligible.id+' là <strong>' + that.util.escapeHtml(eligible.label) +
          '</strong>, <a href="#" class="js-open-gift-popup">Nhấn vào biểu tượng <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.06691 8.88428C5.69522 8.88428 1.65814 8.88428 1.65814 8.88428C1.22958 8.88428 0.878906 9.2211 0.878906 9.63281V15.2513C0.878906 15.663 1.22958 15.9998 1.65814 15.9998C1.65814 15.9998 5.77969 15.9998 7.15786 15.9998C7.34117 15.9998 7.34117 15.8106 7.34117 15.8106V9.13864C7.34117 9.13864 7.34111 8.88428 7.06691 8.88428Z" fill="#FFC6D3"/><path d="M14.342 8.88428C14.342 8.88428 10.2894 8.88428 8.93869 8.88428C8.60959 8.88428 8.65887 9.21352 8.65887 9.21352V15.8167C8.65887 15.8167 8.6562 15.9997 8.85416 15.9997C10.2261 15.9997 14.3418 15.9997 14.3418 15.9997C14.7704 15.9997 15.1211 15.6628 15.1211 15.2511V9.63281C15.1212 9.2211 14.7705 8.88428 14.342 8.88428Z" fill="#FFC6D3"/><path d="M7.34215 4.46362C7.34215 4.46362 7.34215 4.20996 7.08123 4.20996C5.51885 4.20996 0.779234 4.20996 0.779234 4.20996C0.350673 4.20996 0 4.54684 0 4.95849V7.29517C0 7.70687 0.350673 8.0437 0.779234 8.0437C0.779234 8.0437 5.54008 8.0437 7.10258 8.0437C7.34215 8.0437 7.34215 7.84409 7.34215 7.84409V4.46362Z" fill="#FFC6D3"/><path d="M15.2211 4.20996C15.2211 4.20996 10.4795 4.20996 8.89897 4.20996C8.6582 4.20996 8.6582 4.43035 8.6582 4.43035V7.84873C8.6582 7.84873 8.6582 8.0437 8.95091 8.0437C10.5184 8.0437 15.2211 8.0437 15.2211 8.0437C15.6496 8.0437 16.0003 7.70687 16.0003 7.29517V4.95849C16.0003 4.54684 15.6496 4.20996 15.2211 4.20996Z" fill="#FFC6D3"/><path d="M4.69176 3.65622C4.33524 3.65622 4.0096 3.62906 3.72404 3.57545C2.99874 3.43932 2.50024 3.17438 2.20003 2.76556C1.93105 2.39918 1.84874 1.94749 1.95529 1.423C2.14196 0.505348 2.78346 0 3.76151 0C3.9685 0 4.19581 0.0229604 4.4372 0.0682814C5.05123 0.18352 5.83659 0.521764 6.53811 0.973065C7.72831 1.73883 7.78718 2.21489 7.72791 2.5064C7.64077 2.93474 7.22401 3.2408 6.4538 3.44216C5.93344 3.57818 5.2912 3.65622 4.69176 3.65622ZM3.76157 1.19978C3.38279 1.19978 3.25262 1.30144 3.18114 1.65304C3.12267 1.94051 3.19641 2.04092 3.2206 2.07391C3.32188 2.21189 3.58569 2.32697 3.9635 2.39781C4.16736 2.4361 4.41926 2.45633 4.6917 2.45633C5.2908 2.45633 5.8186 2.36913 6.16881 2.27374C6.1943 2.26681 6.23387 2.23785 6.19147 2.21358C5.73361 1.85527 4.89596 1.37681 4.19774 1.24575C4.03509 1.21532 3.88828 1.19978 3.76157 1.19978Z" fill="#FFC6D3"/><path d="M11.3269 3.65616C11.3269 3.65616 11.3269 3.65616 11.3268 3.65616C10.7273 3.65616 10.0851 3.57812 9.56476 3.4421C8.7945 3.2408 8.3778 2.93468 8.29066 2.5064C8.23144 2.21489 8.2902 1.73883 9.48051 0.973065C10.1819 0.521764 10.9673 0.18352 11.5814 0.0682814C11.8228 0.0229604 12.0501 0 12.2569 0C13.2352 0 13.8767 0.505402 14.0632 1.42306C14.1698 1.94749 14.0876 2.39918 13.8185 2.76556C13.5183 3.17443 13.0199 3.43932 12.2944 3.57545C12.009 3.62895 11.6833 3.65616 11.3269 3.65616ZM9.83709 2.20611C9.7965 2.22874 9.81614 2.26447 9.8372 2.2703C10.1873 2.367 10.7206 2.45633 11.3268 2.45633C11.5993 2.45633 11.8511 2.4361 12.055 2.39781C12.4328 2.32691 12.6967 2.21189 12.7979 2.07391C12.8222 2.04092 12.896 1.94051 12.8374 1.65304C12.7659 1.30144 12.6357 1.19978 12.2569 1.19978C12.1302 1.19978 11.9835 1.21527 11.8208 1.24581C11.1225 1.37681 10.2949 1.84774 9.83709 2.20611Z" fill="#FFC6D3"/></svg></span> để xem quà tặng</a>'
        );
        $('#milestone-msg-2').show();
        $('#milestone-msg-3').hide();
      },
      selected: function(eligible, gift) {
        var that = WEBDS.Cart.milestoneGift;
        $('#giftnoti3').html(
          'Bạn đã chọn quà tặng mốc <strong>' + that.util.escapeHtml(eligible.label) +
          '</strong>: <em>' + that.util.escapeHtml(gift.title) + '</em>'
        );
        $('#milestone-msg-3').show();
        $('#milestone-msg-2').hide();
      },
      render: function(totalVnd, eligible, existingGift) {
        var that = WEBDS.Cart.milestoneGift;
        that.messages.needMore(totalVnd);
        if (!eligible) {
          $('#milestone-msg-2, #milestone-msg-3').hide();
          return;
        }
        if (existingGift) that.messages.selected(eligible, existingGift);
        else that.messages.qualified(eligible);
      }
    },
    track: {
      build: function() {
        var that = WEBDS.Cart.milestoneGift;
        var $wrap = $(that.SEL.stepsWrap);
        $wrap.find('.milestone-step[data-milestone-id]').remove();
        var n = that.milestone.list().length;
        that.milestone.list().forEach(function(m, index) {
          var isLast = index === n - 1;
          var $step = $(
            '<div class="milestone-step' + (isLast ? ' milestone-step-last' : '') + '" data-milestone-id="' + m.id + '" data-price="' + m.price + '">' +
              '<div class="milestone-step--pin">' +
                '<button type="button" class="milestone-icon milestone-icon-trigger js-open-gift-popup" data-milestone-id="' + m.id + '" aria-label="Xem quà mốc ' + that.util.escapeHtml(m.label) + '">' +
                  '<span>' + that.util.iconHtml() + '</span>' +
                '</button>' +
              '</div>' +
              '<div class="milestone-label">' + that.util.escapeHtml(m.label) + '</div>' +
              '<div class="milestone-text">' + that.util.escapeHtml(m.text) + '</div>' +
            '</div>'
          );
          $wrap.append($step);
        });
        that.track.updatePositions();
        $(that.SEL.widget)
          .removeClass('milestone-container--count-1 milestone-container--count-2 milestone-container--count-3 milestone-container--count-4')
          .addClass('milestone-container--count-' + n)
          .attr('data-milestone-count', n);
      },
      updatePositions: function() {
        var that = WEBDS.Cart.milestoneGift;
        var n = that.milestone.list().length;
        if (!n) return;
        $('.milestone-step-first').css({ left: '0%', transform: 'translateX(0)' });
        var $markers = $(that.SEL.markers).empty();
        that.milestone.list().forEach(function(m, index) {
          var pct = that.milestone.positionPercent(index);
          var isLast = index === n - 1;
          $('.milestone-step[data-milestone-id="' + m.id + '"]')
            .toggleClass('milestone-step-last', isLast)
            .css({
              left: pct + '%',
              transform: isLast ? 'translateX(-100%)' : 'translateX(-50%)'
            });
          $markers.append('<span class="milestone-bar-marker" data-milestone-id="' + m.id + '" style="left:' + pct + '%;"></span>');
        });
      },
      updateSteps: function(totalVnd, eligible) {
        var that = WEBDS.Cart.milestoneGift;
        that.milestone.list().forEach(function(m) {
          var $step = $('.milestone-step[data-milestone-id="' + m.id + '"]');
          var $marker = $('.milestone-bar-marker[data-milestone-id="' + m.id + '"]');
          $step.removeClass('is-active is-qualified is-passed is-locked is-next is-visible');
          $marker.removeClass('is-reached is-next is-active');

          if (!eligible) {
            var next = that.milestone.next(totalVnd);
            if (next && m.id === next.id) {
              $step.addClass('is-next is-visible');
              $marker.addClass('is-next');
            } else {
              $step.addClass('is-locked is-visible');
            }
            return;
          }

          var status = that.milestone.status(m, eligible);
          if (status === 'passed') {
            $step.addClass('is-passed is-visible');
            $marker.addClass('is-reached');
          } else if (status === 'active') {
            $step.addClass('is-active is-qualified is-visible');
            $marker.addClass('is-reached is-active');
          } else {
            $step.addClass('is-locked is-visible');
          }
        });
      }
    }
  }
}
WEBDS.Search = {
	totalPageItem: 0,
	init: function(){
		var that = this;
		that.searchApi();
	},
	searchApi: function(){
		var limit = 20;
		var keySearch = '';
		
		function loadItems(page,keySearch){
			if( keySearch != '' ) {
				var url = '/search.js?q=filter=((title:product ** '+keySearch+')||(tag:product ** '+keySearch+')||(sku:product ** '+keySearch+')||(barcode:product ** '+keySearch+'))&page=' + page + '&limit=' + limit  ;
        $.ajax({
					type: 'GET',
					url: url,
					success: function(data){
						if (data.total > 0) {
							WEBDS.Search.totalPageItem = Math.ceil(data.total / limit);
							if(page < WEBDS.Search.totalPageItem){
								$('#js-btn-more').attr('data-current',page+1);
								$('#js-btn-more').attr('data-pages',WEBDS.Search.totalPageItem);
								$('#js-btn-more').parents('.results-more').removeClass('d-none').addClass('d-flex');
							}
							else{
								$('#js-btn-more').parents('.results-more').addClass('d-none').removeClass('d-flex');
							}

							$('.search-result-count').html(data.total + isText.text16 + '<span class="search-keywords">' +keySearch+ '</span>');
							if(data.hasOwnProperty('products')){
								var items = '';
								data.products.map((item,ind) => {
									var number_loop = limit*(page - 1) + (ind + 1);
									items += `<div class="product-tile product-loop ${number_loop}">` + WEBDS.Global.renderLoop(item,number_loop) + `</div>`;
								});
								$('.js-results-render').append(items);
								$('.search-results').removeClass('d-none');
								$('.message-txt').addClass('d-none');
							}
							else {
								var empty = "<div class='empty'>"+ isText.text5 +"</div>";
								$('.js-results-render').html(empty);
								$('#js-btn-more').attr('data-current','').parents('.results-more').addClass('d-none').removeClass('d-flex');
							}
						}
						else {
							$('.search-results').addClass('d-none');
							$('.expanded-message').removeClass('d-none');
							$('.message-txt').removeClass('d-none');
							
						}
						$('#mainLoading').removeClass('active');
					},
					error: function(){}
				});
			}
			else {
				alert(isText.text17);
			}
		}
		
		$(document).on('click','#search-page form #go',function(e){
			e.preventDefault();
			$('#mainLoading').addClass('active');
			var q = $(this).parents('form').find('input[name=q]').val();
			keySearch = q;
			if ($('.js-results-render').length > 0){
				$('.js-results-render').html('');
			}
			loadItems(1,q);
		});
		$(document).on('click','#js-btn-more',function(e){
			e.preventDefault();
			var page = Number($(this).attr('data-current'));
			var q = $('#search-page form input[name=q]').val();
			loadItems(page,q);
		});		
		$(document).ready(function() {
			if (!$.isEmptyObject(paramUrl)) { // check paramUrl khác rỗng
				$('#mainLoading').addClass('active');
				if (paramUrl.hasOwnProperty('q')) {
					if(paramUrl.q != undefined){
						keySearch = decodeURI(paramUrl.q);
						$('.js-results-render').html('');
						loadItems(1,keySearch);
					}
				}
				else {
					$('.search-results').addClass('d-none');
					$('.expanded-message').removeClass('d-none');
					$('#mainLoading').removeClass('active');
				}
			}
			else {
				$('.search-results').addClass('d-none');
				$('.expanded-message').removeClass('d-none');
				$('#mainLoading').removeClass('active');
			}
		});		
	},
}
WEBDS.Customers = {
	init: function(){
		var that = this; 
		if(template.indexOf('login') !== -1 || template.indexOf('register') !== -1){
			WEBDS.Helper.passwordVisibility();
		}
	}
}
WEBDS.Page = {
	init: function() {
		var that = this;
		that.toggleFaqs();
		that.helpNav();
    that.initCounterAnimation();
	},
	toggleFaqs: function(){
		$(document).off('click.faqs', '.header-faq').on('click.faqs', '.header-faq', function(){
			var $header = $(this);
			if(!$header.hasClass('opened')){ 
				$('.header-faq').removeClass('opened').parent().find('.content-faq').stop().slideUp(220);
				$header.addClass('opened').parent().find('.content-faq').stop().slideDown(220);
			}else{
				$header.removeClass('opened').parent().find('.content-faq').stop().slideUp(220);
			}
		});
	},
	helpNav: function(){
		var $shell = $('.js-help-shell');
		if (!$shell.length) return;
		var mode = $shell.attr('data-help-mode') || 'ajax';
		var $menu = $shell.find('.menuList-support');
		var $content = $shell.find('.content-pageDetail');
		if (!$menu.length || !$content.length) return;
		var cache = {};
		var normalize = function(url){
			if (!url) return '';
			try {
				var a = document.createElement('a');
				a.href = url;
				return (a.pathname || '/').replace(/\/$/, '') || '/';
			} catch (e) {
				return String(url).split('?')[0].replace(/\/$/, '');
			}
		};
		var handleOf = function(url){
			var path = normalize(url);
			var parts = path.split('/').filter(Boolean);
			return parts.length ? parts[parts.length - 1] : '';
		};
		var setActive = function(handle, url){
			$menu.find('a').removeClass('active').each(function(){
				var $a = $(this);
				var h = $a.attr('data-help-handle') || handleOf($a.attr('href'));
				if ((handle && h === handle) || (url && normalize($a.attr('href')) === normalize(url))) {
					$a.addClass('active');
				}
			});
		};
		var openFaq = function(handle, title){
			var $item = $();
			if (handle) $item = $content.find('.item-faq[data-help-handle="' + handle + '"]');
			if (!$item.length && title) {
				$content.find('.item-faq').each(function(){
					var t = $(this).find('.header-faq').text().replace(/\s+/g, ' ').trim().toLowerCase();
					if (t === String(title).replace(/\s+/g, ' ').trim().toLowerCase()) $item = $(this);
				});
			}
			if (!$item.length) return false;
			var $header = $item.find('.header-faq');
			$('.header-faq').not($header).removeClass('opened').parent().find('.content-faq').stop(true, true).slideUp(180);
			if (!$header.hasClass('opened')) {
				$header.addClass('opened');
				$item.find('.content-faq').stop(true, true).slideDown(220);
			}
			setActive(handle);
			var top = $item.offset().top - (($('body').hasClass('scroll-body-up') ? ($('.main-header--inner').outerHeight() || 0) : 0) + 24);
			$('html, body').stop(true).animate({scrollTop: Math.max(0, top)}, 280);
			return true;
		};
		var showPanel = function(handle, url, push){
			var $panels = $content.find('.help-panel');
			if (!$panels.length) return false;
			var $target = handle ? $panels.filter('[data-help-handle="' + handle + '"]') : $();
			if (!$target.length && url) $target = $panels.filter('[data-help-url="' + url + '"]');
			if (!$target.length) return false;
			$panels.removeClass('is-active').attr('hidden', true);
			$target.addClass('is-active').removeAttr('hidden');
			setActive(handle, url);
			if (push && url) history.pushState({helpNav: true}, '', url);
			$('html, body').stop(true).animate({scrollTop: Math.max(0, $shell.offset().top - 20)}, 200);
			return true;
		};
		var showAjax = function(html, url, push){
			$content.html(html);
			setActive(handleOf(url), url);
			if (push) history.pushState({helpNav: true}, '', url);
		};
		var loadAjax = function(url, push){
			var key = normalize(url);
			if (cache[key]) {
				showAjax(cache[key], url, push);
				return;
			}
			$content.addClass('is-loading');
			$.get(url).done(function(html){
				var $tmp = $('<div>').append($.parseHTML(html, document, false));
				var inner = $tmp.find('.content-pageDetail').first().html();
				$content.removeClass('is-loading');
				if (!inner) { window.location.href = url; return; }
				cache[key] = inner;
				showAjax(inner, url, push);
			}).fail(function(){
				$content.removeClass('is-loading');
				window.location.href = url;
			});
		};

		// Prefetch sibling help pages in background (ajax mode / fallback)
		if (mode !== 'panels') {
			cache[normalize(location.href)] = $content.html();
			$menu.find('a[href]').each(function(){
				var href = this.getAttribute('href');
				var key = normalize(href);
				if (!key || cache[key]) return;
				$.get(href).done(function(html){
					var $tmp = $('<div>').append($.parseHTML(html, document, false));
					var inner = $tmp.find('.content-pageDetail').first().html();
					if (inner) cache[key] = inner;
				});
			});
		}

		$menu.on('click', 'a[href]', function(e){
			var href = this.getAttribute('href');
			if (!href || href.charAt(0) === '#') return;
			if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) return;
			var handle = this.getAttribute('data-help-handle') || handleOf(href);
			var title = $(this).attr('title') || $(this).find('.text').text();
			e.preventDefault();
			if (mode === 'faqs') {
				if (openFaq(handle, title)) return;
			}
			if (mode === 'panels' || $content.find('.help-panel').length) {
				if (showPanel(handle, href, true)) return;
			}
			if (normalize(href) === normalize(location.href)) return;
			loadAjax(href, true);
		});

		$(window).off('popstate.helpNav').on('popstate.helpNav', function(){
			var url = location.pathname + location.search;
			var handle = handleOf(url);
			if (mode === 'faqs') {
				openFaq(handle);
				return;
			}
			if (showPanel(handle, url, false)) return;
			if (cache[normalize(url)]) showAjax(cache[normalize(url)], url, false);
			else loadAjax(url, false);
		});
	},  
  initCounterAnimation: function() {
    let countersAnimated = false;
    let animationId = null;
    const $window = $(window);
    const $aboutusCounter = $('.section-counter');
    const $counters = $('.counter:not(.last)');
    if (!$aboutusCounter.length || !$counters.length) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && !countersAnimated) {
              countersAnimated = true;
              startCounterAnimation();
              observer.disconnect(); 
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px 0px -50px 0px'
        }
      );
      observer.observe($aboutusCounter[0]);
    } 
    else {
      $window.on('scroll.counterAnimation', throttle(checkCountersOnScroll, 100));
      $(document).ready(checkCountersOnScroll);
    }
    function parseCounterValue(value) {
      if (!value) return { number: 0, prefix: '', suffix: '', decimalPlaces: 0 };
      const stringValue = String(value).trim();
      
      const onlyNumberMatch = stringValue.match(/^\d+$/);
      if (onlyNumberMatch) {
        return {
          number: parseInt(stringValue) || 0,
          prefix: '',
          suffix: '',
          decimalPlaces: 0
        };
      }
      const onlyDecimalMatch = stringValue.match(/^\d*\.\d+$/);
      if (onlyDecimalMatch) {
        const decimalPlaces = stringValue.split('.')[1].length;
        return {
          number: parseFloat(stringValue) || 0,
          prefix: '',
          suffix: '',
          decimalPlaces: decimalPlaces
        };
      }
      const numberWithCommaMatch = stringValue.match(/^[\d,]+(\.\d+)?$/);
      if (numberWithCommaMatch) {
        const cleanNumber = stringValue.replace(/,/g, '');
        const decimalPlaces = cleanNumber.includes('.') ? cleanNumber.split('.')[1].length : 0;
        return {
          number: parseFloat(cleanNumber) || 0,
          prefix: '',
          suffix: '',
          decimalPlaces: decimalPlaces
        };
      }
      
      let match;
      let prefix = '';
      let suffix = '';
      let numberPart = '';
      let decimalPlaces = 0;
      
      match = stringValue.match(/^([^\d]+)([\d,]*\.?\d*)$/);
      if (match) {
        prefix = match[1];
        numberPart = match[2];
        suffix = '';
      } else {
        match = stringValue.match(/^([\d,]*\.?\d*)([^\d]+)$/);
        if (match) {
          prefix = '';
          numberPart = match[1];
          suffix = match[2];
        } else {
          match = stringValue.match(/^([^\d]*)([\d,]*\.?\d*)([^\d]*)$/);
          if (match) {
            prefix = match[1] || '';
            numberPart = match[2];
            suffix = match[3] || '';
          }
        }
      }
      
      if (numberPart) {
        const cleanNumber = numberPart.replace(/,/g, '');
        if (cleanNumber.includes('.')) {
          decimalPlaces = cleanNumber.split('.')[1].length;
        }
        return {
          number: parseFloat(cleanNumber) || 0,
          prefix: prefix,
          suffix: suffix,
          decimalPlaces: decimalPlaces
        };
      }
      
      return {
        number: 0,
        prefix: '',
        suffix: '',
        decimalPlaces: 0
      };
    }
    function animateCounter($element, counterData, duration) {
      const startTime = performance.now();
      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress);
        const current = counterData.targetNumber * easeProgress;
        
        // Format số với số chữ số thập phân phù hợp
        let formattedNumber;
        if (counterData.decimalPlaces > 0) {
          formattedNumber = current.toLocaleString('en-US', {
            minimumFractionDigits: counterData.decimalPlaces,
            maximumFractionDigits: counterData.decimalPlaces
          });
        } else {
          formattedNumber = Math.floor(current).toLocaleString('en-US');
        }
        
        const displayText = counterData.prefix + formattedNumber + counterData.suffix;
        $element.text(displayText);
        
        if (progress < 1) {
          animationId = requestAnimationFrame(updateCounter);
        } else {
          // Hiển thị giá trị cuối cùng chính xác
          let finalFormatted;
          if (counterData.decimalPlaces > 0) {
            finalFormatted = counterData.targetNumber.toLocaleString('en-US', {
              minimumFractionDigits: counterData.decimalPlaces,
              maximumFractionDigits: counterData.decimalPlaces
            });
          } else {
            finalFormatted = counterData.targetNumber.toLocaleString('en-US');
          }
          const finalText = counterData.prefix + finalFormatted + counterData.suffix;
          $element.text(finalText);
        }
      }
      animationId = requestAnimationFrame(updateCounter);
    }
    function startCounterAnimation() {
      const counterDataArray = [];
      $counters.each(function() {
        const $this = $(this);
        const dataCounter = $this.data('counter');
        const textValue = $this.text();
        const parsedData = parseCounterValue(dataCounter || textValue);
        
        counterDataArray.push({ 
          element: $this, 
          targetNumber: parsedData.number,
          prefix: parsedData.prefix,
          suffix: parsedData.suffix,
          decimalPlaces: parsedData.decimalPlaces
        });
      });
      
      requestAnimationFrame(function() {
        counterDataArray.forEach(function(data) {
          let initialText;
          if (data.decimalPlaces > 0) {
            const initialFormatted = (0).toLocaleString(undefined, {
              minimumFractionDigits: data.decimalPlaces,
              maximumFractionDigits: data.decimalPlaces
            });
            initialText = data.prefix + initialFormatted + data.suffix;
          } else {
            initialText = data.prefix + '0' + data.suffix;
          }
          data.element.text(initialText);
        });
        counterDataArray.forEach(function(data) {
          animateCounter(data.element, data, 2000);
        });
      });
    }
    function throttle(func, delay) {
      let timeoutId;
      let lastExecTime = 0;
      return function() {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
          func.apply(this, arguments);
          lastExecTime = currentTime;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(function() {
            func.apply(this, arguments);
            lastExecTime = Date.now();
          }.bind(this), delay);
        }
      };
    }
    function checkCountersOnScroll() {
      if (countersAnimated) return;
      const rect = $aboutusCounter[0].getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top <= windowHeight * 0.7 && rect.bottom >= 0) {
        countersAnimated = true;
        startCounterAnimation();
        $window.off('scroll.counterAnimation');
      }
    }
    return function cleanup() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      $window.off('scroll.counterAnimation');
    };
  },
}
WEBDS.Contact = {
	init: function() {
		var that = this;
		that.storeFunction();		
	},
  storeFunction: function() {
    const urlMap = "https://cdn.hstatic.net/files/200001029438/file/data-stores.json";
    var showStore = false;
    var text1 = 'Địa chỉ cửa hàng đang cập nhật';
    var text2 = 'Thời gian hoạt động:';
    var text3 = 'Xem bản đồ';
    var text4 = 'Điện thoại';
    
  	let shop = [];
  	let currentMap = "";
  	function onViewMap(index) {
  		currentMap = shop[index].map;
  		$('#boxMap').html(currentMap);
  	}
  	function getShops(){
  		const params = {
  			type: 'GET',
  			url: urlMap,
  			async: false,
  			dataType: "text",
  			success: function(data) { 
  				let datajs =JSON.parse(data)
  				let dataft = Array.from(new Set([...datajs.cuahang.filter(
  					item => item.province != undefined 
  					&& !item.province.match(/^[\s]*$/) 
  					&& item.shop_name != undefined 
  					&& !item.shop_name.match(/^[\s]*$/) 
  					&& item.address != undefined 
  					&& !item.address.match(/^[\s]*$/)
  				)]))
  				
  				let city = Array.from(new Set([...dataft.map(item => item.province && item.province.trim())]));
  				let cityHTML = city.map(city => {
  					return '<option value="' + city + '">' + city + '</option>';
  				})
  				$('#filter-province').html(cityHTML);
  
  				$('#filter-province').change(function(event){
  					shop = Array.from(new Set([...dataft.filter(item => item.province === event.target.value).map(item => item.ward && item.ward.trim())]))
  					let html = shop.map(shop => {
  						shop = $('<option value="' + shop + '">' + shop + '</option>').text();
  						return '<option value="' + shop + '">' + shop + '</option>';
  					})
  					if(html === "<option value=''></option>"){
  						html= '<option value="">'+text1+'</option>';
  					}
  					$('#filter-store').html(html)
  					$('#filter-store').val($('#filter-store option').val()).change()
  				})
  				$('#filter-province').change();
  				
  				$('#filter-store').change(function(event){
  					let shopNameHTML = '';
  					shop = dataft.filter(item => item.ward === event.target.value)
  					currentMap = shop.length > 0 && shop[0].map
  					if(shop.length != 1) {
  						shop.map((shop, index) => {
  							shopNameHTML+='<div class="store-item">';
  							shopNameHTML+=	'<h3 class="store--name">' + shop.shop_name + '</h3>';
                shopNameHTML+=	'<div class="store--detail">';
  							shopNameHTML+=	'<div class="store--address">' + shop.address + '</div>';
  							if(shop.time != undefined && !shop.time.match(/^[\s]*$/)){
  								shopNameHTML+=	'<div class="store--time">'+text2+' <span>' + shop.time + '</span></div>';
  							}
                if(shop.phone != undefined && !shop.phone.match(/^[\s]*$/)){
  								shopNameHTML+=	'<div class="store--hotline">'+text4+'<a href="tel:'+shop.phone+'">';
                  shopNameHTML+=	'<span>' + shop.phone + '</span></a></div>';
  							}
                shopNameHTML+=	'</div>';
  							shopNameHTML+=	'<div class="store--map"><a href="javascript:void(0)" data-index="'+ index + '" class="store--link" id="map">';
                shopNameHTML+=	'<span>'+text3+'</span></a></div>';
  							shopNameHTML+=	'</div>';
  						});
  					} else {
  						shop.map((shop, index) => {
  							shopNameHTML+='<div class="store-item">';
  							shopNameHTML+=	'<h3 class="store--name">' + shop.shop_name + '</h3>';
                shopNameHTML+=	'<div class="store--detail">';
  							shopNameHTML+=	'<div class="store--address">' + shop.address + '</div>';
  							if(shop.time != undefined && !shop.time.match(/^[\s]*$/)){
  								shopNameHTML+=	'<div class="store--time">'+text2+' <span>' + shop.time + '</span></div>';
  							}
                if(shop.phone != undefined && !shop.phone.match(/^[\s]*$/)){
  								shopNameHTML+=	'<div class="store--hotline">'+text4+'<a href="tel:'+shop.phone+'">';
                  shopNameHTML+=	'<span>' + shop.phone + '</span></a></div>';
  							}
                shopNameHTML+=	'</div>';
  							shopNameHTML+=	'</div>';
  						});
  					}
  					$('#boxMap').html(currentMap);
  					$('#store-info').html(shopNameHTML);
            
            $(document).on("click",'.store--map a', function(e){
              e.preventDefault();
              var position = Number($(this).attr('data-index'));
      				onViewMap(position);
      			});
            
  				})
  				$('#filter-store').change();
          
  			},
  			error: function(){}
  		};
  		jQuery.ajax(params);
  	}

    if (showStore) getShops();
    
  }
}
WEBDS.Blogs = {
	init: function(){
		var that = this; 
		
	}
}
WEBDS.Article = {
  init: function(){
    this.toggleSidebar();
    this.tbOfContentsArt();
    this.relatedBlogs();
    this.collectionSlide();
	},
  toggleSidebar: function(){
    $(document).on('click', '.sidebox-title .htitle', function(e){ 
			$(this).parents('.group-sidebox').toggleClass('is-open').find('.sidebox-content-togged').slideToggle('medium');
		});
  },
  tbOfContentsArt: function(){
		if($('.article-table-contents').length > 0){
			function urlfriendly (slug) {
				//Đổi chữ hoa thành chữ thường
				//Đổi ký tự có dấu thành không dấu
				slug = slug.toLowerCase();
				slug = slug.trim().replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
				slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
				slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
				slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
				slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
				slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
				slug = slug.replace(/đ/gi, 'd');
				//Xóa các ký tự đặt biệt
				slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '_');
				//Đổi khoảng trắng thành ký tự gạch ngang
				slug = slug.replace(/ /gi, "_");
				//Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
				//Phòng trường hợp người nhập vào quá nhiều ký tự trắng
				slug = slug.replace(/\-\-\-\-\-/gi, '_');
				slug = slug.replace(/\-\-\-\-/gi, '_');
				slug = slug.replace(/\-\-\-/gi, '_');
				slug = slug.replace(/\-\-/gi, '_');
				//Xóa các ký tự gạch ngang ở đầu và cuối
				slug = '@' + slug + '@';
				slug = slug.replace(/\@\-|\-\@|\@/gi, '');
				//In slug ra textbox có id “slug”
				return slug;
			};
			class TableOfContents {
				constructor({ from, to }) {
					this.fromElement = from;
					this.toElement = to;
					// Get all the ordered headings.
					this.headingElements = this.fromElement.querySelectorAll("h1, h2, h3,h4,h5,h6");
					this.tocElement = document.createElement("div")
				}
				/*  Get the most important heading level.
        For example if the article has only <h2>, <h3> and <h4> tags
        this method will return 2.
     */
				getMostImportantHeadingLevel() {
					let mostImportantHeadingLevel = 6; // <h6> heading level
					for (let i = 0; i < this.headingElements.length; i++) {
						let headingLevel = TableOfContents.getHeadingLevel(this.headingElements[i]);
						mostImportantHeadingLevel = (headingLevel < mostImportantHeadingLevel) ?
							headingLevel : mostImportantHeadingLevel;
					}
					return mostImportantHeadingLevel;
				}
				static generateId(headingElement) {
					return urlfriendly(headingElement.textContent)
				}
				static getHeadingLevel(headingElement) {
					switch (headingElement.tagName.toLowerCase()) {							
						case "h2": return 2;
						case "h3": return 3;
							break;
						default: return 4;
					}
				}
				generateTable() {
					let currentLevel = this.getMostImportantHeadingLevel() - 1,
							currentElement = this.tocElement;
					for (let i = 0; i < this.headingElements.length; i++) {
						let headingElement = this.headingElements[i],
								headingLevel = TableOfContents.getHeadingLevel(headingElement),
								headingLevelDifference = headingLevel - currentLevel,
								linkElement = document.createElement("a");
						if (!headingElement.id) {
							headingElement.id = TableOfContents.generateId(headingElement);
						}
						linkElement.href = `#${headingElement.id}`;
						linkElement.textContent = headingElement.textContent;

						if (headingLevelDifference > 0) {
							// Go down the DOM by adding list elements.
							for (let j = 0; j < headingLevelDifference; j++) {
								let listElement = document.createElement("ul"),													
										listItemElement = document.createElement("li");
								listElement.appendChild(listItemElement);
								currentElement.appendChild(listElement);
								currentElement = listItemElement;
							}
							currentElement.appendChild(linkElement);
						} 
						else {
							// Go up the DOM.
							for (let j = 0; j < -headingLevelDifference; j++) {
								currentElement = currentElement.parentNode.parentNode;
							}
							let listItemElement = document.createElement("li");
							listItemElement.appendChild(linkElement);
							currentElement.parentNode.appendChild(listItemElement);
							currentElement = listItemElement;
						}
						currentLevel = headingLevel;
					}
					if(this.tocElement.firstChild != null){
						this.toElement.appendChild(this.tocElement.firstChild);
					}else{
						document.getElementById("table-content-container").remove();
					}
				}
			}
			(function($) {
				if($(window).width() > 991){
					var stringtemplate = $('<div id="table-content-container" class="table-of-contents"><div class="table-title"><div class="htitle"><span>'+isText.text22+'</span><div class="toc-toggle"><a class="icon-list" href="javascript:void(0)" data-check="hide">[Ẩn]</a></div></div></div></div>');
				}
				else {
					var stringtemplate = $('<div id="table-content-container" class="table-of-contents"><div class="table-title"><div class="htitle"><span>'+isText.text22+'</span><div class="toc-toggle"><a class="icon-list" href="javascript:void(0)" data-check="show">[Hiện]</a></div></div></div></div>');
				}
				stringtemplate.insertBefore(".article-table-contents");

				new TableOfContents({
					from: document.querySelector(".article-table-contents"),
					to: document.querySelector("#table-content-container")
				}).generateTable();
				$("#table-content-container .icon-list").click(function(){
					$(this).parents("#table-content-container").find("ul:first").slideToggle({ direction: "left" }, 100);
					var texxx = $(this).attr('data-check');
					if(texxx == "hide"){
						$(this).attr('data-check','show');
						$(this).html('[Hiện]');
					}else{
						$(this).attr('data-check','hide');
						$(this).html('[Ẩn]');
					}
				})

				var buttontable = '<div class="table-content-button"><button class="btn-icolist"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.994 511.994"><path d="M35.537 292.17l-.225-.863 14.613-15.857c9.495-10.333 16.006-18.227 19.544-23.47s5.3-11.326 5.3-18.148c0-10.135-3.326-18.146-9.974-23.984-6.65-5.83-15.9-8.76-27.775-8.76-11.174 0-20.15 3.467-26.923 10.412S.06 226.807.3 236.795l.15.34 24.473.002c0-4.403 1.076-8.9 3.227-12.097s5.105-4.73 8.863-4.73c4.202 0 7.355 1.26 9.457 3.73s3.152 5.8 3.152 9.955c0 2.917-1.04 6.36-3.115 10.313s-5.72 8.458-10.122 13.5L1.28 294.304v15.478h74.847v-17.6h-40.6zM51.9 127.068V37.72L1.28 45.283v17.945h24.215v63.84H1.28v19.812h74.846v-19.812zm21.156 299.964c-3.265-4.33-7.8-7.542-13.574-9.668 5.092-2.325 9.16-5.55 12.2-9.677s4.56-8.643 4.56-13.534c0-9.84-3.5-17.442-10.53-22.806s-16.4-8.046-28.1-8.046c-10.087 0-18.665 2.67-25.736 8S1.418 384.007 1.716 392.6l.15.83h24.327c0-4.403 1.233-5.774 3.707-7.654s5.34-3 8.603-3c4.154 0 7.317 1.065 9.495 3.4s3.262 5.142 3.262 8.555c0 4.3-1.2 7.868-3.632 10.3s-5.884 3.837-10.384 3.837h-11.75v17.6h11.75c4.995 0 8.863 1.475 11.608 3.872s4.117 6.358 4.117 11.597c0 3.76-1.312 6.943-3.93 9.415s-6.133 3.74-10.534 3.74c-3.857 0-7.13-1.662-9.827-4s-4.042-4.803-4.042-9.206H.16l-.147.95c-.247 10.087 3.423 18.042 11.013 23.357s16.453 8.1 26.588 8.1c11.77 0 21.435-2.765 29-8.427S77.96 452.44 77.96 442.55c0-6.033-1.63-11.195-4.894-15.523zm75.7-64.426h363.227v72.645H148.767zm0-143.09h363.227v72.645H148.767zm0-147.483h363.227v72.645H148.767z"></path></svg></button> </div><div class="table-content-fixed"><div class="table-of-header"><div class="hTitle"><span>'+isText.text22+'</span></div><span class="hClose"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.001 512.001"><path d="M284.286 256.002L506.143 34.144c7.81-7.81 7.81-20.475 0-28.285s-20.475-7.81-28.285 0L256 227.717 34.143 5.86c-7.81-7.81-20.475-7.81-28.285 0s-7.81 20.475 0 28.285L227.715 256 5.858 477.86c-7.81 7.81-7.81 20.475 0 28.285C9.763 510.05 14.882 512 20 512a19.94 19.94 0 0 0 14.143-5.857L256 284.287l221.857 221.857C481.762 510.05 486.88 512 492 512a19.94 19.94 0 0 0 14.143-5.857c7.81-7.81 7.81-20.475 0-28.285L284.286 256.002z"></path></svg></span></div><div id="clone-table" class="table-of-contents"></div></div>';
				$("#article").append(buttontable).ready(function(){
					var tablehtml = $("#table-content-container").html()
					$("#clone-table").html(tablehtml);
				});
			})(jQuery);						

			$('body').on('click', '#table-content-container ul li a, #clone-table  ul li a', function(e){
				e.preventDefault();
				var id = $(this).attr('href');
				$("html,body").animate({ scrollTop: $(id).offset().top - 70 }, 600)	;
				$('.table-content-fixed').removeClass('active');
			})
			$('.table-content-button .btn-icolist').on('click', function(e){
				$('.table-content-fixed').toggleClass('active');
			})
			$('.table-content-fixed .table-of-header .hClose').on('click', function(e){
				$('.table-content-fixed').toggleClass('active');
			})
			if($('#table-content-container').length > 0){
				var ofsettop_ = $(".article-table-contents").offset().top - 300 ;
				$(window).scroll(function(){
					if($(window).scrollTop() > ofsettop_){
						$(".table-content-button").addClass('active');
					}else{
						$(".table-content-button").removeClass('active');
						$('.table-content-fixed').removeClass('active');
					}
				});		
			}
		}
	},
  relatedBlogs: function(){
    if($(window).width() > 768 ){
      var swiper = new Swiper("#slider-blog-aricle .swiper", {
        loop: false,
        slidesPerView: 1,
        spaceBetween: 3,
        breakpoints: {
          768: {
            slidesPerView: 1,
            spaceBetween: 3,
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 3,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 3,
          }
        },
        navigation: {
          nextEl: '#slider-blog-aricle .swiper-next',
          prevEl: '#slider-blog-aricle .swiper-prev',
        }
      });
    }
  },
  collectionSlide: function(){
    if($('.section-collection').length > 0){				
      $('.section-collection').each(function(index){
        var currentTarget = '#'+$(this).attr('id');
        var currentId = $(this).find('.swiper').attr('data-id');
    		var currentTitle = $(this).find('.swiper').attr('data-title');
    		var currentHandle  = $(this).find('.swiper').attr('data-handle');
        var currentLimit =  Number($(this).find('.swiper').attr('data-limit'));
        var currentPerview =  Number($(this).find('.swiper').attr('data-perview'));
        var currentSize = Number($(this).find('.swiper').attr('data-size'));
        var currentType = $(this).find('.swiper').attr('data-type');    
        var checkBtnSwiper = Number($(this).find('.swiper').attr('data-btn-swiper'));
        WEBDS.Global.getItemSlide(currentId,currentTitle,currentHandle,currentType,1,currentLimit,currentPerview,currentSize,checkBtnSwiper,currentTarget);
      });
    }
  },
}
WEBDS.InitMain = function(){
	if(template.indexOf('index') > -1){
		WEBDS.Index.init();
	}
	if(template == 'product'){
		WEBDS.Product.init();
	}
	if(template.indexOf('collection') > -1){
		WEBDS.Collection.init();
	}
	if(template.indexOf('cart') > -1){
		WEBDS.Cart.init();
	}
	if(template.indexOf('search') > -1){
		WEBDS.Search.init();
	}
	if(template.indexOf('customers') > -1){
		WEBDS.Customers.init();
	}
	if(template.indexOf('blog') > -1 ) {
		WEBDS.Blogs.init();
	}
	if(template.indexOf('article') > -1){
		WEBDS.Article.init();
	}
  if(template.indexOf('page') > -1){
		WEBDS.Page.init();
	}
  if(template.indexOf('page.contact') > -1){
		WEBDS.Contact.init();
	}
}
$(document).ready(function(){
	WEBDS.InitMain();
})



