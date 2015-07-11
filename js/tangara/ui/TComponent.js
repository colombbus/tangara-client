define(['jquery', 'TEnvironment', 'utils/TUtils'], function ($, TEnvironment, TUtils) {
	
	function TComponent(component, callback) {
		
		var domComponent;
		
		if (TUtils.checkString(component)) {
			// 'component' holds the name of html template
			var url = TEnvironment.getBaseUrl()+ "/components/" + component;
			$.get(url, function(data) {
				domComponent = $(data);
				if (typeof callback !== 'undefined') {
					callback.call(this, domComponent);
				}
			});
		} else {
			// 'component' holds div parameters
			var txtElement = "<div";
			if (typeof component.id !== 'undefined') {
				txtElement += " id=\""+component.id+"\"";
			}
			if (typeof component.class !== 'undefined') {
				txtElement += " class=\""+component.class+"\"";
			}
			txtElement += "></div>";
			domComponent = $(txtElement);	
			if (typeof callback !== 'undefined') {
				callback.call(this, domComponent);
			}
		}
			
		this.getComponent = function() {
			return domComponent;
		};
	}
	
	return TComponent;
});