function printLinks(links) {
	// put links in data object
	var data = {groups: links};
	// use this template to format
	var template = '<h1>Comaxx Uren Fix</h1>{{#groups}}<b>{{name}}</b><ul>' +
			'{{#projects}}'+
				'<li><a href="javascript:newWindow(\'webMutate.aspx?Call=wucMutateProjectActivity.ascx&Key={{key}}&Action=Edit&ref=Urenfix\')">{{name}}</a></li>'+
			'{{/projects}}'+
		'</ul>{{/groups}}';

	// convert to html
	var html = Mustache.to_html(template, data);
	// add html
	document.getElementById('urenfix').innerHTML = html;

}

function printAddButton(links) {
	// put links in data object
	var data = {groups: links};

	// use this template to format
	var template = ''+
	'<select id="add_project_to_group" style="margin-top:8px;margin-left:10px;">'+
		'<option id="-1">'+chrome.i18n.getMessage('i18n_select_option')+'</option>'+
		'{{#groups}}<option>{{name}}</option>{{/groups}}'+
	'</select>'+
	'<img id="add_project_to_group_button"  class="add_project_to_group_button" src="Components/Images/btnNew26.gif" style="border-width:0px;padding-top:5px;margin-left:5px;" align="top" />';

	// convert to html
	var html = Mustache.to_html(template, data);

	// add html
	document.getElementById('add_block').innerHTML = html;
}

function AddProjectToGroup() {
	$(this).addClass('disabled');
	var project_id = document.getElementById('ctl00_cphContent_ctl00_txtProNo_txtTextBox').value;
	var select_box = document.getElementById('ctl00_cphContent_ctl00_ddlCustomers_ddlDropDownList');

	// project_name = [{company name}] {project description}
	var project_name = '[ ' + select_box.options[select_box.selectedIndex].text + ' ]  ' + $('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').val();

	var project_key = getParameterByName('Key');
	var group_name = $('#add_project_to_group').val();

	// if no group selected -> exit
	if (group_name == chrome.i18n.getMessage('i18n_select_option')) {
		alert(chrome.i18n.getMessage('i18n_no_group_selected')+'!');
		$(this).removeClass('disabled');
		return;
	}

	// save
	chrome.storage.sync.get("Acknowledge.links", function(r) {
		var links = r["Acknowledge.links"];
		var is_succes = false;
		jQuery.each(links, function(i,val) {
			if (val.name == group_name) {
				// TODO: add check if project allready exists.
				val.projects.push ({"key":project_key,"name":project_id + ' - ' + project_name});
				is_succes = true;
			}
		});

		if (!is_succes) {
			alert(chrome.i18n.getMessage('i18n_failed_to_add')+'!');
		} else {
			storeLinks(links);
			alert(chrome.i18n.getMessage('i18n_successful_project_add', [project_name, group_name]) +'.');
		}


	});
}

function getParameterByName(name)
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}


if (filter = document.getElementById('ctl00_cphContent_trFilter')) {
	// get info here because of event listner
	var filter = filter = document.getElementById('ctl00_cphContent_trFilter');
	//var links = getLinks();

	// create new table row for data
	var	tr = document.createElement('tr');
	var	td = document.createElement('td');
	td.id = 'urenfix';
	tr.appendChild(td);
	filter.parentNode.insertBefore(tr, filter.nextSibling);


	(function() {
		chrome.storage.sync.get("Acknowledge.links", function(r) {
			var links = r["Acknowledge.links"];
			if(links == undefined) {
				links = [
					{
						name: 'Overhead',
						projects: [],
					},
					{
						name: 'Projects',
						projects: [],
					}
				];
				storeLinks(links);
			} else {
				printLinks(r["Acknowledge.links"]);
			}

		});

		// add event listener
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (key in changes) {
				var storageChange = changes[key];
				printLinks(storageChange.newValue);
			}
		});

	})();
}

(function() {
	if (document.getElementById('ctl00_cphContent_ctl00_txtDate_txtTextBox')
		&& getParameterByName('ForceAction') != ''
		&& getParameterByName('Call') == 'wucMutateProjectLineActivity.ascx') {

		$('#ctl00_cphContent_ctl00_txtDate_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').focus();
				return false;
			}
		});
		$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').focus();
				return false;
			}
		});
		$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').keypress(function(e){
			// cancel enter key
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').focus();
				return false;
			}
		});
	}
})();

(function() {
	// check if wehere on a project page.
	// if so add a menu item for adding project to quick link store.
	if(window.location.href.indexOf('wucMutateProjectActivity.ascx') > 0) {
		var add_block = document.createElement('div');
		add_block.style.float = 'left';
		add_block.id = 'add_block';
		add_block.innerHTML = ''; //div will be filled by printAddButton
		$('.wucMutateButtons').append(add_block);

		(function() {
			chrome.storage.sync.get("Acknowledge.links", function(r) {
				var links = r["Acknowledge.links"];

				if(links == undefined) {
					console.log('no Groups');
				} else {
					printAddButton(r["Acknowledge.links"]);
					// add trigger here, due to repaint options
					$('.add_project_to_group_button:not(.disabled)').live('click', AddProjectToGroup);
				}

			});

			chrome.storage.onChanged.addListener(function(changes, namespace) {
				for (key in changes) {
					var storageChange = changes[key];
					printAddButton(storageChange.newValue);
				}
			});

		})();
	}
})();

var updateScript = document.createElement('script');
updateScript.type = 'text/javascript';
updateScript.innerHTML = 'window.newWindow = function(url){window.open(url);}; ';

document.head.appendChild(updateScript);
