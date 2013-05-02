function restore_options() {
	console.log('restore_options');
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
				document.getElementById("config").value = JSON.stringify(links);
				toTree(links);
			}

		});


}

function toTree(data) {
	var html = '<ul id="tree_ul">';
	jQuery.each(data, function(group_i,group) {
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

	//html += '<span style="color:red;" id="add_group_0" class="add_group">Add new group</span>';

	document.getElementById("tree").innerHTML = html;
}

function save_options() {
	console.log('save_options');
	var object = document.getElementById("config");
	links = JSON.parse(object.value);
	storeLinks(links)

	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}

function saveGroup(group_id) {
	console.log('save group');
	// get value
	var new_value = $('#input_'+group_id).val();
	// save value to json
		var json_key = group_id.substring(6);
		//grab json
		var object = document.getElementById("config");
		links = JSON.parse(object.value);
		links[json_key].name = new_value;
		document.getElementById("config").value = JSON.stringify(links);
		save_options(); // will trigger repaint
		deactivateEditGroup(group_id);
	// end save value
}

function saveProject(id) {
	console.log('save project');

	var json_key = id.substring(8);
	var keys = json_key.split('_');
	var group_id = keys[0];
	var project_id = keys[1];

	// get value
	var new_value = $('#input_'+id).val();
	// save value to json
		//grab json
		var object = document.getElementById("config");
		links = JSON.parse(object.value);
		// set value
		links[group_id].projects[project_id].name = new_value;
		// save
		document.getElementById("config").value = JSON.stringify(links);
		save_options(); // will trigger repaint
		deactivateEditProject(id);
	// end save value
}

function addGroup(id) {
	console.log('Add group');
	// get value
	var new_value = $('#input_'+id).val();
	// save value to json
		//grab json
		var object = document.getElementById("config");
		links = JSON.parse(object.value);
		links.push ({"name":new_value, "projects": []});
		document.getElementById("config").value = JSON.stringify(links);
		save_options(); // will trigger repaint
		deactivateAddGroup(id);
	// end save value
}


function activateEditGroup(group_id) {
	console.log('Edit Group');
	$('#'+group_id).addClass('disabled'); // disable adding a nother input box.
	$('#edit_'+group_id+'_icon').addClass('disabled'); // disable adding a nother input box.
	$('#del_'+group_id).toggle();
	$('#edit_'+group_id+'_icon').toggle();
	var value = $('#'+group_id).html(); // grab current html value

	var html = '<input type="text" id="input_'+group_id+'" value="'+value+'">';
	html += ' <span id="save_'+group_id+'"> <img src="../icons/save.png" /> Save</span>';

	$('#'+group_id).html(html);
	$('#input_'+group_id).focus();
	$('#input_'+group_id).val(value);

	// use query selector beacuse of policies
	document.querySelector('#save_'+group_id).addEventListener('click', function() {saveGroup(group_id);});
	document.querySelector('#input_'+group_id).addEventListener('keyup', function (e) {
		var key = e.which || e.keyCode;
		if (key == 13) { // 13 is enter
			saveGroup(group_id);
		} else if(key == 27) { // 27 is esc
			deactivateEditGroup(group_id);
		}
	});
}

function activateEditProject(project_id) {
	console.log('Edit Project');
	$('#'+project_id).addClass('disabled'); // disable adding a nother input box.
	$('#edit_'+project_id+'_icon').addClass('disabled'); // disable adding a nother input box.
	$('#del_'+project_id).toggle();
	$('#edit_'+project_id+'_icon').toggle();
	var value = $('#'+project_id).html(); // grab current html value

	var html = '<input type="text" id="input_'+project_id+'" value="'+value+'">';
	html += ' <span id="save_'+project_id+'"> <img src="../icons/save.png" /> <strong>Save</strong></span>';

	$('#'+project_id).html(html);

	$('#input_'+project_id).focus();
	$('#input_'+project_id).val(value);

	// use query selector beacuse of policies
	document.querySelector('#save_'+project_id).addEventListener('click', function() {saveProject(project_id);});
	document.querySelector('#input_'+project_id).addEventListener('keyup', function (e) {
		var key = e.which || e.keyCode;
		if (key == 13) { // 13 is enter
			saveProject(project_id);
		} else if(key == 27) { // 27 is esc
			deactivateEditProject(project_id);
		}
	});
}


function deactivateEditGroup(group_id) {
	$('#'+group_id).removeClass('disabled'); // disable adding a nother input box.
	$('#edit_'+group_id+'_icon').removeClass('disabled'); // disable adding a nother input box.
	$('#del_'+group_id).toggle();
	$('#edit_'+group_id+'_icon').toggle();
	restore_options();
}

function deactivateEditProject(project_id) {
	restore_options();
}

function deactivateAddGroup(group_id) {
	restore_options();
	$('#add_group_button').toggle();
	$('#add_group_0').toggle();
}

// use query selector beacuse of policies
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#save_add_group_0').addEventListener('click', function() {addGroup('add_group_0');});
document.querySelector('#input_add_group_0').addEventListener('keyup', function (e) {
	var key = e.which || e.keyCode;
	if (key == 13) { // 13 is enter
	  addGroup('add_group_0');
	} else if(key == 27) { // 27 is esc
		deactivateAddGroup('add_group_0');
	}
});


$(document).ready(function() {
	restore_options();

	// add event listener
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		restore_options();
	});

	// edit group by element
    $('.edit_group:not(.disabled)').live('click', function() {
		var group_id = $(this).attr('id'); // grab element ID
		activateEditGroup(group_id);
	});

	// edit group by icon
	$('.edit_group_icon:not(.disabled)').live('click', function() {
		var id_keys = $(this).attr('id').split('_'); // grab element ID
		var group_id = id_keys[2];
		activateEditGroup('group_'+group_id);
	});

	// edit project by element
	$('.edit_project:not(.disabled)').live('click', function() {
		var project_id = $(this).attr('id'); // grab element ID
		activateEditProject(project_id);

	});

	// edit project by element
	$('.edit_project_icon:not(.disabled)').live('click', function() {
		var id_keys = $(this).attr('id').split('_'); // grab element ID
		var project_key = id_keys[2]+ '_'+id_keys[3];
		activateEditProject('project_'+project_key);

	});


	// add button
    $('#add_group_button').live('click', function() {
		console.log('Add Group');
		$('#add_group_button').toggle();
		$('#add_group_0').toggle();
		$('#input_add_group_0').focus();
		$('#input_add_group_0').val('');

	});

	// dell group button
    $('.del_group:not(.disabled)').live('click', function() {
		console.log('Del group');
		if (confirm('Delete group record?')) {
			$(this).addClass('disabled'); // disable adding a nother input box.
			var id = $(this).attr('id'); // grab element ID

			var json_key = id.substring(10);

			//grab json
			var object = document.getElementById("config");
			links = JSON.parse(object.value);
			// remove item
			links.splice(json_key, 1);
			// save
			document.getElementById("config").value = JSON.stringify(links);
			save_options(); // will trigger repaint
		}
	});



	// dell project button
    $('.del_project:not(.disabled)').live('click', function() {
		console.log('Del project');
		if (confirm('Delete project record?')) {
			$(this).addClass('disabled'); // disable adding a nother input box.
			var id = $(this).attr('id'); // grab element ID

			var json_key = id.substring(12);
			var keys = json_key.split('_');
			//grab json
			var object = document.getElementById("config");
			links = JSON.parse(object.value);
			// remove item
			links[keys[0]].projects.splice(keys[1], 1);
			// save
			document.getElementById("config").value = JSON.stringify(links);
			save_options(); // will trigger repaint
		}
	});

	$('#advanced_option_link').live('click', function() {
		$('#advanced_info').toggle();
	});
 });
