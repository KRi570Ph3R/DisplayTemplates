//Original Author: Paul Hunt - December 2015

//Create our Namespace object to avoid polluting the global namespace
var pfh = pfh || {};

//setup some variables to hold the field schemas

pfh.peopleField = ""
pfh.personField = ""
pfh.peopleOrGroupsField = ""



//Define our Header Render pattern
pfh.renderHeader = function(ctx) {
	//Define any header content here.
	//You can include JavaScript and CSS links here.
	
	//We have to do the lookup for our field schema here as it doesn't exist in the preRender
	var lookupHelper = {};
	for (var i = 0, len = ctx.ListSchema.Field.length; i < len; i++)
	{
		lookupHelper[ctx.ListSchema.Field[i].RealFieldName] = ctx.ListSchema.Field[i];
	}
	
	pfh.peopleField = lookupHelper["People"];
	pfh.personField = lookupHelper["Person"];
	pfh.peopleOrGroupsField = lookupHelper["PeopleOrGroups"];	

	
	var headerHTML = ""
	headerHTML += "<ul class='listWrapper'>"
	return headerHTML;
	}

//Define our footer render pattern
pfh.renderFooter = function(ctx) {
	//Define any footer content here.
	var footerHTML = "</ul>";
	return footerHTML;
	}

//Define our item Render pattern
//This will be called once for each item being rendered from the list.
//All fields in the view can be access using ctx.CurrentItem.InternalFieldName
//NB: The field must be included in the view for it to be available
pfh.CustomItem = function(ctx) {
    
    var currentRowID = "listitemWrapper-" + ctx.CurrentItemIdx;
    var itemHTML = "<ul id='" + currentRowID + "'><li>";
    itemHTML += ctx.CurrentItem.Title +  "<ul>";
    
    UserFieldRenderer("People");
    itemHTML += "<li>" + UserFieldRendererRenderField(ctx,pfh.peopleField,ctx.CurrentItem,ctx.ListSchema) + "</li>";

	UserFieldRenderer("Person");
    itemHTML += "<li>" + UserFieldRendererRenderField(ctx,pfh.personField,ctx.CurrentItem,ctx.ListSchema) + "</li>";

    UserFieldRenderer("PeopleOrGroups");
    itemHTML += "<li>" + UserFieldRendererRenderField(ctx,pfh.peopleOrGroupsField,ctx.CurrentItem,ctx.ListSchema) + "</li>";

	itemHTML += "</ul></li></ul>"
	return itemHTML;	
}


//Define any code/function that needs to be run AFTER the page has been completed and the DOM is complete.
pfh.PostRenderCallback = function(ctx) {
}

//Define the function that will register our Override with SharePoint.
pfh.RegisterTemplateOverride = function () {
// 	Define a JavaScript object that will contain our Override
	var overrideCtx = {};
	overrideCtx.Templates = {};
	
//	Here we assign our Header and Footer functions to the template overrides.
	overrideCtx.Templates.Header = pfh.renderHeader;
	overrideCtx.Templates.Footer = pfh.renderFooter;

// 	And here we assign the CustomItem function to the Item registration.
	overrideCtx.Templates.Item = pfh.CustomItem;
		
//	And finally we add our PostRender function.
//  This expects a JavaScript array, so we pass the function in []
//	Dec 2015: Fixed an issue with the PostRender registration that caused it to fire during template registration
	overrideCtx.OnPostRender = [function() {pfh.PostRenderCallback(ctx);}];
	
//	Register this Display Template against views with matching BaseViewID and ListTemplateType
//	See http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.listtemplatetype(v=office.15).aspx for more ListTemplateTypes	
	overrideCtx.BaseViewID = 1;
	overrideCtx.ListTemplateType = 100;
	
//  Register the template overrides with SharePoint
	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
};

//Register for MDS enabled site otherwise the display template doesn't work on refresh
//Note: The ~sitecollection tokens cannot be used here!
//PH Jan 2015 - As we know what the URL is on MDS enabled sites, we can safely extract the site colleciton URL
//For none MDS sites, we don't care if RegisterModuleInit works or not...
pfh.sitecolpath = window.location.pathname.substring(0,window.location.pathname.indexOf("/_layouts/15/start.aspx"))
RegisterModuleInit(pfh.sitecolpath + "/_catalogs/masterpage/Display%20Templates/csr_ovr_RenderPeopleFields.js", pfh.RegisterTemplateOverride); // CSR-override for MDS enabled site
pfh.RegisterTemplateOverride(); //CSR-override for MDS disabled site (because we need to call the entry point function in this case whereas it is not needed for anonymous functions)

