function getLinks() {
	//var links = localStorage.getItem("Acknowledge.links");
	//var links chrome.storage.sync.get("Acknowledge.links", function() { });
	
	var links;
	chrome.storage.sync.get("Acknowledge.links", function(r) {
		links = r["Acknowledge.links"];
		console.log(links);
		if(links == undefined) {
			//links = [];
			/*links = [
			['Overhead'],
			[2297, '1130022 - Comaxx Group'],
			[],
			['Projects'],
			[2246, '1130020 - McCloudOI']
			];
			links = [
				{
					name: 'Overhead', 
					projects: [
						{
							name: '1130022 - Comaxx Group',
							key: 2297
						},
						{
							name: 'NedStars',
							key: 2150
						}
					]
				},
				{
					name: 'Projects', 
					projects: [
						{
							name: '1130020 - McCloudOI',
							key: 2246
						}
					]
				}
			];*/
			console.log('new'); 
			storeLinks(links);
		} 
		console.log('loaded');
	});
	
	return links;
}

function storeLinks(links) {
	//localStorage.setItem("Acknowledge.links", JSON.stringify(links));
	chrome.storage.sync.set({"Acknowledge.links": links}, function() { console.log('saved');});
}