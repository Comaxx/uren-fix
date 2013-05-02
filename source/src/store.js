function getLinks() {

	var links;
	chrome.storage.sync.get("Acknowledge.links", function(r) {
		links = r["Acknowledge.links"];
		console.log(links);
		if(links == undefined) {

			console.log('create empt link object');
			storeLinks(links);
		}
		console.log('loaded');
	});

	return links;
}

function storeLinks(links) {
	chrome.storage.sync.set({"Acknowledge.links": links}, function() { console.log('saved');});
}

function storeOptions(options) {
	chrome.storage.sync.set(options, function() { console.log('saved options');});
}
