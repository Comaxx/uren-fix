
// urenfix
(function ($, d, w, undefined) {
    // d = document, w= window, u = undefined

	var is_debug_mode = false;

	// default values
	var _settings  = {
		"start_time": "08:30",
		"time_increment": 900,
		"start_date" : undefined,
		"start_date_set_at" : undefined,
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

	var set_duration_in_minutes = 0;

	var _templates = {
		"project_links" : '<h1>Comaxx Uren Fix</h1>{{#groups}}<b>{{name}}</b><ul>' +
				'{{#projects}}'+
					'<li><a href="javascript:newWindow(\'webMutate.aspx?Call=wucMutateProjectActivity.ascx&Key={{key}}&Action=Edit&ref=Urenfix\')">{{name}}</a></li>'+
				'{{/projects}}'+
			'</ul>{{/groups}}',
		"add_project_button" : '<select id="add_project_to_group" style="margin-top:8px;margin-left:10px;">'+
			'<option id="-1">'+chrome.i18n.getMessage('i18n_select_option')+'</option>'+
			'{{#groups}}<option>{{name}}</option>{{/groups}}'+
		'</select>'+
		'<img id="add_project_to_group_button"  class="add_project_to_group_button" src="Components/Images/btnNew26.gif" style="border-width:0px;padding-top:5px;margin-left:5px;" align="top" />'
	}

	$.debug = function (message) {
		if (is_debug_mode) {
			console.log(message);
		}
	}

	$.fn.urenFix = function( options ) {
		$.debug('UrenFix Start');

		// overide defaults
		_settings = $.extend(_settings, options );

		// load Chrome data
		$.loadData();

		// activate Event listeners for Chrome data
		$.activateEventListeners();

		// change window open type
		$.setNeWindowToNewTab();

		// make inputfield usefull
		$.makeHTML5();

		$.addAutoSetTime();
		return this;
	};

	// change the newwindow function to open a new tab instead of a new pop-up
	$.setNeWindowToNewTab = function() {
		$.debug('setNeWindowToNewTab');

		var updateScript = d.createElement('script');
		updateScript.type = 'text/javascript';
		updateScript.innerHTML = 'window.newWindow = function(url){window.open(url);}; ';

		d.head.appendChild(updateScript);
	}

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

		chrome.storage.sync.get("start_date", function(r) {
			var start_date = r["start_date"];
			if (start_date != undefined) {
				$.setStartDate(start_date);
			}
		});

		chrome.storage.sync.get("start_date_set_at", function(r) {
			var start_date_set_at = r["start_date_set_at"];
			if (start_date_set_at != undefined) {
				$.setStartDateSetAt(start_date_set_at);
			}
		});

		chrome.storage.sync.get("Acknowledge.links", function(r) {
				var links = r["Acknowledge.links"];
				if(links != undefined) {
					$.setProjects(r["Acknowledge.links"]);
					$.printAddButton();
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
				// start date
				} else if (key == "start_date") {
					var storageChange = changes[key];
					$.setStartDate(storageChange.newValue);
				// start date set at
				} else if (key == "start_date_set_at") {
					var storageChange = changes[key];
					$.setStartDateSetAt(storageChange.newValue);
				} else if (key == "Acknowledge.links") {
					var storageChange = changes[key];
					$.setProjects(storageChange.newValue);
					$.printAddButton();

				}
			}
		});

		// page repaint due to ajax

		// fix encapsulation by chrome
		// add event listener on dom
		// trigger custom dom event.
		 document.addEventListener("needRepaint", function(){
			$.repaint();
		}, false);


		//window.Sys.WebForms.PageRequestManager.getInstance().add_endRequest($.repaint());
		var updateScript = d.createElement('script');
		updateScript.type = 'text/javascript';
		updateScript.innerHTML = 'Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function(sender, args){ var evt = document.createEvent("Event"); evt.initEvent("needRepaint", true, false); document.dispatchEvent(evt);});';

		d.head.appendChild(updateScript);
	};

	$.repaint = function() {
		$.debug('repaint');

		$.printLinks();
	};

	$.setStartTime = function(start_time) {
		$.debug('setStartTime');

		// set value
		_settings.start_time = start_time;

		// html5 field
		if ($('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5') != undefined) {
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').val(_settings.start_time);
		}

		// 24/7 field
		if ($('#ctl00_cphContent_ctl00_txtTime_txtTextBox') != undefined) {
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val(_settings.start_time);
		}
	};

	$.setTimeIncrement = function(time_increment) {
		$.debug('setTimeIncrement');

		if (time_increment < 1) {
			time_increment = 900;
		}
		// set value
		_settings.time_increment = time_increment;

		// update fields if needed
		if ($('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5') != undefined) {
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').attr('step',_settings.time_increment);
		}
	};

	$.setStartDate = function(start_date, is_new) {
		$.debug('setStartDate');

		if (start_date == undefined) {
			start_date = $.getToday();
		}

		// set value
		_settings.start_date = start_date;

		if (is_new === true) {
			$.setStartDateSetAt(new Date() / 1000);
		}
		$.repaintStartDate();
	};

	$.setStartDateSetAt = function(start_date_set_at) {
		$.debug('setStartDateSetAt');

		// set value
		_settings.start_date_set_at = start_date_set_at;

		$.repaintStartDate();
	};

	$.repaintStartDate = function() {
		$.debug('repaintStartDate');

		var now = new Date() / 1000;
		var start_date = undefined;

		// if start_date_set_at < now - 0.5 hours // reset start_date to now and invalidate start_date_set_at
		if (_settings.start_date_set_at == undefined) {
			start_date = $.getToday();
		} else if ((now - 60* 60*0.5)> _settings.start_date_set_at) {
			// invalid
			start_date = $.getToday();
		} else {
			start_date = _settings.start_date;
		}

		// 24/7 field
		if ($('#ctl00_cphContent_ctl00_txtDate_txtTextBox') != undefined && $.getParameterByName('ForceAction') == 'New') {
			$('#ctl00_cphContent_ctl00_txtDate_txtTextBox').val(start_date);
		}
	}

	$.setProjects = function(projects) {
		$.debug('setProjects');

		// set value
		_settings.projects = projects;

		// update links
		$.printLinks();
	};

	$.printLinks = function () {
		$.debug('printLinks');

		// only on the correct pages
		if (document.getElementById('ctl00_cphContent_trFilter') != undefined) {
			// make sure element exists
			if (document.getElementById('urenfix') == undefined) {
				// get info here because of event listner
				var filter = document.getElementById('ctl00_cphContent_trFilter');
				// create new table row for data
				var	tr = document.createElement('tr');
				var	td = document.createElement('td');
				td.id = 'urenfix';
				tr.appendChild(td);
				filter.parentNode.insertBefore(tr, filter.nextSibling);
			}

			// put links in data object
			var data = {groups: _settings.projects};

			// convert to html
			var html = Mustache.to_html(_templates.project_links, data);

			// add html
			document.getElementById('urenfix').innerHTML = html;

		}
	}

	$.printAddButton = function() {
		$.debug('printAddButton');

		// make sure where on project page
		if(w.location.href.indexOf('wucMutateProjectActivity.ascx') > 0) {

			if (document.getElementById('add_block') == undefined) {
				var add_block = document.createElement('div');
				add_block.style.float = 'left';
				add_block.id = 'add_block';
				add_block.innerHTML = ''; //div will be filled by printAddButton
				$('.wucMutateButtons').append(add_block);
			}

			// put links in data object
			var data = {groups: _settings.projects};

			// convert to html
			var html = Mustache.to_html(_templates.add_project_button, data);

			// add html
			document.getElementById('add_block').innerHTML = html;

			// add trigger here, due to repaint options
			// TODO: fix double binding of event, now every time this function is called the group is added
			// reproduce by adding a project and then selecting no group but clicking add
			$('.add_project_to_group_button:not(.disabled)').live('click', $.AddProjectToGroup);
		}
	}

	$.getParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search);
		if(results == null) {
			return "";
		} else {
			return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	};

	$.AddProjectToGroup = function() {
		$.debug('AddProjectToGroup');

		// prevent double
		$(this).addClass('disabled');

		// get project id
		var project_id = d.getElementById('ctl00_cphContent_ctl00_txtProNo_txtTextBox').value;

		// get project_name = [{company name}] {project description}
		var select_box = d.getElementById('ctl00_cphContent_ctl00_ddlCustomers_ddlDropDownList');
		var project_name = '[ ' + select_box.options[select_box.selectedIndex].text + ' ]  ' + $('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').val();

		// project KEY
		var project_key = $.getParameterByName('Key');

		// group name
		var group_name = $('#add_project_to_group').val();

		// if no group selected -> exit
		if (group_name == chrome.i18n.getMessage('i18n_select_option')) {
			alert(chrome.i18n.getMessage('i18n_no_group_selected')+'!');
			$(this).removeClass('disabled');
			return;
		}

		// save
		var is_succes = false;
		jQuery.each(_settings.projects, function(i,val) {
			if (val.name == group_name) {
				// TODO: add check if project allready exists.
				val.projects.push ({"key":project_key,"name":project_id + ' - ' + project_name});
				is_succes = true;
			}
		});

		if (!is_succes) {
			alert(chrome.i18n.getMessage('i18n_failed_to_add')+'!');
		} else {
			$.storeProjects();
			alert(chrome.i18n.getMessage('i18n_successful_project_add', [project_name, group_name]) +'.');
		}
	};


	$.storeProjects = function() {
		chrome.storage.sync.set({"Acknowledge.links": _settings.projects}, function() { $.debug('saved: Projects');});
	}

	$.storeStartDate = function(start_date) {
		chrome.storage.sync.set({
			"start_date": _settings.start_date,
			"start_date_set_at": _settings.start_date_set_at
		}, function() { $.debug('saved: start_date');});
	}

	$.changeStartDate = function(date) {
		$.setStartDate(date, true); // cause double repaint, but set the value
		$.storeStartDate();

		// set time out to change back to undifined
	};

	$.makeHTML5 = function() {
		$.debug('makeHTML5');

		// add date picker to date field
		if (d.getElementById('ctl00_cphContent_ctl00_txtDate_txtTextBox') !=  undefined) {
			$.datepicker.setDefaults($.datepicker.regional[ "nl" ] );

			// bind on change to date picker
			$( "#ctl00_cphContent_ctl00_txtDate_txtTextBox" ).datepicker(
				{
					onSelect: function(value){$.changeStartDate(value);}
				}
			);

			// bind on change to input field
			$("#ctl00_cphContent_ctl00_txtDate_txtTextBox").change(function(){
				$.changeStartDate($("#ctl00_cphContent_ctl00_txtDate_txtTextBox").val());
			});

		}

		// convert time input to html5 time input.
		/*if (d.getElementById('ctl00_cphContent_ctl00_txtTime_txtTextBox') !=  undefined) {
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').each(function() {
				var field_id = $(this).attr('id');

				// add html5 time input field
				$("<input type='time' />").attr({
						name: this.name,
						value: $.makeValidTime(this.value),
						id: field_id+ "_html5",
						step:_settings.time_increment,
						autocomplete: 'off'
					}).insertBefore(this);

				// add on change object to set old value
				$("#"+field_id+ "_html5").change(function(){
					$('#'+field_id).val($(this).val());
				});
				$(this).hide();
			});

		}*/
	};


	$.getToday = function() {
		var today_date = new Date();
		var day = today_date.getDate();
		var month = today_date.getMonth()+1;

		if ((new String(day)).length <2) {
				day = '0'+day;
		}
		if ((new String(month)).length <2) {
				month = '0'+month;
		}

		var today_string =  day +'-'+ month +'-'+ today_date.getFullYear();

		return today_string;
	};

	$.setNewStartTime = function() {
		$.debug('setNewStartTime');

		var duration_in_minutes = $.inputToMinutes($('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').val());
		var start_time_in_minutes = $.inputToMinutes($('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val());
		var date = $('#ctl00_cphContent_ctl00_txtDate_txtTextBox').val();
		// start time. only set new time is start time is default start time
		var default_start_time_in_minutes = $.inputToMinutes(_settings.start_time);

		// Convert minutes to hour string
		if ((set_duration_in_minutes != '0' || start_time_in_minutes == default_start_time_in_minutes) && date == $.getToday() ) {
			if (start_time_in_minutes == default_start_time_in_minutes) {
				start_time_in_minutes = ((new Date()).getHours()* 60) + (new Date()).getMinutes();
			}
			// calculate new minute (start time - diff between old & new duration)
			var new_start_time_in_minutes = start_time_in_minutes - (duration_in_minutes - set_duration_in_minutes);

			var hour_string = $.minutesToHourString(new_start_time_in_minutes)

			$.debug('new value:' + hour_string);

			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox').val(hour_string);
			$('#ctl00_cphContent_ctl00_txtTime_txtTextBox_html5').val($.makeValidTime(hour_string));

			set_duration_in_minutes = duration_in_minutes; // replace old value
		} else {
			$.debug('No time set ' + set_duration_in_minutes + ' ' + start_time_in_minutes + ' ' +$.getToday());
		}

		return set_duration_in_minutes;
	};


	$.makeValidTime = function(old_time) {
		var parts = old_time.split(':');
		var hours, minutes, seconds;

		// hours
		if (parts.length >= 1) {
			hours = ( (parts[0] < 10 && parts[0].length < 2) ? "0" : "" ) + parts[0];
		} else {
			hours = '00';
		}

		// minutes
		if (parts.length >= 2) {
			minutes = ( (parts[1] < 10 && parts[1].length < 2) ? "0" : "" ) + parts[1];
		} else {
			minutes = '00';
		}

		// seconds
		if (parts.length >= 3) {
			seconds = ( (parts[2] < 10 && parts[2].length < 2) ? "0" : "" ) + parts[2];
		} else {
			seconds = '00';
		}

		// return time string
		return hours + ":" + minutes + ":" + seconds;
	};

	$.inputToMinutes = function(time_input) {
		var time_in_minutes = '';

		if (time_input.indexOf(':') > 0) {
			var parts = time_input.split(":");
			time_in_minutes = parseInt(parts[0] * 60) + parseInt(parts[1]);
		} else if (time_input.indexOf(',') > 0) {
			// {h},{%} -> h}.{%}
			time_in_minutes = time_input.replace(",", ".") * 60;
		} else {
			// {h} -> {h}.0
			// {h}.{%}
			time_in_minutes = time_input * 60;
		}

		return time_in_minutes;
	};


	$.minutesToHourString = function(minutes) {
		if (minutes > 0) {
			// round minutes to nearest stepping size
			var step = (_settings.time_increment/60);
			minutes = (Math.round(minutes/step) * step);

			var worked_hours = Math.floor( minutes / 60);
			var worked_minutes = minutes % 60;

			if ((new String(worked_minutes)).length <2) {
				worked_minutes = '0'+worked_minutes;
			}
			return worked_hours + ':' + worked_minutes;
		} else {
			return '';
		}
	};

	$.addAutoSetTime = function() {
		if (d.getElementById('ctl00_cphContent_ctl00_txtDate_txtTextBox')
			&& $.getParameterByName('ForceAction') != ''
			&& $.getParameterByName('Call') == 'wucMutateProjectLineActivity.ascx') {

			$('#ctl00_cphContent_ctl00_txtDuration_txtTextBox').keyup(function (e) {
				if (e.ctrlKey && e.keyCode == 13) {
				  // Ctrl-Enter pressed
				  // set new time
				  $.setNewStartTime();
				  $('#ctl00_cphContent_ctl00_txtDescription_txtTextBox').focus();
				}
			});
		}

		jQuery.each(['txtDate_txtTextBox', 'txtTime_txtTextBox', 'txtDuration_txtTextBox'], function(i,val) {
			$('#ctl00_cphContent_ctl00_' + val).keypress(function(e){
					// cancel enter key
					var key = e.which || e.keyCode;
					if (key == 13) { // 13 is enter
						$(val).focus();
						return false;
					}
				});
		});
	};

} (jQuery, document, window));

$().urenFix({});
