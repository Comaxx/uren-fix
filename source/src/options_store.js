(function ($, d, w, undefined) {
    // d = document, w= window, u = undefined

    var is_debug_mode = false;

    // default values
	var _settings  = {
		"start_time": "08:30",
		"time_increment": 900,
		"projects": [
					{
						name: 'Overhead',
						projects: [],
					},
					{
						name: 'Projects',
						projects: [],
					}
				]
	};

    $.debug = function (message) {
		if (is_debug_mode) {
			console.log(message);
		}
	}


    $.fn.optionStore = function( options ) {
		$.debug('optionStore Start');

		// overide defaults
		_settings = $.extend(_settings, options );

		// load Chrome data
		$.loadData();

		// activate Event listeners for Chrome data
		$.activateEventListeners();


		$.addHtmlListeners();
		$('#advanced_option_link').live('click', function() {
			$('#advanced_info').toggle();
		});

		$("[i18n]:not(.i18n-replaced)").each(function() {
			$(this).html(chrome.i18n.getMessage($(this).attr("i18n")));
			// add class to know wich ones are done
			$(this).addClass("i18n-replaced");
		});
    };

	$.loadData = function() {
		$.debug('loadData');

		// set start time from config
		chrome.storage.sync.get("start_time", function(r) {
			var start_time = r["start_time"];
			if (start_time != undefined) {
				$.setStartTime(start_time);
			}
		});

		chrome.storage.sync.get("time_increment", function(r) {
			var time_increment = r["time_increment"];
			if (time_increment != undefined) {
				$.setTimeIncrement(time_increment);
			}
		});

		chrome.storage.sync.get("Acknowledge.links", function(r) {
				var links = r["Acknowledge.links"];
				if(links != undefined) {
					$.setProjects(r["Acknowledge.links"]);
				}
			});
	};

	$.activateEventListeners = function() {
		$.debug('activateEventListeners');

		// add event listener
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			for (key in changes) {

				// time increment
				if (key == "time_increment") {
					var storageChange = changes[key];
					$.setTimeIncrement(storageChange.newValue);
				// start time
				} else if (key == "start_time") {
					var storageChange = changes[key];
					$.setStartTime(storageChange.newValue);
				} else if (key == "Acknowledge.links") {
					var storageChange = changes[key];
					$.setProjects(storageChange.newValue);
				}
			}
		});
	};

	$.addHtmlListeners = function() {
		$.debug('addHtmlListeners');
		// edit group by element
		$('.edit_group:not(.disabled)').live('click', function() {
			var group_id = $(this).attr('id'); // grab element ID
			$.activateEditGroup(group_id);
		});

		// edit group by icon
		$('.edit_group_icon:not(.disabled)').live('click', function() {
			var id_keys = $(this).attr('id').split('_'); // grab element ID
			var group_id = id_keys[2];
			$.activateEditGroup('group_'+group_id);
		});

		// edit project by element
		$('.edit_project:not(.disabled)').live('click', function() {
			var project_id = $(this).attr('id'); // grab element ID
			$.activateEditProject(project_id);
		});

		// edit project by icon
		$('.edit_project_icon:not(.disabled)').live('click', function() {
			var id_keys = $(this).attr('id').split('_'); // grab element ID
			var project_key = id_keys[2]+ '_'+id_keys[3];
			$.activateEditProject('project_'+project_key);
		});

		// add button
		$('#add_group_button').live('click', function() {
			$.debug('Add Group');
			$('#add_group_button').toggle();
			$('#add_group_0').toggle();
			$('#input_add_group_0').focus();
			$('#input_add_group_0').val('');

		});


		//TODO: rewrite to use function
		// dell group button
		$('.del_group:not(.disabled)').live('click', function() {
			$.debug('Del group');
			if (confirm(chrome.i18n.getMessage('i18n_delete_are_you_sure', chrome.i18n.getMessage('i18n_group')))) {
				$(this).addClass('disabled'); // disable adding a nother input box.
				var id = $(this).attr('id'); // grab element ID

				var json_key = id.substring(10);

				// remove item
				_settings.projects.splice(json_key, 1);
				// save
				$.save_options(); // will trigger repaint
			}
		});



		//TODO: rewrite to use function
		// dell project button
		$('.del_project:not(.disabled)').live('click', function() {
			$.debug('Del project');
			if (confirm(chrome.i18n.getMessage('i18n_delete_are_you_sure', chrome.i18n.getMessage('i18n_project')))) {
				$(this).addClass('disabled'); // disable adding a nother input box.
				var id = $(this).attr('id'); // grab element ID

				var json_key = id.substring(12);
				var keys = json_key.split('_');

				// remove item
				_settings.projects[keys[0]].projects.splice(keys[1], 1);
				// save
				$.save_options(); // will trigger repaint
			}
		});

		// use query selector beacuse of policies
		document.querySelector('#save').addEventListener('click', $.save_options);
		document.querySelector('#save_add_group_0').addEventListener('click', function() {$.addGroup('add_group_0');});
		document.querySelector('#input_add_group_0').addEventListener('keyup', function (e) {
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$.addGroup('add_group_0');
			} else if(key == 27) { // 27 is esc
				$.deactivateAddGroup('add_group_0');
			}
		});

	}

	$.setStartTime = function(start_time) {
		$.debug('setStartTime');

		// set value
		_settings.start_time = start_time;

		$('#start_time').val(_settings.start_time);
	};

	$.setTimeIncrement = function(time_increment) {
		$.debug('setTimeIncrement');

		if (time_increment < 1) {
			time_increment = 900;
		}
		console.log(time_increment);
		// set value
		_settings.time_increment = time_increment / 60;

		$('#time_increment').val(_settings.time_increment);
	};

	$.setProjects = function(projects) {
		$.debug('setProjects');

		// set value
		_settings.projects = projects;

		$.toTree();
		document.getElementById("config").value = JSON.stringify(_settings.projects);
	};

	$.storeProjects = function() {
		chrome.storage.sync.set({"Acknowledge.links": _settings.projects}, function() { $.debug('saved: Projects');});
	};

	$.storeOptions = function(options) {
		chrome.storage.sync.set(options, function() { $.debug('saved: Options');});
	};

	$.toTree = function() {
		$.debug('toTree');

		//TODO: rewrite to template
		var html = '<ul id="tree_ul">';
		jQuery.each(_settings.projects, function(group_i,group) {
			// group
			html += '<li><strong class="edit_group" id="group_'+group_i+'">' + group.name + '</strong> <img src="../icons/edit.png" class="edit_group_icon" id="edit_group_'+group_i+'_icon"/> <img src="../icons/trash.png" class="del_group" id="del_group_'+group_i+'"/> ';

			// list items
			html += '<ul>';
			jQuery.each(group.projects, function(project_i,project) {
				html += '<li><span class="edit_project" id="project_'+group_i+'_'+project_i+'">'+ project.name + '</span> <img src="../icons/edit.png" class="edit_project_icon" id="edit_project_'+group_i+'_'+project_i+'_icon"/> <img src="../icons/trash.png" class="del_project" id="del_project_'+group_i+'_'+project_i+'"/></li>';
			});
			// end list items
			html += '</ul>';
			// end group
			html += '</li>';

		});

		html += '</ul>';

		// set HTML
		document.getElementById("tree").innerHTML = html;
	};


	$.activateEditGroup = function(group_id) {
		$.debug('Edit Group');
		$('#'+group_id).addClass('disabled'); // disable adding a nother input box.
		$('#edit_'+group_id+'_icon').addClass('disabled'); // disable adding a nother input box.
		$('#del_'+group_id).toggle();
		$('#edit_'+group_id+'_icon').toggle();
		var value = $('#'+group_id).html(); // grab current html value

		//TODO: rewrite to template
		var html = '<input type="text" id="input_'+group_id+'" value="'+value+'">';
		html += ' <span id="save_'+group_id+'"> <img src="../icons/save.png" /> '+chrome.i18n.getMessage('i18n_save')+'</span>';

		$('#'+group_id).html(html);
		$('#input_'+group_id).focus();
		$('#input_'+group_id).val(value);

		// use query selector beacuse of policies
		document.querySelector('#save_'+group_id).addEventListener('click', function() {$.saveGroup(group_id);});
		document.querySelector('#input_'+group_id).addEventListener('keyup', function (e) {
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$.saveGroup(group_id);
			} else if(key == 27) { // 27 is esc
				$.deactivateEditGroup(group_id);
			}
		});
	};

	$.activateEditProject = function(project_id) {
		$.debug('Edit Project');
		$('#'+project_id).addClass('disabled'); // disable adding a nother input box.
		$('#edit_'+project_id+'_icon').addClass('disabled'); // disable adding a nother input box.
		$('#del_'+project_id).toggle();
		$('#edit_'+project_id+'_icon').toggle();
		var value = $('#'+project_id).html(); // grab current html value

		//TODO: rewrite to template
		var html = '<input type="text" id="input_'+project_id+'" value="'+value+'">';
		html += ' <span id="save_'+project_id+'"> <img src="../icons/save.png" /> <strong>'+chrome.i18n.getMessage('i18n_save')+'</strong></span>';

		$('#'+project_id).html(html);

		$('#input_'+project_id).focus();
		$('#input_'+project_id).val(value);

		// use query selector beacuse of policies
		document.querySelector('#save_'+project_id).addEventListener('click', function() {$.saveProject(project_id);});
		document.querySelector('#input_'+project_id).addEventListener('keyup', function (e) {
			var key = e.which || e.keyCode;
			if (key == 13) { // 13 is enter
				$.saveProject(project_id);
			} else if(key == 27) { // 27 is esc
				$.deactivateEditProject(project_id);
			}
		});
	};

	$.deactivateEditGroup = function(group_id) {
		$('#'+group_id).removeClass('disabled'); // disable adding a nother input box.
		$('#edit_'+group_id+'_icon').removeClass('disabled'); // disable adding a nother input box.
		$('#del_'+group_id).toggle();
		$('#edit_'+group_id+'_icon').toggle();
		$.toTree();
	};

	$.deactivateEditProject = function(project_id) {
		$.toTree();
	};

	$.deactivateAddGroup = function(group_id) {
		$('#add_group_button').toggle();
		$('#add_group_0').toggle();
	};


	$.addGroup = function(id) {
		$.debug('Add group');
		// get value
		var new_value = $('#input_'+id).val();

		_settings.projects.push ({"name":new_value, "projects": []});
		$.save_options(); // will trigger repaint
		$.deactivateAddGroup(id);
	};

	$.save_options = function() {
		$.debug('save_options');

		var options = {};
		var save_options = false;

		//TODO: rewrite to  use object
		if ($('#time_increment')) {
			$.setTimeIncrement($('#time_increment').val() * 60);
			options.time_increment = _settings.time_increment * 60;
			save_options = true;
		}

		//TODO: rewrite to  use object
		if ($('#start_time')) {
			$.setStartTime($('#start_time').val());
			options.start_time = _settings.start_time;
			save_options = true;
		}

		if(save_options) {
			$.storeOptions(options);
		}

		// save options
		$.storeProjects()

		// Update status to let user know options were saved.
		var status = document.getElementById("status");
		status.innerHTML = chrome.i18n.getMessage('i18n_save_successful')+".";
		setTimeout(function() {
			status.innerHTML = "";
		}, 750);
	};

	$.saveGroup = function(group_id) {
		$.debug('save group');
		// get value
		var new_value = $('#input_'+group_id).val();
		// save value to json
			var json_key = group_id.substring(6);

			_settings.projects[json_key].name = new_value;

			$.save_options(); // will trigger repaint
			$.deactivateEditGroup(group_id);
		// end save value
	}

	$.saveProject = function(id) {
		$.debug('save project');

		var json_key = id.substring(8);
		var keys = json_key.split('_');
		var group_id = keys[0];
		var project_id = keys[1];

		// get value
		var new_value = $('#input_'+id).val();
		// save value to json

			// set value
			_settings.projects[group_id].projects[project_id].name = new_value;
			// save
			$.save_options(); // will trigger repaint
			$.deactivateEditProject(id);
		// end save value
	}


} (jQuery, document, window));

$().optionStore({});
