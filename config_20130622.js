/**
 * Change Log
 * 12/19/12 SKharche VER 65650 - Group Name and Unique Name in Config  
 * 12/19/12 SKharche VER 65624 - Support Line Level Address Info & Fix Pricing
 * 02/27/13 SKharche VER 66336 - Display config comment under manadatory item's comment column
 * 03/08/13 SKharche VER 66412 - Javascript to support unified computing
 * 04/08/13 SKharche VER 66699 - Lock network address fields so that user cannot type in any data
 * 04/23/13 SKharhce VER 66870 - CTL Code Reconciliation
 *          RConaghan US 871   - Javascript to perform HTML transformations
 *          RConaghan US 371   - Reselecting Service Locations on the Oppty
 * 05/09/13 SKharche VER 67036 - Populate bmiNodeName with APACHE_LB_NODE
 * 05/21/13 SKharche BIGMACH-2001 - CTL code reconciliation
 * 08/07/13 RConaghan US 1465  - Added Code for Popup Window functionality in HTML Array Transformations
**/
 
/*global require */

//US 1465 - Generic customWindowPopup function created; must be initialized outisde of require function since it has dynamic inputs on a per-address basis.
function customWindowPopup(sCode, winTitle,winHeight,winWidth){
	sOutput = '<html><head><title>'+winTitle+'</title>';
	sOutput = sOutput + '</head><body id=\"code-popup\">';
	sOutput = sOutput + sCode;
	sOutput = sOutput + '<p><a href=\"javascript:self.close()\">Close Window</a></p></body></html>';
	var codeWindow = window.open('','codeWindow','height='+winHeight+',width='+winWidth+',left=50,top=50,resizable=yes,scrollbars=1,toolbar=no,menubar=no,location=no,directories=no,status=no');
	codeWindow.document.write(sOutput);
} 

