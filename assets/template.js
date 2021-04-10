const template = `
    <div>
    <div class="items">
        <%#items%>
        <div class="item" data-variant-id="<%id%>">
            <div class="row cart__row">
                <div class="col-md-4 col-sm-4 col-4">
                    <img alt="" src="<%featured_image.url%>">
                </div>
                <div class="col-md-8 col-sm-8 col-8">
                    <p>
                        <a href="<%url%>" class="cart__product-name">
                            <span><%title%></span>
                        </a>
                        <%#options_with_values%><span class="cart__product-meta"><%name%>: <%value%></span><%/options_with_values%>
                        <span class="cart__product-meta" >$<%price%></span>
                    </p>
                    <div class="row--full display-table">
                        <div class="row__item display-table-cell one-half">
                            <div class="cart__qty">
                                <button type="button" class="x-button cart__qty-adjust cart__qty--minus">
                                    <span aria-hidden="true" class="icon icon-minus"></span>
                                    <span aria-hidden="true" class="fallback-text">−</span>
                                </button>
                                <input type="text" pattern="[0-9]*" class="cart__qty-num" value="<%quantity%>">
                                <button type="button" class="x-button cart__qty-adjust cart__qty--plus">
                                    <span aria-hidden="true" class="icon icon-plus"></span>
                                    <span aria-hidden="true" class="fallback-text">+</span>
                                </button>
                            </div>
                        </div>
                        <div class="row__item display-table-cell one-half text-right"><span class="variant-price au">$<%line_price%></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <%/items%>
        </div>
        <div class="cart__footer">
            <div class="cart__footer--empty">
                <!---->
            </div>
            <div class="row cart__footer-extra">
                <div class="col-md-6 col-sm-6 col-xs-6">
                    <p class="x-p cart__pricing-title">Shipping</p>
                </div>
                <div class="col-md-6 col-sm-6 col-xs-6 text-right">
                    <p class="x-p cart__pricing-cost"><strong>FREE</strong></p>
                </div>
                <!---->
            </div>
            <div class="row cart__footer-total">
                <div class="col-md-6 col-sm-6 col-xs-6">
                    <p class="x-p cart__pricing-total-title">Subtotal</p>
                </div>
                <div class="col-md-6 col-sm-6 col-xs-6 text-right">
                    <p class="x-p cart__pricing-total-cost"><strong>$<%total_price%></strong></p>
                </div>
            </div>
            <a href="/checkout" id="checkoutButton" class="btn btn--secondary btn--full cart__cta">
                Check Out
            </a>
        </div>
    </div>
`;
