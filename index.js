var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

		debug = self.debug;
		log = self.log;

	self.init_presets();
	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'TCP Port (Default: 6464)',
			width: 4,
			default: 6464,
			regex: self.REGEX_PORT
		},
		{
			type: 'dropdown',
			id: 'need_ack',
			label: 'Need ACK:',
			default: 'Yes',
			choices: [
				{ id: 'Yes', label: 'Yes' },
				{ id: 'No', label: 'No' },
			]
		},
		{
			type: 'text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'Please type in your user credentials:'
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Username',
			width: 4,
			default: 'Administrator'
		},
		{
			type: 'textinput',
			id: 'pass',
			label: 'Password',
			width: 4,
			default: ''
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.CHOICES_COMMANDS = [
	{ id: 'login',						label: 'Force Login'},
	{ id: 'recall_layout', 		label: 'Recall Layout'},
	{ id: 'switch_video', 		label: 'Switch Video'},
	{ id: 'switch_audio', 		label: 'Switch Audio'},
	{ id: 'transition_type',	label: 'Transition Type'},
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '14';

	for (var input in self.CHOICES_COMMANDS) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_COMMANDS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_COMMANDS[input].id, 
			}],
		});
	}

	self.setPresetDefinitions(presets);
}


instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({

		'login': {
			label: 'Force Login',
			options: [{
				type: 'text',
				id: 'info_login',
				width: 12,
				label: 'Information',
				value: 'Please setup username and password in the config tab.'
			}]
		},
		'recall_layout': {
			label: 'Recall Layout',
			options: [
				{
					type: 'number',
					id: 'recall_id',
					label: 'Recall Layout ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					id: 'recall_advance',
					label: 'Advance:',
					default: 'No',
					choices: [
						{ id: 'Yes', label: 'Yes' },
						{ id: 'No', label: 'No' },
					]
				}
			]
		},
		'switch_video': {
			label: 'Switch Video',
			options: [
				{
					type: 'number',
					id: 'switch_video_input_id',
					label: 'Input ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'switch_video_output_id',
					label: 'Output ID:',
					min: 1,
					max: 256,
					default: 6,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					id: 'switch_video_channel',
					label: 'Channel',
					default: 'MAIN',
					choices: [
						{ id: 'PIP', label: 'PIP' },
						{ id: 'MAIN', label: 'Main' },
					]
				}
			]
		},
		'switch_audio': {
			label: 'Switch Audio',
			options: [
				{
					type: 'number',
					id: 'switch_audio_input_id',
					label: 'Input ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'switch_audio_output_id',
					label: 'Output ID:',
					min: 1,
					max: 256,
					default: 2,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'transition_type': {
			label: 'Transition Type',
			options: [
				{
					type: 'number',
					id: 'transition_type_duration',
					label: 'Duration:',
					min: 0,
					max: 6000,
					default: 1,
					required: true,
					range: false,
					regex: '/(\W+\d|\d)+$/'
				},
				{
					type: 'dropdown',
					id: 'transition_type_type',
					label: 'Transition Type:',
					default: 'Cut',
					choices: [
						{ id: 'Cut', label: 'Cut' },
						{ id: 'Fade', label: 'Fade' },
					]
				}
			]
		}
		});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var login = '<setup version="1" > <username>' + self.config.user + '</username> <password>' + self.config.pass + '</password> <needack>' + self.config.need_ack + '</needack> </setup> ';


	switch(action.action) {

		case 'login':
			cmd = login;
			break;

		case 'recall_layout':
			cmd = login + '<recall_layout id="' + action.options.recall_id + '" advance="' + action.options.recall_advance + '" needack="' + self.config.need_ack + '"/>';
			break;

		case 'switch_video':
			cmd = login + '<video><connect input_id="' + action.options.switch_video_input_id + '" output_id="' + action.options.switch_video_output_id + '" channel="' + action.options.switch_video_channel + '"/></video>';
			break;

		case 'switch_audio':
			cmd = login + '<audio><connect input_id="' + action.options.switch_audio_input_id + '" output_id="' + action.options.switch_audio_output_id + '"/></audio>';
			break;

		case 'transition_type':
			cmd = login + '<config_misc needack="' + action.options.transition_type_ack + '"><transition duration="' + action.options.transition_type_duration + '">' + action.options.transition_type_type + '</transition></config_misc>';
			break;
	}

		if (cmd !== undefined) {

				debug('sending ',cmd,"to",self.config.host);

				if (self.socket !== undefined && self.socket.connected) {
						self.socket.send(cmd);
				}
				else {
						debug('Socket not connected :(');
				}
		}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
