/**
 * Created by Raf on 12/06/2015.
 */

var settingsDialog = $( "#settingsDialog" ).dialog({
    autoOpen: false,
    modal: true,
    buttons: {
        OK: function() {
            var index = $("#connectionSelection").val();
            var cookie = $.cookie("connections");
            var arr = JSON.parse(cookie);
           var obj = arr[index];
            $.session.set("usedConnectionIndex", index);
            var cookieText = obj.IP+obj.DB;

            cookie = $.cookie(cookieText);
            if(cookie !== undefined){
                var json = JSON.parse(cookie);
                $("#port").val(json.port);
                $("#user").val(json.user);
                $("#db").val(json.db);
            }
            $.session.set("cookieText",cookieText)
            $( this ).dialog( "close" );
            dialogwindow.dialog( "open" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
            $( "#errorDialog" ).dialog();
        }
    }
});

$(document).ready(function() {
    //  localStorage.removeItem('sessionID');
    hideLoading();

    var sessionID = $.session.get('sessionID');
    if(!sessionID){
        getCookieConnections();
        settingsDialog.dialog("open");
    }
    else{
        //Else we can show the table
        startingTable();
    }
});
$(document).on('click',"#addConnection", function (e) {
    e.preventDefault();
    toggleSettingWindows();
});
function getCookieConnections(){
    var json = $.cookie("connections");
    var select = $("#connectionSelection");
    select.empty();
    if(json !== undefined){
        json = JSON.parse(json);
        $.each(json, function (index, obj) {
            var text = "IP: " + obj.IP + ", database: " + obj.DB;
            select.append($("<option></option>")
                .attr("value",index)
                .text(text));
        });
    }
}
$(document).on('click', "#addThisConnection", function (e) {
    e.preventDefault();
    var json = {};
    json.IP = $("#IP").val();
    json.DB = $("#DBIP").val();
    var cookie = $.cookie("connections");
    if(cookie !== undefined){
        var arr = JSON.parse(cookie);
        arr.push(json);
        $.cookie("connections", JSON.stringify(arr));
    }else{
        var arr = [];
        arr.push(json);
        $.cookie("connections", JSON.stringify(arr));
    }
    getCookieConnections();
    toggleSettingWindows();
    $("#connectionSelection option:last").attr("selected","selected");

});
function toggleSettingWindows(){
    $("#connectionForm").toggle();
    $("#aNewConnection").toggle();
    $(".ui-dialog-buttonpane").toggle();
}

