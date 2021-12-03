window.onload = function() {
    Particles.init({
      selector: '.background',
      sizeVariations: 30,
      color: [
        '#0bd', 'rgba(20, 181, 230, 0.8)', 'rgba(0,187,221,.2)'
      ]
    });
  };

$(".openbtn").click(function () {//ボタンがクリックされたら
	$(this).toggleClass('active');//ボタン自身に activeクラスを付与し
    $("#g-nav").toggleClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#g-nav a").click(function () {//ナビゲーションのリンクがクリックされたら
    $(".openbtn").removeClass('active');//ボタンの activeクラスを除去し
    $("#g-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});