// Page Data Template 
require(["jquery_cookie"], function() {
    /*
    * Put all functions for config here
    */

    // This function runs when the page loads
    require.ready(function() {
        assignZAddress();
        assignAAddress();
        assignPrimaryResiliency();
        assignExistingServiceResiliency();
        assignGroupName();
        getAddressInfo();
        showConfigComment();
        showWindowPopups();
        arrayAttrHtmlTransform();
        populateBMINodeName();
    });
    
    /*
    * Function to set network Z address and the related attributes
    * Upon user selection of address from the networkZAddressHTML attribute, the value is split on !$! and the split values are 
    * pushed to the corresponding attributes like networkZAddress, networkZAddressTech, networkZAddressCountry and networkZAddressName
    */
    function assignZAddress(){
        jQuery("#networkZAddressHTML").children("select").change( function(){
            var data = jQuery(this).children('option:selected').val();
            var physicalLocInfo = data.split("!$!");
            
            jQuery("input[name='networkZAddress'], textarea[name='networkZAddress']").val(physicalLocInfo[0]);
            jQuery("input[name='networkZAddressTech']").val(physicalLocInfo[1]);
            jQuery("input[name='networkZAddressCountry']").val(physicalLocInfo[2]);
            jQuery("input[name='networkZAddressName']").val(physicalLocInfo[3]);
            updateConfig();
        })

        // VER 66699 - Lock network address fields so that user cannot type in any data
        // Currently we display networkZAddress attribute if there is a constraint error (so that we do not get internal constraint error)
        // Once the attribute is displayed, user can type in any data into it which should be prevented
        if(jQuery("#networkZAddress").is(":visible")) {
            zAddress = document.getElementById('networkZAddress');
            zAddress.setAttribute('readonly', 'readonly');
        }
        
        /*
        * The below section runs on every page load and defaults the HTML attribute to the user selected option
        * The reason it is present in this function is becasue it is related to this functionality
        */
        selecedAddress = jQuery("input[name='networkZAddress'], textarea[name='networkZAddress']").val();
        jQuery("#addressSiteZ").find("option:contains(" + selecedAddress + ")").each(function(){
          if( jQuery(this).text() == selecedAddress ) {
            jQuery(this).attr("selected","selected");
          }
        });
    }
    
    /*
    * Function to set network A address and the related attributes
    * Upon user selection of address from the networkAAddressHTML attribute, the value is split on !$! and the split values are 
    * pushed to the corresponding attributes like networkAAddress, networkAAddressTech, networkAAddressCountry and networkAAddressName
    */
    function assignAAddress(){
        jQuery("#networkAAddressHTML").children("select").change( function(){
            var data = jQuery(this).children('option:selected').val();
            var physicalLocInfo = data.split("!$!");

            jQuery("input[name='networkAAddress'], textarea[name='networkAAddress']").val(physicalLocInfo[0]);
            jQuery("input[name='networkAAddressTech']").val(physicalLocInfo[1]);
            jQuery("input[name='networkAAddressCountry']").val(physicalLocInfo[2]);
            jQuery("input[name='networkAAddressName']").val(physicalLocInfo[3]);
            updateConfig();
        })
        
        // VER 66699 - Lock network address fields so that user cannot type in any data
        // Currently we display networkAAddress attribute if there is a constraint error (so that we do not get internal constraint error)
        // Once the attribute is displayed, user can type in any data into it which should be prevented
        if(jQuery("#networkAAddress").is(":visible")) {
            aAddress = document.getElementById('networkAAddress');
            aAddress.setAttribute('readonly', 'readonly');
        }
        
        /*
        * The below section runs on every page load and defaults the HTML attribute to the user selected option
        * The reason it is present in this function is becasue it is related to this functionality
        */
        selecedAddress = jQuery("input[name='networkAAddress'], textarea[name='networkAAddress']").val();
        jQuery("#addressSiteA").find("option:contains(" + selecedAddress + ")").each(function(){
          if( jQuery(this).text() == selecedAddress ) {
            jQuery(this).attr("selected","selected");
          }
        });
    }
    
    /*
    * Function to set primary network resiliency
    */
    function assignPrimaryResiliency(){
        jQuery("#networkResiliencyPrimarySelection").children("select").change( function(){
            selectedVal = jQuery(this).children('option:selected').val();
            jQuery("input[name='networkResiliencyPrimary'], textarea[name='networkResiliencyPrimary']").val(selectedVal);
            updateConfig();
        })
    }
    
    /*
    * Function to set existing service network resiliency
    */
    function assignExistingServiceResiliency(){
        jQuery("#networkResiliencyExistingServicesHTML").children("select").change( function(){
            selectedVal = jQuery(this).children('option:selected').text();
            jQuery("input[name='networkResiliencyExistingService'], textarea[name='networkResiliencyExistingService']").val(selectedVal);
            updateConfig();
        })
    }
    
    /*
    * Funciton to assign groupName from the selection made in the HTML group name list
    * VER 65650 - Group Name and Unique Name in Config
    */
    function assignGroupName() {
      // Populate groupName attribute from the HTML drop down based on user selection
      jQuery("#groupNameListHTML").children("select").change(function() {
        var data = jQuery(this).children('option:selected').val();
        jQuery("input[name='groupName']").val(data);
        updateConfig();
      });
      
      // The below section runs on every page load and defaults the HTML attribute to the user selected option
      // The reason it is present in this function is becasue it is related to this functionality
      selectedGroup = jQuery("input[name='groupName']").val();
      
      if(selectedGroup != '') {
          // Appenda space at the start and colon at the end becasue the option is stored as groupNum: groupName
          // If space is not present then 1: and 21: will give match for the search of 1: - which is not correct
          // Extra space at the start will make sure the number is matched completely
          selectedGroup = " " + selectedGroup + ": ";
          if(selectedGroup == "Other: ") {
            selectedGroupOther = jQuery("input[name='groupNameOther']").val();
            if(selectedGroupOther != "") {
                selectedGroup = ": " + selectedGroupOther;
            }
          }
          
          // If selectedGroup matches the drop down option then it is the selected option
          // For other - if drop down option equals 'Other' then it is the selected option. We need to do this because groupNameOther will not have an exact match in the drop down options. Drop down option has the format of groupNum: groupName
          // selectOtherOption tells us if the drop down's selected option should be set to Other or not
          selectOtherOption = "true";
          if(selectedGroup != "") {
            jQuery("#groupNameListHTML").find("option:contains(" + selectedGroup + ")").each(function(){
              if(jQuery(this).text() == selectedGroup || jQuery(this).text().indexOf(selectedGroup) != -1) {
                jQuery(this).attr("selected","selected");
                selectOtherOption = "false";
              }
             });
             
             if(selectOtherOption == "true") {
              jQuery("#groupNameListHTML").find("option[value='Other']").attr("selected",true);
             }
          }
        }
    }
    
     /*
    * Function to call the pulladdressInfo with the correct set of parameters
    * VER 65624 - Support Line Level Address Info & Fix Pricing
    */
    function getAddressInfo() {
        // Get the number of addresses and store it in addressCount. This is the max limit for the user to enter in the address index attribute.
        jQuery("input[name='addressCount']").val(jQuery("#numOfAddresses").text());
        
        // Get the JS parameters and split them to get Addon Name, Array Set Name and Array Prefix
        // JS Parameters attribtue is a delimited string of addonName!$!arraySetName!$!arrayPrefix**
        var parameter = jQuery("input[name='jsAddressParameters']").val();
        
        if(parameter != undefined) {
          var parameterList = parameter.split("**");
          jQuery.each(parameterList, function(index, value) { 
            if(value != '') {
              parameters = value.split("!$!");
              pullAddressInfo(parameters[0], parameters[1], parameters[2]); 
            }
          });   
        }
    }

    /*
    * Function to parse and pull the addressInfo
    * Parameters: arrayName    - actual arrayName matching variable name present in the addonProducts config attribute
    *             arraySetName - variable name of the array set (found under config attributes --> List Array Sets)
    *             arrayPrefix  - unique prefix used for the array addon. eg: Custom Hardware has prefix 'ch'
    */
    function pullAddressInfo(arrayName, arraySetName, arrayPrefix) {
        // Iterate over the list of selected addons
        jQuery("#addonProducts span input:checked").each(function(){
            // Get the selected addon name 
            var selectedVal = jQuery(this).val();
            
            // The below logic should ONLY run for the selected addons
            if(selectedVal == arrayName){
                addressIndexInput = "input[name=" + arrayPrefix + "NetworkZAddressIndex]";
                addressInput = "input[name=encodedAddressData]";
                
                // Iterate over the array's column
                jQuery("#" + arraySetName + " tbody tr td").each(function() {
                    var addressInfo = "";
                    
                    // Run the below logic for the changed array index attribute
                    jQuery(this).find(addressIndexInput).change(function() {
                        // Value entered by the user in the address index attribute
                        arrayAddressIndex = jQuery(this).val();
                        
                        // Iterate over the address list table 
                        jQuery(".addressListTable tbody tr").each(function() {
                           // Get the value of the 1st column which is index
                           addressIndex = jQuery(this).find("td").eq(0).text(); 
                           
                           // Check if the index entered by the array matches the address index 
                           if(addressIndex == arrayAddressIndex) {
                               // Get the value of the hidden 3rd column of the address list table. This column contains delimited string with all the address information
                               addressInfo = jQuery(this).find("td").eq(2).text();
                               
                               // Set the addressInput attribute with the addressInfo
                               jQuery(addressInput).val(addressInfo);
                           }
                        });
                        
                        // Click the update action so that the rule runs and the address attribtues are populated
                        updateConfig();
                    });
                });
            }
        });
    }
    
    /*
    * VER 66336 - Display config comment under manadatory item's comment column
    */
    function showConfigComment() {
        // Get the recommended item comment
        comment = jQuery('.Comment').text();
        commentArray = comment.split("!@!");
        
        // Set the recommended item comment with only the config comment which is 7th entry in the delimited string
        // NOTE: javascript sets this config comment but the data behind the scene is not updated.
        //       Becasue of this we get correct data in commerce
        jQuery('.Comment').text(commentArray[6]);
    }
    
    // Function that registers click actions for all the custom BSS buttons
    function showWindowPopups() {
        // VER 67036 - Javascript to support unified computing
        // Lookup inventory is defined as html button
        // the divs contain the URL for each button
        jQuery("a#lookup_inventory").click(function(){
            var link = jQuery("#lookupInventoryURL").text();
            var w = window.open(link, "LookupInventory", "status=1,scrollbars=1,resizable=1,width=920,height=600");
        });
        
        // VER 66870/US 371 (Reselecting Service Locations on the Oppty)
        // Edit Service Locations Button is defined on the ctlEditServiceButtons attribute on the all products level
        // Its URL is stored in the ctlSFDCServiceLocationsURL attribute on the all products level
        $("a#edit_service_locations").click(function(){
                // edit_service_locations button is defined in ctlEditServiceLocationsButton config attribute and associated recommendation rules
                var tmp = jQuery("input[name='runOnceBegin']").val();
                jQuery("input[name='runOnceEnd']").val(tmp);
                var link = $("#servLocURL").text();
                var w = window.open(link, "EditServiceLocations", "status=1,scrollbars=1,resizable=1,width=920,height=600");
            }
        );
    }
    
    /*
    function setupCrossScriptEventListener() {
        // This routine process cross scripting messages sent from SVVS. 
        // We support setField and updateField request (both value and innerHTML).
        var svHandleMessage = function(e) {
            if(e.data.indexOf('setFields') >= 0) {
                var SETFIELDS_DELIMITER = '!_!';
                var SETFIELD_DELIMITER = '::';
                
                var action = "";
                var setFields = e.data.split(SETFIELDS_DELIMITER);
                for(var i=0; i<setFields.length; i++) {
                    if(i == 0) {
                        action = setFields[i]
                        continue;
                    }
                    else {
                        var setField = setFields[i];
                        var fields = setField.split(SETFIELD_DELIMITER);
                        var field = fields[0];
                        var fieldValue = fields[1];
                        var myField;
                        if (document.getElementById(field) == undefined) {
                            if (document.getElementsByName(field) == undefined) {
                                alert('could not locate field ' + field);           
                                continue;
                            } else {
                                myField = document.getElementsByName(field)[0];
                            }
                        } else {
                            myField = document.getElementById(field);
                        }
                        //alert('current field ' + field + ' value ' + myField.value);
                        myField.value = fieldValue;
                        //alert('current field ' + field + ' new value ' + myField.value);
                    }
                }
                updateConfig();
            }
        }
        
        // register the event handler (cross browser)
        if(typeof window.addEventListener != 'undefined') {
            window.addEventListener('message', svHandleMessage , false);
        } else if(typeof window.attachEvent != 'undefined') {
           window.attachEvent('onmessage', svHandleMessage );
        }
    }
    */
    
    /*
    * VER 66870/US 827 - Prototype Dynamic Dropdown Solution
    * Function to get parameters for arrayHTMLSubstitute and arrayCaptureHTMLSelections functions and to call them
    * Param format: arraySetName!$!htmlAttr!$!textAttr**arraySetName!$!...
    */
    function arrayAttrHtmlTransform(){
        var parameter = jQuery("input[name='jsLogicalHTMLTransformationParameters']").val();
        if(parameter != undefined) {
            var parameterList = parameter.split("**");
            jQuery.each(parameterList, function(index, value){
                if(value != ''){
                    parameters = value.split("!$!");
                    if((parameters[0] == '' && parameters[1] != '') && !(parameters[0] == '' && parameters[1] == '' && parameters[2] == '')){
                        alert('Please fill out jsLogicalHTMLTransformationParameters attribute correctly. Format of arraySetVarName!$!arrayHTMLAttrVarName!$![arrayTextVarName]**');
                    }
                    arrayHTMLSubstitute(parameters[0], parameters[1], parameters[2]);
                    if(parameters[2] != ''){ //Only try to populate a target attribute if it exists.
                        arrayCaptureHTMLSelections(parameters[0], parameters[1], parameters[2]);
                    }
                }
                else{
                    alert('Please fill out jsLogicalHTMLTransformationParameters attribute correctly. Format of arraySetVarName!$!arrayHTMLAttrVarName!$![arrayTextVarName]**');
                }
            });
        }
    }
    
    /*
    * BIGMACH-2001 - CTL code reconciliation
    * VER 66870/US 827 - Prototype Dynamic Dropdown Solution
    * Helper Function to substitute keywords with HTML tags so that the text area renders the HTML
    * Params:   arraySetName - variable name of array SET.
    *           htmlAttrName - variable name of array attribute we are converting to HTML
    *           targetArrayAttrName - variable name of array attribute we are populating via HTML selection (optional)
    */    
    function arrayHTMLSubstitute(arraySetName, htmlAttrName, targetArrayAttrName){
        var attrIndex = jQuery("#" + arraySetName + " .cell-" +htmlAttrName).index(); //Find the attribute's index
        if(attrIndex != "-1"){
            jQuery("#" + arraySetName + " tbody tr td").each(function() { // Iterate over the array's column
                var colIndex = jQuery(this).index();
                if(colIndex == attrIndex) {
                    html = jQuery(this).text();
					hover = '';
					targetVal = '';
					if(targetArrayAttrName != ''){
						targetIndex = jQuery(this).closest("tr").prevAll().length;
                        targetVal = jQuery("#" + targetArrayAttrName + "-" + targetIndex).val();
					}
					//Pull hover text info out of data first
					if(html.search(/\!\$\!HOVER_TEXT_BEGIN\!\$\!/g) != -1 && html.search(/\!\$\!HOVER_TEXT_END\!\$\!/g) != -1){
						hover = html.substring(html.search(/\!\$\!HOVER_TEXT_BEGIN\!\$\!/g)+'!$!HOVER_TEXT_BEGIN!$!'.length, html.search(/\!\$\!HOVER_TEXT_END\!\$\!/g));
						//hover = hover.replace(/\!\$\!HOVER_BR\!\$\!/g, "&#013;");
						hover = "title=\""+hover.replace(/\!\$\!HOVER_BR\!\$\!/g, "&#013;")+"\" ";
						html = html.substring(html.search(/\!\$\!HOVER_TEXT_END\!\$\!/g)+'!$!HOVER_TEXT_END!$!'.length);
					}
					//TODO: Put in explaination for expected behavior on hover.
                    if(html.search('SELECT_BEGIN') != -1){
                        html = html.replace(/\!\$\!NEWLINE\!\$\!/g, "<br/>");
                        html = html.replace(/\!\$\!BOLD_BEGIN\!\$\!/g, "<b>");
                        html = html.replace(/\!\$\!BOLD_END\!\$\!/g, "</b>");
                        html = html.replace(/\!\$\!BR\!\$\!/g, "<br/><br/>");
						//html = html.replace(/\!\$\!SELECT_BEGIN\!\$\!/g, "<select title=\""+hover+"\" ");
						html = html.replace(/\!\$\!SELECT_BEGIN\!\$\!/g, "<select "+hover);
                        html = html.replace(/\!\$\!SELECT_END\!\$\!/g, "</select>");
                        html = html.replace(/\!\$\!OPTION_BEGIN\!\$\!/g, "<option ");
                        html = html.replace(/\!\$\!OPTION_END\!\$\!/g, "</option>");
						
						//Preselect last selection
						if(targetVal != '' && html.search("option value=\""+targetVal+"\">") == -1){
							alert('Error in defaulting dropdown. Please make sure that '+htmlAttrName+' is encoded with !$!OPTION_BEGIN!$!value!$!OPTION_END!$!');
						}
						html= html.replace("option value=\""+targetVal+"\">", "option value=\""+targetVal+"\" selected=\"selected\">");
                        jQuery(this).html(html);
                    }
                    else{
						if(targetArrayAttrName != ''){ //if an input attribute
							value = html; //value = jQuery(this).text();
							html = jQuery(this).html();
							if(html.search(/class=\"attribute-field read-only\">/g) != -1 && targetArrayAttrName != ''){ //open up field as this is an input field with no hiding rule attached
								value = targetVal;
								newHTML = "<div class=\"attribute-field-container\" "+hover+">";

								newHTML = newHTML + "<input id = \""+htmlAttrName+"\" class=\"text-field attribute-field\" type=\"text\" value=\""+value+"\" name=\""+htmlAttrName+"\" data-initial-value=\""+value+"\">";
								newHTML = newHTML + "</div>";
								html = newHTML;
								
								//html = html.replace(/class=\"attribute-field read-only\">/g, "class=\"text-field attribute-field\" data-initial-value=\"");
								//html = html.replace("</span>", "></span>");
								//html = html.replace(" type=\"hidden\"", "");
							}
						}
						else{ //If this is a read-only field, then apply formatting
							html = html.replace(/\!\$\!NEWLINE\!\$\!/g, "<br/>");
							html = html.replace(/\!\$\!BOLD_BEGIN\!\$\!/g, "<b>");
							html = html.replace(/\!\$\!BOLD_END\!\$\!/g, "</b>");
							html = html.replace(/\!\$\!BR\!\$\!/g, "<br/><br/>");							
							
							//US 1465 - Handle logic for making popup function call here.
							//Format of Param!$!Value**Param!$!Value
							if(html.search(/\!\$\!POPUP_BEGIN\!\$\!/g) != -1 && html.search(/\!\$\!POPUP_END\!\$\!/g) != -1){
								paramList = html.substring(html.search(/\!\$\!POPUP_BEGIN\!\$\!/g)+'!$!POPUP_BEGIN!$!'.length, html.search(/\!\$\!POPUP_END\!\$\!/g));
								popupParams = paramList.split('**');
								
								//All possible variables and their defaults go in this dictionary:
								var paramsDict = {"ID":"poupWindowButton", "WIN_HTML":"<h2>Hello, World!</h2>", "WIN_NAME":"Detailed Information", "HEIGHT":"600", "WIDTH":"600", "ANCHOR_TYPE":"IMG", "ANCHOR_VAL":"$BASE_PATH$/Icons/RedX.png", "HOVER":"Click for Detailed Information"};
								
								//Parse through variables and update the dictionary
								for(var i=0; i<popupParams.length; i++){
									nameValSplit = popupParams[i].split('!$!');
									if(nameValSplit[0] != '' && nameValSplit[1] != ''){
										if(paramsDict[nameValSplit[0]] != ''){
											paramsDict[nameValSplit[0]] = nameValSplit[1];
										}
									}
								}
								
								//Construct the Popup, including the call to the customWindowPopup function
								popupCode = "<a id=\"" + paramsDict["ID"] + "\" href=\"JavaScript:customWindowPopup(\'"+paramsDict["WIN_HTML"]+"\',\'"+paramsDict["WIN_NAME"]+"\',\'"+paramsDict["WIDTH"]+"\',\'"+paramsDict["HEIGHT"]+"\');\">";
								if(paramsDict["ANCHOR_TYPE"] == "IMG"){
									//Replace $BASE_PATH$ with real url if we have an image
									paramsDict["ANCHOR_VAL"] = paramsDict["ANCHOR_VAL"].replace('$BASE_PATH$', "/bmfsweb/"+_BM_HOST_COMPANY+"/image");
									popupCode = popupCode + "<img class=\"icon\" src=\""+paramsDict["ANCHOR_VAL"]+"\" title=\""+paramsDict["HOVER"]+"\">";
								}
								else{ //If Text Popup
									popupCode = popupCode + paramsDict["ANCHOR_VAL"];
								}
								popupCode = popupCode + "</a>";
								html = html.replace(paramList, '');
								html = html.replace(/\!\$\!POPUP_BEGIN\!\$\!/g, '');
								html = html.replace(/\!\$\!POPUP_END\!\$\!/g, popupCode);
							}
							//End Popup Code (US 1465)
						}                        
						
						jQuery(this).html(html);
                    }
                }
            });
        }
    }
    
    /*
    * VER 66870/US 827 - Prototype Dynamic Dropdown Solution
    * Helper Function to substitute keywords with HTML tags so that the text area renders the HTML
    * Params:   arraySetName - variable name of array SET.
    *           htmlAttrName - variable name of array attribute we are converting to HTML
    *           targetArrayAttrName - variable name of array attribute we are populating via HTML selection
    */  
    function arrayCaptureHTMLSelections(arraySetName, htmlAttrName, targetArrayAttrName){
        jQuery("#"+arraySetName + " #" + htmlAttrName).change(function() {
            targetIndex = jQuery(this).closest("tr").prevAll().length;
            //alert(jQuery(this).val());
            jQuery("#" + targetArrayAttrName + "-" + targetIndex).val(jQuery(this).val());
        });
    }
    
    // VER 67036 - Populate bmiNodeName with APACHE_LB_NODE
    // Pull APACHE_LB_NODE from the cookie
    // NOTE: the below code is taken from commerce.js
    function getcookie(name) { 
       var varcookie = document.cookie; 
       var prefix = name + "="; 
       var begin = varcookie.indexOf(prefix); 
       if (begin == -1) 
           return null; 
       var end = varcookie.indexOf(";", begin); 
       if (end == -1) 
          end = varcookie.length; 
       return unescape(varcookie.substring(begin + prefix.length, end)); 
    }
    
    // VER 67036 - Populate bmiNodeName with APACHE_LB_NODE
    function populateBMINodeName() {
        // The attribute should be populated only if CONCAT_NODE_TO_SESSION is 1
        if(CONCAT_NODE_TO_SESSION == 1) {
            var nodeName = getcookie("APACHE_LB_NODE");
            $("input[name=bmiNodeName]").val(nodeName);
        }
    }
    
    /*
    * Function to click update on config page
    * This function is written to centralize the code
    */
    function updateConfig() {
      jQuery('#update').closest("table").click();
    }
    
    // Hide pricebook information on page load
    jQuery(".pricebook-container").hide();
});


