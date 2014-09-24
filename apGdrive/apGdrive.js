(function () {
    //'use strict';
	angular.module('apGdrive', [])	
    .directive('apGdrive',['$window','$q', function($window, $q) {
	  return {
		restrict: 'A',
		replace: true,
		template: '<input type="file" id="filePicker" style="display: none" />',
		 scope: {
                apSuccess: '=',
				apIsdone: '='
            },
		link: function(scope, elem, attrs) {			
			var poll;
			var timeout = 100; // 10 seconds timeout
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://apis.google.com/js/client.js';
			document.body.appendChild(script);
			 /**
			   * Checking for the availability of the gapi client script
			   *
			   */
			poll = function () {
			  setTimeout(function () {
			   console.log('gapi loading');
				timeout--;
				if (typeof gapi !== 'undefined') {
				  // External file loaded
				  console.log('gapi loaded');
				 handleClientLoad();
				}
				else if (timeout > 0) {			
				  poll();
				}
				else {
				  // External library failed to load
				}
			  }, 100);
			};

			poll();
	
			  scope.apIsdone = true;
			  var CLIENT_ID = 'Client-ID'
			
			  
			  var SCOPES = 'https://www.googleapis.com/auth/drive';
				
			  /**
			   * Called when the client library is loaded to start the auth flow.
			   */
			  function handleClientLoad() {
				window.setTimeout(checkAuth, 1);			
			  }			 
			  /**
			   * Check if the current user has authorized the application.
			   */
				function checkAuth() {
				gapi.auth.authorize(
					{'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
					handleAuthResult);
			  }
				function clickAuth() {
				gapi.auth.authorize(
						  {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
						  handleAuthResult);
			}
			  /**
			   * Called when authorization server replies.
			   *
			   * @param {Object} authResult Authorization result.
			   */
			  function handleAuthResult(authResult) {
			   // var authButton = document.getElementById('authorizeButton');
				var filePicker = document.getElementById('filePicker');
				//authButton.style.display = 'none';
				filePicker.style.display = 'none';
				if (authResult && !authResult.error) {
				 // Access token has been successfully retrieved, requests can be sent to the API.
				  filePicker.style.display = 'block';
				  filePicker.onchange = uploadFile;
				} else {
				  // No access token could be retrieved, show the button to start the authorization flow.
				  //authButton.style.display = 'block';
				  //authButton.onclick = function() {
					  gapi.auth.authorize(
						  {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
						  handleAuthResult);
				  //};
				}
			  }

			  /**
			   * Start the file upload.
			   *
			   * @param {Object} evt Arguments from the file selector.
			   */
			  function uploadFile(evt) {
				gapi.client.load('drive', 'v2', function() {
				  var file = evt.target.files[0];
				  insertFile(file);
				});
			  }

			  /**
			   * Insert new file.
			   *
			   * @param {File} fileData File object to read data from.
			   * @param {Function} callback Function to call when the request is complete.
			   */
			  function insertFile(fileData, callback) {
			 
				const boundary = '-------314159265358979323846';
				const delimiter = "\r\n--" + boundary + "\r\n";
				const close_delim = "\r\n--" + boundary + "--";

				var reader = new FileReader();
				reader.readAsBinaryString(fileData);
				reader.onload = function(e) {
				 scope.apIsdone = false;
				  scope.$apply();
				  var contentType = fileData.type || 'application/octet-stream';
				  var metadata = {
					'title': fileData.name,
					'mimeType': contentType
				  };

				  var base64Data = btoa(reader.result);
				  var multipartRequestBody =
					  delimiter +
					  'Content-Type: application/json\r\n\r\n' +
					  JSON.stringify(metadata) +
					  delimiter +
					  'Content-Type: ' + contentType + '\r\n' +
					  'Content-Transfer-Encoding: base64\r\n' +
					  '\r\n' +
					  base64Data +
					  close_delim;

				  var request = gapi.client.request({
					  'path': '/upload/drive/v2/files',
					  'method': 'POST',
					  'params': {'uploadType': 'multipart'},
					  'headers': {
						'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
					  },
					  'body': multipartRequestBody});
				  if (!callback) {
					callback = function(file) {
					 // console.log(file)
					  
					  scope.apSuccess = file;
					  scope.apIsdone = true;
					  scope.$apply();
					};
				  }
				  request.execute(callback);
				}
			  }
		}
	
	  };
	}])	;

	
	
})();