chrome.runtime.onMessage.addListener( data => {
	if ( data.type === 'notification' ) {
		notify( data.message );
	}
});

chrome.runtime.onInstalled.addListener( () => {
	chrome.contextMenus.create({
		id: 'notify',
		title: "Notify!: %s", 
		contexts:[ "selection" ]
	});
});

chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
	if ( 'notify' === info.menuItemId ) {
		notify( info.selectionText );
	}
} );

const notify = message => {
	var endpointUrl = 'https://z5a6imy452.execute-api.us-west-2.amazonaws.com/Prod/comprehend-api';

	var body = {
		"operation": "detect",
		"payload": {
			"message": message
		}
	};

	fetch(endpointUrl,
		{
			method: 'POST',
			mode:	'no-cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify( body )
		})
		.then(r => r)
		.then(response => {
			// update notification count
			chrome.storage.local.get( ['notifyCount'], data => {
				let value = data.notifyCount || 0;
				chrome.storage.local.set({ 'notifyCount': Number( value ) + 1 });
			} );

			// transform response to result
			result = JSON.stringify( response );

			// create notification with result
			return chrome.notifications.create(
				'',
				{
					type: 'basic',
					title: 'Notify!',
					message: result || 'Notify!',
					iconUrl: './assets/icons/128.png',
				}
			);
	})
};
