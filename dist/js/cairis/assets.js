/**
 * Created by Raf on 29/05/2015.
 */
/*
Because the API changed, I had to reprogram some functions inside the assets page. Because i now follow a file-per-controller principle,
I've token the functions that I've changed in the original files and placed them here.
 */
$(document).on('click', "button.editAssetsButton",function(){
    var name = $(this).attr("value");
    $.session.set("AssetName", name.trim());

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/assets/name/" + name.replace(" ", "%20"),
        success: function (newdata) {
            // console.log(JSON.stringify(rawData));
            fillOptionMenu("../../CAIRIS/fastTemplates/EditAssetsOptions.html","#optionsContent",null,true,true, function(){
                    $.session.set("Asset", JSON.stringify(newdata));
                    $('#editAssetsOptionsform').loadJSON(newdata,null);
                    forceOpenOptions();
                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        accept: "application/json",
                        data: {
                            session_id: String($.session.get('sessionID'))
                        },
                        crossDomain: true,
                        url: serverIP + "/api/assets/name/" + newdata.theName + "/properties",
                        success: function (data) {
                            $.session.set("AssetProperties", JSON.stringify(data));
                            fillEditAssetsEnvironment();
                            $.ajax({
                                type: "GET",
                                dataType: "json",
                                accept: "application/json",
                                data: {
                                    session_id: String($.session.get('sessionID'))
                                },
                                crossDomain: true,
                                url: serverIP + "/api/assets/types",
                                success: function (data) {
                                    $.each(data, function (index, type) {
                                        $('#theType')
                                            .append($("<option></option>")
                                                .attr("value",type.theName)
                                                .text(type.theName));
                                    });

                                },
                                error: function (xhr, textStatus, errorThrown) {
                                    debugLogger(String(this.url));
                                    debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                                }
                            });
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            debugLogger(String(this.url));
                            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                        }
                    });
                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});
/*
 Clicking an asset Environment
 */
optionsContent.on('click', '.assetEnvironmetRow', function(event){
    var assts = JSON.parse($.session.get("AssetProperties"));
    var text = $(this).text();
    var props;
    $.each(assts, function(arrayID,group) {
        if(group.theEnvironmentName == text){
            props = group.theProperties;
            $.session.set("thePropObject", JSON.stringify(group));
            $.session.set("Arrayindex", arrayID);
            $.session.set("UsedProperties", JSON.stringify(props));
            getAssetDefinition(props);
        }
    });

});
/*
For editing the definition properties
*/
optionsContent.on('dblclick', '.clickable-properties', function(){
    var test = $(this);
    $("#editAssetsOptionsform").hide();
    var label = test.find(".theAssetPropName").text();

    $("#editpropertiesWindow").show(function(){
        var jsonn = JSON.parse($.session.get("thePropObject"));
        var theRightprop;
        $.each(jsonn.theProperties,function(arrayID,data){
            if(data.name == label){
                theRightprop = data;
                //$.session.set("thePropObject", JSON.stringify(theRightprop));
               // $.session.set("Arrayindex", arrayID);

                //NEW
                $("#property").val(theRightprop.name);
                $('#editpropertiesWindow').loadJSON(theRightprop,null);
            }
        });

        /*$("#property:selected").removeAttr("selected");
        $("#property").find("option").each(function() {
            if(label.toLowerCase() == theRightprop.name.toLowerCase()){
                $("#property").val(theRightprop.name);
            }
        });
        $('#editpropertiesWindow').loadJSON(theRightprop,null);*/
    });
    //console.log(    $.session.get("UsedProperties"));


});

/*
 Updating asset
 */
optionsContent.on("click", "#updateButtonAsset", function(){
    var allprops = JSON.parse($.session.get("AssetProperties"));
    var props;

    //if new prop
    if($("#editpropertiesWindow").hasClass("newProperty")){
        props =  jQuery.extend(true, {},AssetEnvironmentPropertyAttribute );
        props.name =   $("#property").find("option:selected").text().trim();
        props.value =  $("#value").find("option:selected").text().trim();
        props.rationale = $("#rationale").val();
        allprops[$.session.get("Arrayindex")].theProperties.push(props);


    }else {
        props = JSON.parse($.session.get("thePropObject"));
        props.name =   $("#property").find("option:selected").text().trim();
        props.value =  $("#value").find("option:selected").text().trim();
        props.rationale = $("#rationale").val();
        //props.id = parseInt($("#id").val());
       var arrIndex = $.session.get("Arrayindex");
        $.each(allprops[arrIndex].theProperties, function(index, object){
            if(object.name == props.name){
                allprops[$.session.get("Arrayindex")].theProperties[index].name = props.name;
                allprops[$.session.get("Arrayindex")].theProperties[index].value = props.value;
                allprops[$.session.get("Arrayindex")].theProperties[index].rationale = props.rationale;
                $.session.set("AssetProperties", JSON.stringify(allprops))
            }
        });
        updateAssetEnvironment(allprops,function(){
            $("#editAssetsOptionsform").show();
            $("#editpropertiesWindow").hide();
            //OPenen van
        });
    }


    $.session.set("AssetProperties", JSON.stringify(allprops));
    fillEditAssetsEnvironment();

});
