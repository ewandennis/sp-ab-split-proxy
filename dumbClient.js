var http = require('http');

var options = {
	host: 'localhost',
	port: 9000,
	path: '/bob',
	method: 'POST',
	headers: {
		'Content-type': 'application/json'
	}
};

var testreq = http.request(options, function (resp) {
	for (var h in resp.headers) {
		console.log(h + ' -> ' + resp.headers[h]);
	}
	resp.pipe(process.stdout);
});

testreq.write(JSON.stringify({
	subrequests: [
		{weight: 0.25, name: 'request 1', requestid: 1},
		{weight: 0.25, name: 'request 2', requestid: 2},
		{weight: 0.5, name: 'request 3', requestid: 3}
	],

	name: 'Bob',
	requestid: -1
}));

testreq.end();
