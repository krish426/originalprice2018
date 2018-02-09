$(document).ready(function() {
    $(".mat-drawer-content").css({"overflow": "hidden"});



    var pathname = window.location.pathname; // Returns path only
    if(pathname.search("profile") !=-1){openProfile();}else{openHome();}


   /* $(window).resize(function () {
        if(pathname.search("profile") !=-1){openProfile();}else{openHome();}
    })*/


    //active side menu
    $(".sideMenuList-Item").click(function () {
        $(".navigationLinks a").removeClass("active");
        $(".sideMenuList-Item").removeClass("active");
        $(this).addClass("active");
    });



});

function openProfile(){
    // $("#appFooter").fadeOut(0, function(){
        $(".navigationLinks").css({"top": "-55px"});
        $(".app-content").css({"margin-top": "55px","height":"93.6vh"});
    // });
}
function openHome(){
    // $("#appFooter").fadeIn(0, function(){
        $(".navigationLinks").css({"top": "55px"});
        $(".app-content").css({"margin-top": "100px","height":"86.5vh"});
    // });
}